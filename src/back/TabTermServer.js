'use strict'

const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const Promise = require('bluebird')
const _ = require('lodash')
const opn = require('opn')
const crypto = require('crypto')

const Session = require('./Session')

class TabTermServer {
  constructor (opts) {
    this.opts = opts
    this.sessions = {}
    this.initApp()
  }

  initApp () {
    var app = this.app = express()
    var server = this.server = http.Server(app)
    var io = this.io = socketio(server)
    var sessions = this.sessions

    app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')))
    io.on('connection', socket => {
      socket.once('init', opts => {
        var sessionId = opts.sessionId
        if (!sessionId) do {
          opts.sessionId = sessionId = crypto.createHash('md5').update(Math.random().toString()).digest('hex')
        } while (sessionId in sessions)
        var session = sessions[sessionId]
        var sessionPrefixStr = `${this.url}#/session/${sessionId} `
        console.log(`${sessionPrefixStr}connect (${session ? "existing" : "new"} session)`)
        if (session) {
          session.term.redraw() // redraw on session reconnect
        } else {
          session = new Session(_.merge({}, this.opts.session, opts))
          sessions[sessionId] = session
          session.on('destroy', () => {
            let openSessionCount = Object.keys(sessions).length
            console.log(`${sessionPrefixStr}destroy, ${openSessionCount} session${openSessionCount === 1 ? "" : "s"} remaining`)
            delete sessions[sessionId]
          })
        }
        session.registerSocket(socket)
        session.on('deregister', deregisteredSocket => {
          if (socket !== deregisteredSocket) return
          console.log(`${sessionPrefixStr}disconnect, ${session.sockets.length} socket${session.sockets.length === 1 ? "" : "s"} still attached to the session`)
        })
        socket.on('error', err => { console.error(`${sessionPrefixStr}${(err || {}).stack || err || "unknown error"}`) })
      })
    })
  }

  listen () {
    return new Promise(resolve => { this.server.listen(this.opts.port, this.opts.hostname, resolve) })
      .then(() => {
        this.address = this.server.address()
        return this.address
      })
  }

  get url () {
    return this.address && `http://${this.address.address}:${this.address.port}`
  }

  main () {
    this.listen()
      .tap(() => {
        let url = this.url
        console.error(`TabTermServer started: ${url}`)
        if (this.opts.open) {
          console.error("(opts.open = true, opening)")
          opn(url)
        }
      })
      .done()
  }
}

module.exports = TabTermServer
