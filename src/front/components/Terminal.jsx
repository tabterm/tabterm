import React from 'react'
import _ from 'lodash'
import $ from 'jquery'
import io from 'socket.io-client'
import {hterm, lib} from 'hterm-umdjs'
hterm.defaultStorage = new lib.Storage.Memory() // FIXME: set this on the instance instead of globally

import contextTypes from './contextTypes'

// see also https://github.com/krishnasrinivas/wetty/blob/aa882adcebcdd49b93c11f9162a4e69f83580160/public/wetty/wetty.js
class HtermHandler {
  constructor (argv) {
    this.component = argv.argString

    this.argv_ = argv
    this.io = null
    this.pid_ = -1
  }
  run () {
    let {component: {emitTTY, emitResize}, argv_} = this
    this.io = _.merge(argv_.io.push(), {
      onVTKeystroke: emitTTY,
      sendString: emitTTY,
      onTerminalResize: emitResize
    })
  }
}

export default React.createClass({
  contextTypes,
  statics: {
    defaultProps: {
      socketURL: (({protocol, hostname, port}) => `ws${protocol === 'https:' ? 's' : ''}://${hostname}${port ? `:${port}` : ''}`)(document.location),
      htermOpts: {},
      sessionOpts: {}
    }
  },
  getDefaultProps () { return _.cloneDeep(this.defaultProps) },
  componentDidMount () {
    this.initHterm()
    this.connect()
  },
  componentDidUpdate (prevProps) {
    let {sessionOpts, socketURL} = this.props
    if (!_.isEqual(sessionOpts, prevProps.sessionOpts) || socketURL !== prevProps.socketURL) this.connect()
    this.updateTerminalFromHtermOpts(prevProps.htermOpts)
  },
  initHterm () {
    let t = this.hterm = new hterm.Terminal(this.props.sessionId)
    t.setWindowTitle = this.setTitle
    t.decorate(this.refs.root)
    // t.onTerminalReady = () => {
    //   _.merge(t.io.push(), {
    //     onVTKeystroke: this.emitTTY,
    //     sendString: this.emitTTY,
    //     onTerminalResize: this.emitResize
    //   })
    // }
    t.runCommandClass(HtermHandler, this)
    this.updateTerminalFromHtermOpts()
    t.prefs_.addObservers((key, val) => {
      // FIXME: multiple fires on init
      let {tabterm} = this.context
      let {settings} = tabterm.state
      settings.htermOpts[key] = val
      tabterm.setState({settings})
    })
  },
  updateTerminalFromHtermOpts (prevHtermOpts) {
    _.each(this.props.htermOpts, (val, key) => {
      if (!_.has(prevHtermOpts, key) || val !== _.get(prevHtermOpts, key)) this.hterm.prefs_.set(key, val)
    })
  },
  connect () {
    this.socket = io(this.props.socketURL)
    this.socket.on('connect', this.onConnect)
    this.socket.on('session', this.onSession)
    this.socket.on('pty', this.onPTY)
    this.socket.on('disconnect', this.connect)
  },
  onConnect () {
    let {socket, props: {sessionId, sessionOpts}} = this
    this.hterm.reset()
    this.socketEmit('init', _.merge(sessionId ? {sessionId} : {}, sessionOpts))
  },
  onSession (sessionId) {
    let {router, tabterm: {props: {location: {pathname}}}} = this.context
    if (pathname === '/session') router.push(`/session/${sessionId}`)
    this.initHterm()
  },
  onPTY (data) {
    this.hterm.io.writeUTF16(data)
  },
  setTitle (title) {
    this.context.tabterm.setState({title})
  },
  socketEmit (...args) {
    this.socket.emit(...args)
  },
  emitTTY (data) {
    this.socketEmit('tty', data)
  },
  emitResize (cols, rows) {
    this.socketEmit('resize', {rows, cols})
  },

  render () {
    return (
      <div ref="root" className="full-height"></div>
    )
  }
})
