import Inquirer from 'inquirer'
import CheckboxPlus from 'inquirer-checkbox-plus-prompt'
import Chalk from 'chalk'
import Contra from 'contra'
import Moment from 'moment'

import StormRunner from 'storm'
import StormTestcases from 'storm-testcases'
import MyTestcases from '../testcases'
import Reporter from './reporter'

import Config from '../config'

const Testcases = [...MyTestcases, ...StormTestcases]

Inquirer.registerPrompt('checkbox-plus', CheckboxPlus)

// construct a list of tests to show as options
const listTestcases = tests => {
  let maxTitleLength = tests.reduce((max, test) => {
    return Math.max(test.title.length, max)
  }, 0)

  return tests.map((test, index) => {
    return {
      name: [
        test.title,
        // make sure each title is the same length
        ' '.repeat(maxTitleLength - test.title.length),
        '\t',
        Chalk.dim(test.description),
      ].join(' '),
      value: index,
      short: test.title,
    }
  })
}

// clear console
const clearConsole = () => {
  process.stdout.write('\x1b[2J')
  process.stdout.write('\x1b[0f')
}

let start
const startRunning = () => {
  start = Moment()
  console.log(
    Chalk.yellow(
      [
        renderSeparator('='),
        center('Starting TestRunner'),
        center(start.format('DD-MM-YYYY h:mm:s')),
        renderSeparator('='),
      ].join('\n')
    )
  )
}

const finishRunning = tests => {
  let end = Moment()
  let duration = Moment.duration(end.diff(start))
  if (duration.asSeconds() < 60) {
    duration = duration.asSeconds() + ' seconds'
  } else {
    duration = duration.asMinutes() + ' minutes'
  }
  console.log(
    Chalk.yellow(
      [
        renderSeparator('='),
        center('Finished running tests'),
        center(end.format('DD-MM-YYYY h:mm:s')),
        center(['Duration:', duration].join(' ')),
        renderSeparator('='),
      ].join('\n')
    )
  )

  Inquirer.prompt([
    {
      type: 'expand',
      message: [
        'Press',
        Chalk.yellow('R'),
        'to run again or',
        Chalk.yellow('M'),
        'to go back to the menu',
      ].join(' '),
      name: 'RUN_AGAIN',
      choices: [
        {
          key: 'R',
          name: 'Run tests again',
          value: true,
        },
        {
          key: 'M',
          name: 'Back to menu',
          value: false,
        },
      ],
    },
  ]).then(answers => {
    answers.RUN_AGAIN === true ? run(tests) : menu()
  })
}

const renderSeparator = separator => {
  return Chalk.dim((separator || '-').repeat(process.stdout.columns))
}

const center = str => {
  return ' '.repeat((process.stdout.columns - str.length) / 2) + str
}
const run = tests => {
  Contra.each.series(
    tests,
    (test, next) => {
      StormRunner(Testcases[test], Reporter(), Config.thunder)
        .then(() => {
          setTimeout(next, 1000)
        })
        .catch(e => {})
    },
    () => {
      finishRunning(tests)
    }
  )
}

const menu = async () => {
  clearConsole()

  const tests = listTestcases(Testcases)
  const questions = [
    {
      type: 'checkbox-plus',
      name: 'TESTS',
      message: [
        [
          'Select the test(s) you want to execute using the',
          Chalk.yellow('spacebar'),
          'then press',
          Chalk.yellow('enter'),
          'to start the Testrunner!',
        ].join(' '),
        [Chalk.yellow('➜'), Chalk.dim('Search by title / description:')].join(' '),
      ].join('\n'),
      searchable: true,
      source: (selected, input) => {
        return new Promise(function(resolve) {
          resolve(
            tests.filter(test => {
              return test.name.toLowerCase().includes(input.toLowerCase())
            })
          )
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]

  Inquirer.prompt(questions).then(answers => {
    if (answers.TESTS.length) {
      clearConsole()
      startRunning()

      run(answers.TESTS)
    } else {
      console.log(Chalk.red('Please select 1 or more tests to run!'))
      setTimeout(() => {
        menu()
      }, 1000)
    }
  })
}

menu()
