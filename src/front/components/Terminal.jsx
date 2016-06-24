import React from 'react'
import _ from 'lodash'
import $ from 'jquery'
import io from 'socket.io-client'
import Xterm from 'xterm'
import 'xterm/addons/fit/fit'

import contextTypes from './contextTypes'

export default React.createClass({
  contextTypes,
  statics: {
    initialState: {
      socketBuffer: {}
    },
    defaultProps: {
      socketURL: (({protocol, hostname, port}) => `ws${protocol === 'https:' ? 's' : ''}://${hostname}${port ? `:${port}` : ''}`)(document.location),
      xtermOpts: {},
      sessionOpts: {}
    }
  },
  getInitialState () { return _.cloneDeep(this.constructor.initialState) },
  getDefaultProps () { return _.cloneDeep(this.defaultProps) },
  componentDidMount () {
    this.initXterm()
    this.connect()

    $(window).on('resize', this.fitXterm)
  },
  componentDidUpdate (prevProps) {
    let {sessionOpts, socketURL} = this.props
    if (!_.isEqual(sessionOpts, prevProps.sessionOpts) || socketURL !== prevProps.socketURL) this.connect()
  },
  initXterm () {
    this.xterm = new Xterm(this.props.xtermOpts)
    this.xterm.open(this.refs.root)
    this.xterm.on('data', this.emitXterm)
    this.xterm.on('resize', this.emitResize)
    this.xterm.on('title', this.setTitle)
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
    socket.emit('init', _.merge(sessionId ? {sessionId} : {}, sessionOpts))
  },
  onSession (sessionId) {
    this.context.router.push(`/session/${sessionId}`)
    this.fitXterm()
  },
  onPTY (data) {
    this.xterm.write(data)
  },
  setTitle (title) {
    this.context.tabterm.setState({title})
  },
  socketEmit (evt, ...args) {
    let {socket, state} = this
    let {socketBuffer} = state
    socketBuffer[evt] = [...(socketBuffer[evt] || []), args]
    this.setState({socketBuffer})
    if (!socket) return
    socketBuffer[evt]
      .splice(0, Infinity)
      .forEach(bufferedArgs => { socket.emit(evt, ...bufferedArgs) })
  },
  emitXterm (data) {
    this.socketEmit('xterm', data)
  },
  emitResize ({rows, cols}) {
    this.socketEmit('resize', {rows, cols})
  },
  fitXterm () {
    this.xterm.fit()
  },
  componentWillUnmount () {
    $(window).off('resize', this.fitXterm)
  },

  render () {
    return (
      <div ref="root" className="full-height"></div>
    )
  }
})
