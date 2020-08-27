import Inquirer from 'inquirer'
import CheckboxPlus from 'inquirer-checkbox-plus-prompt'
import Chalk from 'chalk'
import Contra from 'contra'
import Moment from 'moment'

import StormRunner from 'storm'

import Testcases from '../testcases'
import Reporter from './reporters/index'

import Config from '../config'

import { clearConsole, center, renderSeparator } from './helpers/ui-helpers'

const TestCases = Testcases()
let selectedCategories = []
let writeReports = false

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

let start

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

  console.log()
  console.log(center('Test summary:'))
  tests.forEach((t, index) => {
    console.log(
      center(
        `${index + 1}. ${t.title.slice(0, 40).padEnd(50, ' ')} ${
          t.result !== undefined ? 'PASS' : 'FAIL'
        }`
      )
    )
    if (t.error) console.log(Chalk.red(center(`    ${t.error}`)))
  })
  console.log()
  console.log(Chalk.yellow(renderSeparator('=')))

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
    answers.RUN_AGAIN === true ? run(tests) : showCategories()
  })
}

const run = (tests, reportFilename = null) => {
  start = Moment()
  Contra.map.series(
    tests,
    (test, next) => {
      StormRunner(test, Reporter({ reportFile: reportFilename, ...Config.thunder }), Config.thunder)
        .then(result => {
          test.result = result === undefined ? '' : result
          setTimeout(next, 1000, null)
        })
        .catch(err => {
          console.error(err)
          test.error = err
          setTimeout(next, 1000, null)
        })
    },
    () => {
      finishRunning(tests)
    }
  )
}

const getReportFilename = (writeReports = false) => {
  if (writeReports) {
    return Inquirer.prompt({
      type: 'input',
      name: 'filename',
      message: 'Please provide report filename',
      default: `report-${Moment().format('YYYYMDD-HHmmss')}.txt`,
    }).then(answers => {
      return answers.filename
    })
  } else {
    return Promise.resolve(null)
  }
}

const menu = async (category, selectAll = false) => {
  clearConsole()

  const tests = listTestcases(TestCases[category])
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
          'To go',
          Chalk.red('back'),
          'press enter without selecting a test.',
        ].join(' '),
        [Chalk.yellow('➜'), Chalk.dim('Search by title / description:')].join(' '),
      ].join('\n'),
      searchable: true,
      source: (selected, input) => {
        return new Promise(function(resolve) {
          resolve([
            'Enable writing reports to file',
            'Run all',
            new Inquirer.Separator(),
            ...tests.filter(test => {
              return test.name.toLowerCase().includes(input.toLowerCase())
            }),
          ])
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]

  Inquirer.prompt(questions).then(answers => {
    let writeReports = false

    if (answers.TESTS.indexOf('Enable writing reports to file') !== -1) {
      writeReports = true
    }

    if (answers.TESTS.indexOf('Run all') !== -1) {
      return getReportFilename(writeReports).then(reportFilename =>
        run(TestCases[category], reportFilename)
      )
    }

    if (answers.TESTS.length) {
      getReportFilename(writeReports).then(reportFilename =>
        run(
          TestCases[category].filter((test, index) => {
            if (answers.TESTS.indexOf(index) !== -1) return true
          }),
          reportFilename
        )
      )
    } else {
      showCategories()
    }
  })
}

const menuRunAll = async categories => {
  clearConsole()
  let testCaseList = []
  categories.forEach(category => {
    testCaseList.push(...TestCases[category]) //Create test case list for all the selected categories to run
  })
  // confirm('Do you want to enable reports to a file?')
  //   .then(() => {
  //       writeReports = true
  //       return getReportFilename(writeReports).then(reportFilename => run(testCaseList, reportFilename))
  //     }, ()=> {
  //       writeReports = false
  //       return getReportFilename(writeReports).then(reportFilename => run(testCaseList, reportFilename))
  //     },
  //   )
  const questions = [
    {
      type: 'checkbox-plus',
      name: 'REPORT_ENABLE',
      message: [
        [
          'Select any one of the below choice using',
          Chalk.yellow('spacebar'),
          'then press',
          Chalk.yellow('enter'),
          'to start the Testrunner!',
          'To go',
          Chalk.red('back'),
          'press enter without selecting a choice.',
        ].join(' '),
      ].join('\n'),
      source: (selected, input) => {
        return new Promise(function(resolve) {
          resolve(['Enable writing reports to file', 'Skip writing reports to file'])
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]
  Inquirer.prompt(questions).then(answers => {
    if (answers.REPORT_ENABLE.indexOf('Enable writing reports to file') !== -1) {
      writeReports = true
    }
    if (answers.REPORT_ENABLE.indexOf('Skip writing reports to file') !== -1) {
      writeReports = false
    }
    if (answers.REPORT_ENABLE.length) {
      return getReportFilename(writeReports).then(reportFilename =>
        run(testCaseList, reportFilename)
      )
    } else {
      showCategories()
    }
  })
}
const showCategories = () => {
  clearConsole()

  const categories = Object.keys(TestCases)
  const questions = [
    {
      type: 'checkbox-plus',
      message: [
        [
          'Select',
          Chalk.redBright('Runall'),
          'option to run all the tests',
          Chalk.bgYellow('OR'),
          'Select any of the',
          Chalk.redBright('Category'),
          'to run tests related to specific category.',
          'Press',
          Chalk.yellow('spacebar'),
          'to select the options',
          'and then press',
          Chalk.yellow('enter'),
          'to start the Testrunner!',
        ].join(' '),
      ].join('\n'),
      name: 'CATEGORIES',
      source: () => {
        return new Promise(function(resolve) {
          resolve([
            new Inquirer.Separator(),
            'Run all',
            new Inquirer.Separator(),
            ...categories.filter(category => {
              return category
            }),
          ])
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]
  Inquirer.prompt(questions).then(answers => {
    if (answers.CATEGORIES.indexOf('Run all') !== -1) {
      selectedCategories.push(...categories)
      return menuRunAll(selectedCategories)
    }
    if (answers.CATEGORIES) {
      menu(answers.CATEGORIES)
    }
  })
}

showCategories()
