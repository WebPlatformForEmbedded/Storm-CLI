import fs from 'fs'

const testcases = []

fs.readdirSync(__dirname).forEach(file => {
  if (__dirname + '/' + file !== __filename && /\.js/.test(file)) {
    testcases.push(require(__dirname + '/' + file).default)
  }
})

export default testcases
