import React from 'react'
import Helmet from 'react-helmet'
import qs from 'qs'
import _ from 'lodash'

import TabTermMenu from './TabTermMenu.jsx'
import Settings from './Settings.jsx'
import Terminal from './Terminal.jsx'
import contextTypes from './contextTypes'

import pkg from '../../../package'

export const CTRL_RE = /Ctrl-/i;
export const RESERVED_BROWSER_BINDINGS = ['Ctrl-Alt-I', 'Ctrl-L', 'Ctrl-R'].reduce((bs, b) => {
  if (b.match(CTRL_RE)) bs.push(b.replace(CTRL_RE, 'Meta-'));
  return [...bs, b];
}, []);

export default React.createClass({
  childContextTypes: _.pick(contextTypes, 'tabterm'),
  getChildContext () { return {tabterm: this} },
  contextTypes,
  statics: {
    initialState: {
      settings: {
        maxVisibleAlertCount: 5,
        css: '',
        htermOpts: {
          keybindings: RESERVED_BROWSER_BINDINGS.reduce((keybindings, b) => _.set(keybindings, b, 'PASS'), {})
        },
        sessionOpts: {}
      },
      alerts: [],
      sessions: {}
    }
  },
  getInitialState () { return _.cloneDeep(this.constructor.initialState) },
  componentWillMount () {
    window.tabterm = this.context.app.tabterm = this
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
        settings: {maxVisibleAlertCount, css, htermOpts, sessionOpts}
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

        <Terminal ref="terminal"
          className={children ? 'hide' : ''}
          sessionId={sessionId}
          sessionOpts={sessionOpts}
          htermOpts={htermOpts}
        />

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

          {children}
        </div>

        <TabTermMenu />
      </div>
    )
  }
})
