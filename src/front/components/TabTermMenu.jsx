import React from 'react'

import TabTermLink from './TabTermLink.jsx'

import pkg from '../../../package'

export default React.createClass({
  render () {
    return (
      <div className="tabterm-menu btn-group pull-right">
        <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {/*<span className="glyphicon glyphicon-console" aria-hidden="true" />*/}
          <img src="/assets/logo_white.png" alt=">_" width="32" height="32" />
          {' '}
          <span className="caret" />
        </button>
        <ul className="dropdown-menu">
          <TabTermLink to="/settings" tag="li">Settings</TabTermLink>
          <li role="separator" className="divider" />
          <li>
            <a href={pkg.homepage} title="★, source, issues" target="_blank" data-toggle="tooltip" data-placement="left">
              Homepage on Github
            </a>
          </li>
        </ul>
      </div>
    )
  }
})
