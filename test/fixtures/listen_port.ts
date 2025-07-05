/*
* @Author: zoujie.wzj
* @Date:   2016-01-24 10:39:27
* @Last Modified by:   Zoujie
* @Last Modified time: 2016-02-04 17:17:32
*/

'use strict'

import http from 'http'

const server = http.createServer(function () {
  // empty
})


export default function (port: number) {
  return new Promise<void>((resolve) => {
    server.listen(port, () => {
      resolve(void 0)
    })
  })
}

export const close = function () {
  server.close()
}
