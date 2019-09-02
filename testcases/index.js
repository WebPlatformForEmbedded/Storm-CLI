import fs from 'fs'
import path from 'path'

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

const testcases = read(__dirname)
  .filter(file => /\.test\.js/.test(file))
  .map(file => require(file).default)

export default testcases
