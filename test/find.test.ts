import assert from 'assert'
import path from 'path'
import cp, { ChildProcessWithoutNullStreams } from 'child_process'
import find from '../dist/index.js'
import pkg from '../package.json'
import listen, { close } from './fixtures/listen_port'

describe('Find process test', function () {
  this.timeout(10000);

  it('should run the bin/find-process.js', function () {
    const binPrefix = (process.platform == 'win32' ? 'node.exe ' : '');
    const result = cp.execSync(binPrefix + './dist/bin/find-process.js -V').toString()
    assert.equal(result.trim(), pkg.version)
  })

  it('should find process of listenning port', function () {
    return listen(12345)
      .then(function () {
        return (find as any)('port', 12345)
          .then(function (list: any[]) {
            close()

            assert(list.length === 1)
            assert.equal(process.pid, list[0].pid)
          }, function (err: any) {
            close()

            assert(false, err.stack || err)
          })
      })
  })

  it('should find process of pid', function (done) {
    const file = path.join(__dirname, 'fixtures/child_process.js')
    const cps: ChildProcessWithoutNullStreams = cp.spawn(process.execPath, [file]);

    (find as any)('pid', cps.pid)
      .then(function (list: any[]) {
        cps.kill()

        assert(list.length === 1)
        assert.equal(cps.pid, list[0].pid)
        done()
      }, function (err: any) {
        cps.kill()

        done(err)
      })
  })

  it('should find process list matched given name', function (done) {
    const file = path.join(__dirname, 'fixtures/child_process.js')
    const cps: ChildProcessWithoutNullStreams = cp.spawn(process.execPath, [file, 'AAABBBCCC']);

    (find as any)('name', 'AAABBBCCC')
      .then(function (list: any[]) {

        assert(list.length === 1)
        assert.equal(cps.pid, list[0].pid)

        // test strict mode
        return (find as any)('name', 'node', true)
      }).then(function (list: any[]) {
        for (let item of list) {
          assert.equal(item.name, process.platform == 'win32' ? 'node.exe' : 'node');
        }
      }).then(() => cps.kill()).then(() => done()).catch(function (err: any) {
        cps.kill()

        done(err)
      });
  })

    it('should find process list matched given regexp', function (done) {
    const file = path.join(__dirname, 'fixtures/child_process.js')
    const cps: ChildProcessWithoutNullStreams = cp.spawn(process.execPath, [file, 'AAABBBCCC']);

    (find as any)('name', /A{2,3}B{2,3}C{2,3}/gi)
      .then(function (list: any[]) {
        cps.kill()

        assert(list.length === 1)
        assert.equal(cps.pid, list[0].pid)
        done()
      }, function (err: any) {
        cps.kill()

        done(err)
      })
  })

  it('should resolve empty array when pid not exists', function (done) {
    (find as any)('port', 100000)
      .then(function (list: any[]) {
        assert(list.length === 0)
      }).then(done).catch((err: any) => done(err))
  })
}) 