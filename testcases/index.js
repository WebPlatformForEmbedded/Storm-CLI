import fs from 'fs'
import path from 'path'

const testcases = []

const read = dir => {
  return fs
    .readdirSync(dir)
    .reduce(
      (files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? files.concat(read(path.join(dir, file)))
          : files.concat(path.join(dir, file)),
      []
    )
}

read(__dirname).forEach(file => {
  if (file !== __filename && /\.js/.test(file)) {
    testcases.push(require(file).default)
  }
})

export default testcases
