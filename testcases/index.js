import fs from 'fs'
import path from 'path'

const fileMap = {}

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

export default () => {
  read(__dirname)
    .filter(file => /(node_modules|.git)/.test(file) === false)
    .filter(file => /\.test\.js/.test(file))
    .map(file => {
      const category = path
        .dirname(file)
        .split(path.sep)
        .pop()

      fileMap[category]
        ? fileMap[category].push(require(file).default)
        : (fileMap[category] = [require(file).default])
    })

  return fileMap
}
