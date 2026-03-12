import assert from 'assert'
import utils from '../src/utils'
import findPidByPort from '../src/find_pid'

type ExecCallback = (error: Error | null, stdout: string, stderr: string) => void

const originalExec = utils.exec
const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!

const NOT_FOUND = { error: new Error('command not found') }

// Headers matching real command output (stripped during parsing, but must be present)
const SS_HDR = 'Netid State  Recv-Q Send-Q   Local Address:Port   Peer Address:Port Process\n'
const NETSTAT_LINUX_HDR =
  'Active Internet connections (only servers)\n' +
  'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n'
const NETSTAT_DARWIN_HDR =
  'Active Internet connections (including servers)\n' +
  'Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)     rhiwat shiwat    pid   epid\n'
const NETSTAT_SEQUOIA_HDR =
  'Active Internet connections (including servers)\n' +
  'Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)     rhiwat shiwat  rxbytes  txbytes    pid   epid\n'
const LSOF_HDR = 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\n'
const NETSTAT_WIN32_HDR =
  '\r\nActive Connections\r\n\r\n' +
  '  Proto  Local Address          Foreign Address        State           PID\r\n'

function mockExec(responses: Record<string, { stdout?: string; stderr?: string; error?: Error }>) {
  utils.exec = function (cmd: string, callback: ExecCallback) {
    for (const [pattern, resp] of Object.entries(responses)) {
      if (cmd.includes(pattern)) {
        if (resp.error) {
          callback(resp.error, '', resp.stderr || '')
        } else {
          callback(null, resp.stdout || '', resp.stderr || '')
        }
        return
      }
    }
    callback(new Error(`Command not mocked: ${cmd}`), '', '')
  } as any
}

function setPlatform(platform: string) {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true })
}

describe('findPidByPort fallback logic', function () {
  afterEach(function () {
    utils.exec = originalExec
    Object.defineProperty(process, 'platform', originalPlatform)
  })

  describe('Linux', function () {
    beforeEach(function () { setPlatform('linux') })

    it('ss succeeds', function () {
      mockExec({
        'ss -tunlp': { stdout: SS_HDR + 'tcp   LISTEN 0 128 0.0.0.0:3000 0.0.0.0:* users:(("node",pid=1234,fd=19))\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 1234))
    })

    it('ss with IPv6 address', function () {
      mockExec({
        'ss -tunlp': { stdout: SS_HDR + 'tcp   LISTEN 0 128 [::]:3000 [::]:* users:(("node",pid=4321,fd=19))\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 4321))
    })

    it('ss fails → netstat succeeds', function () {
      mockExec({
        'ss -tunlp': NOT_FOUND,
        'netstat -tunlp': { stdout: NETSTAT_LINUX_HDR + 'tcp   0   0 0.0.0.0:3000   0.0.0.0:*   LISTEN   5678/node\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 5678))
    })

    it('ss + netstat fail → lsof succeeds', function () {
      mockExec({
        'ss -tunlp': NOT_FOUND,
        'netstat -tunlp': NOT_FOUND,
        'lsof -nP -i :3000': { stdout: LSOF_HDR + 'node   9999 user  19u  IPv4 12345  0t0  TCP *:3000 (LISTEN)\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 9999))
    })

    it('permission issues (no PID visible) → falls through to lsof', function () {
      mockExec({
        'ss -tunlp': { stdout: SS_HDR + 'tcp   LISTEN 0 128 0.0.0.0:3000 0.0.0.0:*\n' },
        'netstat -tunlp': {
          stdout: NETSTAT_LINUX_HDR + 'tcp   0   0 0.0.0.0:3000   0.0.0.0:*   LISTEN   -\n',
          stderr: '(Not all processes could be identified)'
        },
        'lsof -nP -i :3000': { stdout: LSOF_HDR + 'node   7777 user  19u  IPv4 12345  0t0  TCP *:3000 (LISTEN)\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 7777))
    })

    it('all three fail → rejects', function () {
      mockExec({ 'ss -tunlp': NOT_FOUND, 'netstat -tunlp': NOT_FOUND, 'lsof -nP -i :3000': NOT_FOUND })
      return assert.rejects(findPidByPort(3000))
    })

    it('lsof returns first PID from multiple rows', function () {
      mockExec({
        'ss -tunlp': NOT_FOUND,
        'netstat -tunlp': NOT_FOUND,
        'lsof -nP -i :3000': {
          stdout: LSOF_HDR +
            'node   1111 user  19u  IPv4 12345  0t0  TCP *:3000 (LISTEN)\n' +
            'node   2222 user  20u  IPv4 12346  0t0  TCP 127.0.0.1:3000 (LISTEN)\n'
        }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 1111))
    })

    it('lsof header-only output → rejects', function () {
      mockExec({ 'ss -tunlp': NOT_FOUND, 'netstat -tunlp': NOT_FOUND, 'lsof -nP -i :3000': { stdout: LSOF_HDR } })
      return assert.rejects(findPidByPort(3000))
    })
  })

  describe('macOS (darwin)', function () {
    beforeEach(function () { setPlatform('darwin') })

    it('netstat succeeds', function () {
      mockExec({
        'netstat -anv': { stdout: NETSTAT_DARWIN_HDR + 'tcp4   0   0  *.3000   *.*   LISTEN   131072 131072   2222   0\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 2222))
    })

    it('netstat Sequoia format (rxbytes)', function () {
      mockExec({
        'netstat -anv': { stdout: NETSTAT_SEQUOIA_HDR + 'tcp4   0   0  *.3000   *.*   LISTEN   131072 131072   0   0   3333   0\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 3333))
    })

    it('netstat fails → lsof succeeds', function () {
      mockExec({
        'netstat -anv': NOT_FOUND,
        'lsof -nP -i :3000': { stdout: LSOF_HDR + 'node   8888 user  19u  IPv4 12345  0t0  TCP *:3000 (LISTEN)\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 8888))
    })

    it('netstat no match → lsof succeeds', function () {
      mockExec({
        'netstat -anv': { stdout: NETSTAT_DARWIN_HDR },
        'lsof -nP -i :3000': { stdout: LSOF_HDR + 'node   6666 user  19u  IPv4 12345  0t0  TCP *:3000 (LISTEN)\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 6666))
    })

    it('netstat with processname:pid format', function () {
      mockExec({
        'netstat -anv': { stdout: NETSTAT_DARWIN_HDR + 'tcp4   0   0  *.3000   *.*   LISTEN   131072 131072   node:2222   0\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 2222))
    })

    it('both fail → rejects', function () {
      mockExec({ 'netstat -anv': NOT_FOUND, 'lsof -nP -i :3000': NOT_FOUND })
      return assert.rejects(findPidByPort(3000))
    })
  })

  describe('Windows', function () {
    beforeEach(function () { setPlatform('win32') })

    it('netstat -ano succeeds', function () {
      mockExec({
        'netstat -ano': { stdout: NETSTAT_WIN32_HDR + '  TCP    0.0.0.0:3000   0.0.0.0:0   LISTENING   4444\r\n' }
      })
      return findPidByPort(3000).then(pid => assert.strictEqual(pid, 4444))
    })

    it('netstat -ano stderr → rejects', function () {
      mockExec({
        'netstat -ano': { stdout: '', stderr: 'access denied' }
      })
      return assert.rejects(findPidByPort(3000), /access denied/)
    })

    it('netstat -ano no match → rejects', function () {
      mockExec({
        'netstat -ano': { stdout: NETSTAT_WIN32_HDR + '  TCP    0.0.0.0:8080   0.0.0.0:0   LISTENING   5555\r\n' }
      })
      return assert.rejects(findPidByPort(3000))
    })
  })
})
