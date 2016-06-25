import React from 'react'
import {Router, Route, IndexRedirect, hashHistory} from 'react-router'
import _ from 'lodash'

import TabTerm from './TabTerm.jsx'
import Settings from './Settings.jsx'
import contextTypes from './contextTypes'

export default React.createClass({
  childContextTypes: _.pick(contextTypes, 'app'),
  getChildContext () { return {app: this} },
  focusTerminal () {
    process.nextTick(() => {
      this.tabterm.refs.terminal.hterm.focus()
    })
  },
  render () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={TabTerm}>
          <IndexRedirect to="session" />
          <Route path="session(/:sessionId)" component={null} onEnter={this.focusTerminal} />
          <Route path="settings" component={Settings} />
          {/*<Route path="*" component={NoMatch} />*/}
        </Route>
      </Router>
    )
  }
})
