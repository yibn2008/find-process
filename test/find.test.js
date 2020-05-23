/*
* @Author: zoujie.wzj
* @Date:   2016-01-24 10:35:16
* @Last Modified by: Ayon Lee
* @Last Modified on: 2018-10-19
*/

'use strict'

const assert = require('assert')
const path = require('path')
const cp = require('child_process')
const find = require('..')
const listen = require('./fixtures/listen_port')

describe('Find process test', function () {
  this.timeout(10000);
  it('should find process of listenning port', function () {
    return listen(12345)
      .then(function () {
        return find('port', 12345)
          .then(function (list) {
            listen.close()

            assert(list.length === 1)
            assert.equal(process.pid, list[0].pid)
          }, function (err) {
            listen.close()

            assert(false, err.stack || err)
          })
      })
  })

  it('should find process of pid', function (done) {
    let file = path.join(__dirname, 'fixtures/child_process.js')
    let cps = cp.spawn(process.execPath, [file])

    find('pid', cps.pid)
      .then(function (list) {
        cps.kill()

        assert(list.length === 1)
        assert.equal(cps.pid, list[0].pid)
        done()
      }, function (err) {
        cps.kill()

        done(err)
      })
  })

  it('should find process list matched given name', function (done) {
    let file = path.join(__dirname, 'fixtures/child_process.js')
    let cps = cp.spawn(process.execPath, [file, 'AAABBBCCC'])

    find('name', 'AAABBBCCC')
      .then(function (list) {

        assert(list.length === 1)
        assert.equal(cps.pid, list[0].pid)

        // test strict mode
        return find('name', 'node', true)
      }).then(function (list) {
        for (let item of list) {
          assert.equal(item.name, process.platform == 'win32' ? 'node.exe' : 'node');
        }
      }).then(() => cps.kill()).then(() => done()).catch(function (err) {
        cps.kill()

        done(err)
      });
  })

  it('should resolve empty array when pid not exists', function (done) {
    find('port', 100000)
      .then(function (list) {
        assert(list.length === 0)
      }).then(done).catch(err => done(err))
  })
})
