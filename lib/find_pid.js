/*
* @Author: zoujie.wzj
* @Date:   2016-01-22 19:27:17
* @Last Modified by:   Zoujie
* @Last Modified time: 2016-02-04 17:14:23
*/

'use strict'

// find pid by port

const cp = require('child_process')
const utils = require('./utils')

const finders = {
  darwin (port) {
    return new Promise((resolve, reject) => {
      cp.exec('netstat -anv -p TCP && netstat -anv -p UDP', function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          // replace header
          let data = utils.stripLine(stdout.toString(), 2)
          let columns = utils.extractColumns(data, [0, 3, 8], 10)
            .filter(column => {
              return !!String(column[0]).match(/^(udp|tcp)/)
            })
            .find(column => {
              let matches = String(column[1]).match(/\.(\d+)$/)
              if (matches && matches[1] === String(port)) {
                return true
              }
            })

          if (columns && columns[2].length) {
            resolve(parseInt(columns[2], 10))
          } else {
            reject(`pid of port (${port}) not found`)
          }
        }
      })
    })
  },
  freebsd: 'darwin',
  sunos: 'darwin',
  linux (port) {
    return new Promise((resolve, reject) => {
      // netstat -p need sudo to run
      let cmd = 'netstat -tunlp'

      if (process.getuid() > 0) {
        cmd = 'sudo ' + cmd
      }

      cp.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          // replace header
          let data = utils.stripLine(stdout.toString(), 2)
          let columns = utils.extractColumns(data, [3, 6], 7).find(column => {
            let matches = String(column[0]).match(/:(\d+)$/)
            if (matches && matches[1] === String(port)) {
              return true
            }
          })

          if (columns && columns[1]) {
            let pid = columns[1].split('/', 1)[0]

            if (pid.length) {
              resolve(parseInt(pid, 10))
            } else {
              reject(`pid of port (${port}) not found`)
            }
          } else {
            reject(`pid of port (${port}) not found`)
          }
        }
      })
    })
  },
  win32 (port) {
    return new Promise((resolve, reject) => {
      cp.exec('netstat -ano', function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          // replace header
          let data = utils.stripLine(stdout.toString(), 4)
          let columns = utils.extractColumns(data, [1, 4], 5).find(column => {
            let matches = String(column[0]).match(/:(\d+)$/)
            if (matches && matches[1] === String(port)) {
              return true
            }
          })

          if (columns && columns[1].length) {
            resolve(parseInt(columns[1], 10))
          } else {
            reject(`pid of port (${port}) not found`)
          }
        }
      })
    })
  }
}

function findPidByPort (port) {
  let platform = process.platform

  return new Promise((resolve, reject) => {
    if (!(platform in finders)) {
      reject(new Error('platform %s is unsupported', platform))
    }

    let findPid = finders[platform]
    if (typeof findPid === 'string') {
      findPid = finders[findPid]
    }

    findPid(port).then(resolve, reject)
  })
}

module.exports = findPidByPort
