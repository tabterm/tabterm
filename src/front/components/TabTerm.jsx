import React from 'react'
import Helmet from 'react-helmet'
import qs from 'qs'
import _ from 'lodash'

import TabTermMenu from './TabTermMenu.jsx'
import Settings from './Settings.jsx'
import Terminal from './Terminal.jsx'
import contextTypes from './contextTypes'

import pkg from '../../../package'

export default React.createClass({
  childContextTypes: _.pick(contextTypes, 'tabterm'),
  getChildContext () { return {tabterm: this} },
  contextTypes,
  statics: {
    initialState: {
      settings: {
        maxVisibleAlertCount: 5,
        css: '',
        xtermOpts: {},
        sessionOpts: {}
      },
      alerts: [],
      sessions: {}
    }
  },
  getInitialState () { return _.cloneDeep(this.constructor.initialState) },
  componentWillMount () {
    this.context.app.tabterm = this
    try {
      this.setState({settings: JSON.parse(localStorage[this.constructor.displayName])})
    } catch (e) {}
  },
  componentDidUpdate (prevProps, prevState) {
    let {state: {settings}, constructor: {displayName}} = this
    if (settings !== prevState.settings) {
      localStorage[displayName] = JSON.stringify(settings)
    }
  },

  alertFromError (err) {
    console.error(err)
    let {alerts} = this.state
    let alert = {
      className: err.className || 'alert-danger',
      children: err.contents || (
        <span>{err.message}</span>
      ),
      err: err
    }
    alerts.push(alert)
    this.setState({alerts})
    return alert
  },
  closeAlert (alertIndex, evt) {
    let {alerts} = this.state
    let closedAlert = alerts.splice(alertIndex, 1)[0]
    this.setState({alerts})
  },

  render () {
    let {
      props: {children, params: {sessionId}},
      state: {alerts, showSettings, title,
        settings: {maxVisibleAlertCount, css, xtermOpts, sessionOpts}
      }
    } = this
    let invisibleAlerts = Math.max(0, alerts.length - maxVisibleAlertCount)
    return (
      <div className="full-height">
        <Helmet
          htmlAttributes={{lang: 'en'}}
          title={title}
          titleTemplate={`%s | ${pkg.name}`}
          defaultTitle={pkg.name}
          meta={[{name: 'description', content: pkg.description}]}
        />
        <style dangerouslySetInnerHTML={{__html: css}}></style>

        <div className={`full-height ${children ? 'hide' : ''}`}>
          <Terminal ref="terminal"
            sessionId={sessionId}
            xtermOpts={xtermOpts} sessionOpts={sessionOpts}
          />
        </div>
        <div className="container">
          {children}
        </div>
        <div className="tabterm-ui">
          <TabTermMenu />
          <div className="container">
            {alerts.slice(0, maxVisibleAlertCount).map((alert, alertIndex) => (
              <div className={`alert ${alert.className}`} role="alert" key={`alert-${alertIndex}`}>
                <button
                  className="close"
                  aria-label="Close"
                  onClick={this.closeAlert.bind(this, alertIndex)}>
                  <span aria-hidden="true">&times;</span>
                </button>
                {alert.children}
              </div>
            ))}
            {invisibleAlerts ? (
              <p className="text-muted">{invisibleAlerts} alert{invisibleAlerts === 1 ? '' : 's'} not shown</p>
            ) : ''}
          </div>
        </div>
      </div>
    )
  }
})
