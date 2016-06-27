import React from 'react'
import $ from 'jquery'

import TabTermLink from './TabTermLink.jsx'

import pkg from '../../../package'

export default React.createClass({
  selectURL (evt) {
    $(evt.target).select()
  },
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
          <li className="tabterm-menu-url">
            URL&nbsp;<input value={document.location.href} className="form-control" readOnly={true} onClick={this.selectURL} />
          </li>
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
