const rc = require('rc')

const pkg = require('./package')

const env = process.env

module.exports = rc(pkg.name, {
  hostname: env.HOSTNAME || 'localhost',
  port: parseInt(env.PORT, 10) || 7473,
  open: false,
  session: {
    timeoutMs: 5*60*1000, // 5 minutes
    pty: {
      file: env.SHELL,
      args: [],
      opt: {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: env.HOME,
        env: env
      }
    }
  }
})
