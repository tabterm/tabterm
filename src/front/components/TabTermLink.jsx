import React from 'react'
import {Link} from 'react-router'
import activeComponent from 'react-router-active-component'

export default ({children, tag=Link, ...props}) => {
  const LinkComponent = typeof tag === 'string' ? activeComponent(tag) : tag
  return (
    <LinkComponent {...props} activeClassName="active">
      {children}
    </LinkComponent>
  )
}
