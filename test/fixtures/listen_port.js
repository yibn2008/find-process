/*
* @Author: zoujie.wzj
* @Date:   2016-01-24 10:39:27
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-01-24 10:49:00
*/

'use strict';

const http = require('http');

let server = http.createServer(function () {
  // empty
});

module.exports = function (port, callback) {
  server.listen(port, callback);
};

module.exports.close = function () {
  server.close();
};
