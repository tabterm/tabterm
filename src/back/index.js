#!/usr/bin/env node

module.exports = require('./TabTermServer')

if (require.main === module) module.exports.getDefaultOpts().then(opts => new module.exports(opts).start()).done()
