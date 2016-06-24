import {PropTypes} from 'react'

let componentShape = PropTypes.shape({render: PropTypes.func.isRequired})

export default {
  tabterm: componentShape, // PropTypes.instanceOf(require('./TabTerm.jsx'))
  app: componentShape, // PropTypes.instanceOf(require('./App.jsx'))
  router: PropTypes.shape({push: PropTypes.func.isRequired}) // PropTypes.instanceOf(require('react-router'))
}
