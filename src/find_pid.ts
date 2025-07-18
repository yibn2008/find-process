import * as os from 'os'
import * as fs from 'fs'
import utils from './utils'
import log from './logger'

const ensureDir = (path: string): Promise<void> => new Promise((resolve, reject) => {
  if (fs.existsSync(path)) {
    resolve()
  } else {
    fs.mkdir(path, err => {
      err ? reject(err) : resolve()
    })
  }
})

const finders: Record<string, (port: number) => Promise<number>> = {
  darwin(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      utils.exec('netstat -anv -p TCP && netstat -anv -p UDP', function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          const stderrStr = stderr.toString().trim()
          if (stderrStr) {
            reject(new Error(stderrStr))
            return
          }

          // Drop group header, e.g. "Active Internet connections"
          const table = utils.stripLine(stdout.toString(), 1)
          // Get the next line with the column headers
          const headers = table.slice(0, table.indexOf('\n'))
          // Drop the header line to get the table body
          const body = utils.stripLine(table, 1)

          // In macOS >=Sequoia, columns include `rxbytes` and `txbytes`, which
          // shifts the PID column to index 10. Detect this with a search
          // for rxbytes. (Parsing the headers more robustly isn't possible
          // because some colmn names contain spaces, and others are only separated
          // by a single space.)
          const pidColumn = headers.indexOf('rxbytes') >= 0 ? 10 : 8

          const found = utils.extractColumns(body, [0, 3, pidColumn], 10)
            .filter(row => {
              return !!String(row[0]).match(/^(udp|tcp)/)
            })
            .find(row => {
              const matches = String(row[1]).match(/\.(\d+)$/)
              if (matches && matches[1] === String(port)) {
                return true
              }
              return false
            })

          if (found && found[2].length) {
            resolve(parseInt(found[2], 10))
          } else {
            reject(new Error(`pid of port (${port}) not found`))
          }
        }
      })
    })
  },

  linux(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const cmd = 'netstat -tunlp'

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          const warn = stderr.toString().trim()
          if (warn) {
            // netstat -p ouputs warning if user is no-root
            log.warn(warn)
          }

          // replace header
          const data = utils.stripLine(stdout.toString(), 2)
          const columns = utils.extractColumns(data, [3, 6], 7).find(column => {
            const matches = String(column[0]).match(/:(\d+)$/)
            if (matches && matches[1] === String(port)) {
              return true
            }
            return false
          })

          if (columns && columns[1]) {
            const pid = columns[1].split('/', 1)[0]

            if (pid.length) {
              resolve(parseInt(pid, 10))
            } else {
              reject(new Error(`pid of port (${port}) not found`))
            }
          } else {
            reject(new Error(`pid of port (${port}) not found`))
          }
        }
      })
    })
  },

  win32(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      utils.exec('netstat -ano', function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          const stderrStr = stderr.toString().trim()
          if (stderrStr) {
            reject(new Error(stderrStr))
            return
          }

          // replace header
          const data = utils.stripLine(stdout.toString(), 4)
          const columns = utils.extractColumns(data, [1, 4], 5).find(column => {
            const matches = String(column[0]).match(/:(\d+)$/)
            if (matches && matches[1] === String(port)) {
              return true
            }
            return false
          })

          if (columns && columns[1].length && parseInt(columns[1], 10) > 0) {
            resolve(parseInt(columns[1], 10))
          } else {
            reject(new Error(`pid of port (${port}) not found`))
          }
        }
      })
    })
  },

  android(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      // on Android Termux, an warning will be emitted when executing `netstat`
      // with option `-p` says 'showing only processes with your user ID', but
      // it can still fetch the information we need. However, NodeJS treat this
      // warning as an error, `util.exec()` will get nothing but the error. To
      // get the true output of the command, we need to save it to a tmpfile and
      // read that file instead.
      const dir = os.tmpdir() + '/.find-process'
      const file = dir + '/' + process.pid
      const cmd = 'netstat -tunp >> "' + file + '"'

      ensureDir(dir).then(() => {
        utils.exec(cmd, () => {
          fs.readFile(file, 'utf8', (err, data) => {
            fs.unlink(file, () => { })
            if (err) {
              reject(err)
            } else {
              data = utils.stripLine(data, 2)
              const columns = utils.extractColumns(data, [3, 6], 7).find(column => {
                const matches = String(column[0]).match(/:(\d+)$/)
                if (matches && matches[1] === String(port)) {
                  return true
                }
                return false
              })

              if (columns && columns[1]) {
                const pid = columns[1].split('/', 1)[0]

                if (pid.length) {
                  resolve(parseInt(pid, 10))
                } else {
                  reject(new Error(`pid of port (${port}) not found`))
                }
              } else {
                reject(new Error(`pid of port (${port}) not found`))
              }
            }
          })
        })
      })
    })
  }
}

// Alias for other platforms
finders.freebsd = finders.darwin
finders.sunos = finders.darwin

function findPidByPort(port: number): Promise<number> {
  const platform = process.platform as keyof typeof finders

  return new Promise((resolve, reject) => {
    if (!(platform in finders)) {
      return reject(new Error(`platform ${platform} is unsupported`))
    }

    const finder = finders[platform]
    finder(port).then(resolve, reject)
  })
}

export default findPidByPort 