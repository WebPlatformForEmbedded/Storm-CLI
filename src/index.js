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
const runAll = 'Run all'
const runByPlugin = 'Run By Plugin'
const search = 'Search'
const enableReports = 'Enable writing reports to file'
const skipReports = 'Skip writing reports to file'

let writeReports = false
let displayTestCaseList = []
let pluginDataFromController
let testCaseList = []
let testCasesFromTestsFolder
let deviceIpList = []

import ThunderJS from 'ThunderJS'
const thunderJS = ThunderJS(Config.thunder)

/**
 * This method is used to get device Name
 * @returns {Promise<unknown>}
 */
const getDeviceIP = () => {
  return new Promise(resolve => {
    thunderJS.DeviceInfo.addresses()
      .then(result => {
        let names = ['lo', 'tunl0', 'sit0', 'wlan0', 'eth0']
        for (let i = 0; i < result.length; i++) {
          if (names.includes(result[i].name)) {
            deviceIpList.push(result[i].ip)
          }
        }
        resolve(deviceIpList.flat())
      })
      .catch(err => console.log('error is', err))
  })
}

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
/**
 * This method is used to get Controller Plugins
 * @returns {Promise<unknown>}
 */
const getControllerPluginData = () => {
  let pluginsFromController = []
  return new Promise(resolve => {
    thunderJS.Controller.status()
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          pluginsFromController.push(result[i].callsign)
        }
        resolve(pluginsFromController)
      })
      .catch(err => console.log('error is', err))
  })
}

/**
 * This function gets the complete list of tests cases from the test cases folder
 * @returns {*}
 */
const func_testCasesFromTestFolder = () => {
  testCasesFromTestsFolder = Object.values(TestCases).reduce((arr1, arr2) => {
    return arr1.concat(arr2)
  }, [])
  return testCasesFromTestsFolder
}

/**
 * This function returns plugins that are available within the testcases
 * @returns {*[]}
 */
const func_pluginsFromTestsFolder = () => {
  let allPlugins = []
  testCasesFromTestsFolder.forEach(t => {
    if (t.plugin !== undefined) {
      allPlugins.push(t.plugin[0])
    }
  })
  return [...new Set(allPlugins)]
}

/**
 * This function is used to create testcase list and displaytestcase list
 * @param categories
 */
const func_finalTestCaseList = categories => {
  let pluginTestCases = []
  testCaseList = []
  displayTestCaseList = []
  categories.forEach(category => {
    pluginTestCases = testCasesFromTestsFolder.filter(item => {
      if (item.plugin !== undefined) {
        let pluginStatus = item.plugin.every(plugin => {
          return pluginDataFromController.indexOf(plugin) !== -1
        })
        return (
          item && item.plugin && item.plugin.length && category === item.plugin[0] && pluginStatus
        )
      }
    })
    testCaseList.push(...pluginTestCases)
    displayTestCaseList.push(...listTestcases(pluginTestCases))
  })
  displayTestCaseList.forEach((item, index) => {
    item.value = index
  })
}

const menu = async (categories, selectAll = false) => {
  clearConsole()
  func_finalTestCaseList(categories)
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
            enableReports,
            runAll,
            new Inquirer.Separator(),
            ...displayTestCaseList.filter(test => {
              return test.name.toLowerCase().includes(input.toLowerCase())
            }),
          ])
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]

  Inquirer.prompt(questions).then(answers => {
    if (answers.TESTS.length) {
      if (answers.TESTS.indexOf(enableReports) !== -1) {
        writeReports = true
      }
      if (answers.TESTS.indexOf(runAll) !== -1) {
        return getReportFilename(writeReports).then(reportFilename =>
          run(testCaseList, reportFilename)
        )
      }
      return getReportFilename(writeReports).then(reportFilename =>
        run(
          testCaseList.filter((test, index) => {
            if (answers.TESTS.indexOf(index) !== -1) return true
          }),
          reportFilename
        )
      )
    } else {
      displayTestCaseList = []
      testCaseList = []
      showCategories()
    }
  })
}
const menuRunByPlugin = categories => {
  clearConsole()
  const questions = [
    {
      type: 'checkbox-plus',
      message: [
        [
          'Select any of the',
          Chalk.redBright('Category'),
          'to run tests related to specific category.',
          'Press',
          Chalk.yellow('spacebar'),
          'to select the options',
          'and then press',
          Chalk.yellow('enter'),
          'to proceed',
        ].join(' '),
      ].join('\n'),
      name: 'CATEGORIES',
      source: () => {
        return new Promise(function(resolve) {
          resolve([
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
    if (answers.CATEGORIES) {
      menu(answers.CATEGORIES)
    } else {
      showCategories()
    }
  })
}

const menuRunAll = async categories => {
  clearConsole()
  func_finalTestCaseList(categories)
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
          resolve([enableReports, skipReports])
        })
      },
      pageSize: process.stdout.rows || 20,
    },
  ]
  Inquirer.prompt(questions).then(answers => {
    if (answers.REPORT_ENABLE.length) {
      if (answers.REPORT_ENABLE.indexOf(enableReports) !== -1) {
        writeReports = true
      }
      if (answers.REPORT_ENABLE.indexOf(skipReports) !== -1) {
        writeReports = false
      }
      return getReportFilename(writeReports).then(reportFilename =>
        run(testCaseList, reportFilename)
      )
    } else {
      showCategories()
    }
  })
}
const showCategories = async () => {
  clearConsole()
  await func_testCasesFromTestFolder() //Gets list of test cases from testcases folder
  let pluginsFromTestcases = await func_pluginsFromTestsFolder() //
  pluginDataFromController = await getControllerPluginData.call()
  let categories = pluginsFromTestcases.filter(item => pluginDataFromController.includes(item))
  if (categories !== undefined && categories.length) {
    const menuOptions = [runAll, runByPlugin, search]
    const questions = [
      {
        type: 'list',
        message: [
          [
            'Select \n',
            Chalk.redBright('1. Runall'),
            '- option to run all the tests \n',
            Chalk.redBright('2. Run By Plugin'),
            ' - to run tests related to specific Plugin. \n',
            Chalk.redBright('3. Search'),
            ' - Search test cases and run them \n',
            'Press',
            Chalk.yellow('spacebar'),
            'to select the options',
            'and then press',
            Chalk.yellow('enter'),
            'to proceed',
          ].join(' '),
        ].join('\n'),
        name: 'CATEGORIES',
        choices: menuOptions,
      },
    ]
    Inquirer.prompt(questions).then(answers => {
      let selectedCategories = []
      if (answers.CATEGORIES) {
        if (answers.CATEGORIES.indexOf(runAll) !== -1) {
          selectedCategories.push(...categories)
          return menuRunAll(selectedCategories)
        } else if (answers.CATEGORIES.indexOf(search) !== -1) {
          return menu(categories)
        } else if (answers.CATEGORIES.indexOf(runByPlugin) !== -1) {
          return menuRunByPlugin(categories)
        }
        menu(answers.CATEGORIES)
      } else {
        showCategories()
      }
    })
  } else {
    console.log(
      Chalk.red(
        'Plugin data from Controller is not available or testcases are not available to run'
      )
    )
    process.exit()
  }
}

const showMenu = async () => {
  let deviceIP = await getDeviceIP.call()
  const questions = [
    {
      type: 'input',
      name: 'input',
      message: 'Enter the IP of the device',
    },
  ]
  Inquirer.prompt(questions).then(answers => {
    if (deviceIP.includes(answers.input)) showCategories()
    else {
      console.log(
        Chalk.red.bold(
          'STB is not connected (or) Entered IP is invalid. \nPlease connect the STB (or) Enter Valid Ip and execute the tests'
        )
      )
      process.exit()
    }
  })
}

showMenu()
