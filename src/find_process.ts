import * as path from 'path'
import utils from './utils'
import { ProcessInfo, FindCondition, PlatformFinder } from './types'

function matchName(text: string, name: string | RegExp): boolean {
  if (!name) {
    return true
  }
  // make sure text.match is valid, fix #30
  if (text && text.match) {
    return text.match(name) !== null
  }
  return false
}

function fetchBin(cmd: string): string {
  const pieces = cmd.split(path.sep)
  const last = pieces[pieces.length - 1]
  if (last) {
    pieces[pieces.length - 1] = last.split(' ')[0]
  }
  const fixed: string[] = []
  for (const part of pieces) {
    const optIdx = part.indexOf(' -')
    if (optIdx >= 0) {
      // case: /aaa/bbb/ccc -c
      fixed.push(part.substring(0, optIdx).trim())
      break
    } else if (part.endsWith(' ')) {
      // case: node /aaa/bbb/ccc.js
      fixed.push(part.trim())
      break
    }
    fixed.push(part)
  }
  return fixed.join(path.sep)
}

function fetchName(fullpath: string): string {
  if (process.platform === 'darwin') {
    const idx = fullpath.indexOf('.app/')
    if (idx >= 0) {
      return path.basename(fullpath.substring(0, idx))
    }
  }
  return path.basename(fullpath)
}

const finders: Record<string, PlatformFinder> = {
  darwin(cond: FindCondition): Promise<ProcessInfo[]> {
    return new Promise((resolve, reject) => {
      let cmd: string
      if ('pid' in cond && cond.pid !== undefined) {
        cmd = `ps -p ${cond.pid} -ww -o pid,ppid,uid,gid,args`
      } else {
        cmd = 'ps ax -ww -o pid,ppid,uid,gid,args'
      }

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if ('pid' in cond && cond.pid !== undefined) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([])
          } else {
            reject(err)
          }
        } else {
          const stderrStr = stderr.toString().trim()
          if (stderrStr) {
            reject(new Error(stderrStr))
            return
          }

          const data = utils.stripLine(stdout.toString(), 1)
          const columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5).filter(column => {
            if (column[0] && cond.pid !== undefined) {
              return column[0] === String(cond.pid)
            } else if (column[4] && cond.name) {
              return matchName(column[4], cond.name)
            } else {
              return !!column[0]
            }
          })

          let list = columns.map(column => {
            const cmd = String(column[4])
            const bin = fetchBin(cmd)

            return {
              pid: parseInt(column[0], 10),
              ppid: parseInt(column[1], 10),
              uid: parseInt(column[2], 10),
              gid: parseInt(column[3], 10),
              name: fetchName(bin),
              bin,
              cmd: column[4]
            }
          })

          if (cond.config.strict && cond.name) {
            list = list.filter(item => item.name === cond.name)
          }

          resolve(list)
        }
      })
    })
  },

  win32(cond: FindCondition): Promise<ProcessInfo[]> {
    return new Promise((resolve, reject) => {
      const cmd = '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-CimInstance -className win32_process | select Name,ProcessId,ParentProcessId,CommandLine,ExecutablePath'
      const lines: string[] = []

      const proc = utils.spawn('powershell.exe', ['/c', cmd], { detached: false, windowsHide: true })
      proc.stdout.on('data', (data: Buffer) => {
        lines.push(data.toString())
      })
      proc.on('error', (err: Error) => {
        reject(new Error('Command \'' + cmd + '\' failed with reason: ' + err.toString()))
      })
      proc.on('close', (code: number) => {
        if (code !== 0) {
          return reject(new Error('Command \'' + cmd + '\' terminated with code: ' + code))
        }
        const list = utils.parseTable(lines.join(''))
          .filter(row => {
            if (cond.pid !== undefined) {
              return row.ProcessId === String(cond.pid)
            } else if (cond.name) {
              const rowName = row.Name || '' // fix #40
              if (cond.config.strict) {
                return rowName === cond.name || (rowName.endsWith('.exe') && rowName.slice(0, -4) === cond.name)
              } else {
                // fix #9
                return matchName(row.CommandLine || rowName, cond.name)
              }
            } else {
              return true
            }
          })
          .map(row => ({
            pid: parseInt(row.ProcessId, 10),
            ppid: parseInt(row.ParentProcessId, 10),
            bin: row.ExecutablePath,
            name: row.Name || '',
            cmd: row.CommandLine
          }))
        resolve(list)
      })
    })
  },

  android(cond: FindCondition): Promise<ProcessInfo[]> {
    return new Promise((resolve, reject) => {
      const cmd = 'ps'

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if (cond.pid !== undefined) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([])
          } else {
            reject(err)
          }
        } else {
          const stderrStr = stderr.toString().trim()
          if (stderrStr) {
            reject(new Error(stderrStr))
            return
          }

          const data = utils.stripLine(stdout.toString(), 1)
          const columns = utils.extractColumns(data, [0, 3], 4).filter(column => {
            if (column[0] && cond.pid !== undefined) {
              return column[0] === String(cond.pid)
            } else if (column[1] && cond.name) {
              return matchName(column[1], cond.name)
            } else {
              return !!column[0]
            }
          })

          let list = columns.map(column => {
            const cmd = String(column[1])
            const bin = fetchBin(cmd)

            return {
              pid: parseInt(column[0], 10),
              ppid: 0,
              name: fetchName(bin),
              bin,
              cmd: column[1]
            }
          })

          if (cond.config.strict && cond.name) {
            list = list.filter(item => item.name === cond.name)
          }

          resolve(list)
        }
      })
    })
  }
}

// Alias for other platforms
finders.linux = finders.darwin
finders.sunos = finders.darwin
finders.freebsd = finders.darwin

function findProcess(cond: FindCondition): Promise<ProcessInfo[]> {
  const platform = process.platform as keyof typeof finders
  const finder = finders[platform]

  if (!finder) {
    return Promise.reject(new Error(`Platform "${platform}" is not supported`))
  }

  return finder(cond)
}

export default findProcess 