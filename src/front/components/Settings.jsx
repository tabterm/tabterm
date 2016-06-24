import React from 'react'
import _ from 'lodash'
import $ from 'jquery'

import contextTypes from './contextTypes'

export default React.createClass({
  contextTypes,
  statics: {
    initialState: {}
  },
  getInitialSettings () { return _.cloneDeep(this.context.tabterm.state.settings) },
  getInitialState () { return _.merge({settings: this.getInitialSettings()}, this.constructor.initialState) },
  componentDidMount () {
    $(window).on('keyup', this.onKeyUp)
  },
  componentWillUnmount () {
    $(window).off('keyup', this.onKeyUp)
  },
  save () {
    this.context.tabterm.setState({settings: this.state.settings}, this.cancel)
  },
  cancel () {
    this.setState({settings: this.getInitialSettings()})
    this.context.router.goBack()
  },
  onChange ({target: {name, value}}) {
    let {settings} = this.state
    settings[name] = value
    this.setState({settings})
  },
  onSubmit (evt) {
    evt.preventDefault()
  },
  onKeyUp (evt) {
    if (evt.keyCode === 0x1b) { // escape
      evt.preventDefault()
      this.cancel()
    }
  },
  render () {
    let {state} = this
    let {settings} = state
    return (
      <form className="form-horizontal" onSubmit={this.onSubmit}>
        <div className="page-header">
          <h2>Settings</h2>
        </div>
        <div className="form-group">
          <label htmlFor="settings-form-css" className="col-sm-2 control-label">Custom CSS</label>
          <div className="col-sm-10">
            <textarea name="css" value={settings.css} onChange={this.onChange} className="form-control" rows="5" id="settings-form-css"></textarea>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button onClick={this.save} className="btn btn-primary">Save</button>
            {' '}
            <button onClick={this.cancel} className="btn btn-default">Cancel</button>
          </div>
        </div>
      </form>
    )
  }
})
