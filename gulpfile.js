const gulp = require('gulp')
const gutil = require('gulp-util')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const Promise = require('bluebird')

const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

// js
const browserify = require('browserify')
const watchify = require('watchify')
const uglify = require('gulp-uglify')

// css
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const nano = require('cssnano')

// fonts
const flatten = require('gulp-flatten')

// html
const htmlmin = require('gulp-htmlmin')

const TabTermServer = require('./src/back/TabTermServer')
const config = require('./config')

const src = 'src/front/'
const dist = 'dist/'

var watching = false
var b = watchify(browserify(watchify.args))
  .transform('babelify')
  .add(src+'index.jsx')
  .on('log', gutil.log)

function bundle () {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      // Add transformation tasks to the pipeline here
      .pipe(uglify({compress: {drop_debugger: false}}))
      .on('error', gutil.log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist))
    .on('end', () => { if (!watching) b.close() })
}
gulp.task('build-js', bundle)
gulp.task('build-fonts', () => {
  return gulp.src('**/*.{ttf,woff,woff2,eof,svg}')
    .pipe(flatten())
    .pipe(gulp.dest(path.join(dist, 'fonts')))
})
gulp.task('build-css', () => {
  return gulp.src(src+'less/index.less')
    .pipe(sourcemaps.init())
      // Add transformation tasks to the pipeline here
      .pipe(less())
      .pipe(postcss([nano]))
      .on('error', gutil.log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist))
})
gulp.task('build-html', ['build-js', 'build-css', 'build-fonts'], () => {
  return gulp.src(src+'index.html')
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest(dist))
})
gulp.task('build', ['build-html'])

gulp.task('pre-watch', () => { watching = true })
gulp.task('watch', ['pre-watch', 'build'], () => {
  b.on('update', bundle)
  gulp.watch('**/*.less', ['build-css'])
  gulp.watch('**/*.html', ['build-html'])
})

gulp.task('serve', () => {
  new TabTermServer(config).main()
})

gulp.task('dev', ['watch', 'serve'])
gulp.task('default', ['serve'])
