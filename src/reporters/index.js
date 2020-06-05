import cli from './cli.js'
import file from './file.js'

export default config => {
  const reporters = [cli(config)]
  //if (config.reportFilename !== null) reporters.push(file(config))

  const relayMessage = (fn, ...args) => {
    reporters.forEach(r => {
      r[fn].call(null, ...args)
    })
  }

  return {
    init(...args) {
      relayMessage('init', ...args)
    },
    step(...args) {
      relayMessage('step', ...args)
    },
    log(...args) {
      relayMessage('log', ...args)
    },
    sleep(...args) {
      relayMessage('sleep', ...args)
    },
    pass(...args) {
      relayMessage('pass', ...args)
    },
    fail(...args) {
      relayMessage('fail', ...args)
    },
    success(...args) {
      relayMessage('success', ...args)
    },
    error(...args) {
      relayMessage('error', ...args)
    },
    finished(...args) {
      relayMessage('finished', ...args)
    },
  }
}
