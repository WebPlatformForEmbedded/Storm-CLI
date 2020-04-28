import Chalk from 'chalk'

const renderSeparator = separator => {
  return Chalk.dim((separator || '-').repeat(process.stdout.columns))
}

const center = str => {
  return ' '.repeat((process.stdout.columns - str.length) / 2) + str
}

const clearConsole = () => {
  process.stdout.write('\x1b[2J')
  process.stdout.write('\x1b[0f')
}

export { renderSeparator, center, clearConsole }
