#!/usr/bin/env node

if (require.main === module) {
  const gulp = require('gulp')
  require('../../gulpfile')
  gulp.start('default')
}

module.exports = require('./TabTermServer')
