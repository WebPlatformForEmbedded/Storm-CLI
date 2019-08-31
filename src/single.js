import fs from 'fs'
import path from 'path'
import StormRunner from 'storm'
import Config from '../config'

const filename = process.argv.slice(2).pop()
const testCasePath = path.join(__dirname, '..', 'testcases', filename)

if (!filename || !fs.existsSync(testCasePath)) {
  console.log('test case "' + testCasePath + '" not found')
} else {
  import(testCasePath)
    .then(testCase => {
      StormRunner(testCase.default, 'console', Config.thunder)
        .then(console.log)
        .catch(console.error)
    })
    .catch(console.error)
}
