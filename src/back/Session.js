'use strict'

const PTY = require('pty.js')
const EventEmitter = require('events').EventEmitter

class Session extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = opts
    this.sockets = []
    let pty = opts.pty
    this.term = new PTY(pty.file, pty.args, pty.opt)
  }
  registerSocket (socket) {
    clearTimeout(this.destroyTimeout)
    socket.emitPTY = this.createEmitPTY(socket)
    this.term.on('data', socket.emitPTY)
    socket.on('tty', data => { this.term.write(data) })
    socket.on('resize', data => { this.term.resize(data.cols, data.rows) })
    socket.on('disconnect', () => { this.deregisterSocket(socket) })
    socket.emit('session', this.opts.sessionId)
    this.sockets.push(socket)
    this.emit('register', socket)
  }
  deregisterSocket (socket) {
    this.term.removeListener('data', socket.emitPTY)
    let sockets = this.sockets
    let i = sockets.indexOf(socket)
    if (i !== -1) sockets.splice(i, 1)
    if (!sockets.length) {
      this.destroyTimeout = setTimeout(() => {
        this.destroy()
      }, this.opts.timeoutMs).unref()
    }
    this.emit('deregister', socket)
  }
  destroy () {
    this.term.kill()
    this.sockets
      .splice(0, Infinity)
      .forEach(socket => { socket.disconnect() })
    this.emit('destroy')
  }
  createEmitPTY (socket) {
    return data => { socket.emit('pty', data) }
  }
}

module.exports = Session
