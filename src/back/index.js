#!/usr/bin/env node

module.exports = require('./TabTermServer')

if (require.main === module) new module.exports(require('../../config')).main()
