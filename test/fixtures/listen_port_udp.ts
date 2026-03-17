'use strict'

import dgram from 'dgram'

const socket = dgram.createSocket('udp4')

export default function (port: number) {
  return new Promise<void>((resolve) => {
    socket.bind(port, () => {
      resolve(void 0)
    })
  })
}

export const close = function () {
  socket.close()
}
