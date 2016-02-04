/*
* @Author: zoujie.wzj
* @Date:   2016-01-24 10:39:27
* @Last Modified by:   Zoujie
* @Last Modified time: 2016-02-04 17:17:32
*/

'use strict'

const http = require('http')

let server = http.createServer(function () {
  // empty
})

module.exports = function (port) {
  return new Promise((resolve, reject) => {
    server.listen(port, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

module.exports.close = function () {
  server.close()
}
