import fs from 'fs'
import ThunderJS from 'ThunderJS'
import moment from 'moment'

let filename,
  start,
  data = {},
  stepResultLines = [],
  currentStepLine = ''

export default config => {
  return {
    init(test) {
      if (fs.existsSync('./reports') === false) {
        fs.mkdir('./reports', err => {
          console.error('Error: ', err)
        })
      }

      filename = './reports/' + config.reportFile

      start = moment()
      data = test
      data.log = []

      getDeviceInfo(config).then(config => {
        initReportFile(config).then(() => {
          addToReport(`Title:            ${test.title ? test.title : 'No title provided'}`)
          addToReport(`Description:      ${test.description ? test.description.slice(0, 50) : '-'}`)
        })
      })
    },
    step(test, step) {
      const currentStep = findStepByDescription(data.steps, step.description) + 1
      const description = step.description
        ? step.description.slice(0, 60).padEnd(70, ' ')
        : ''.padEnd(90, ' ')
      currentStepLine = `${currentStep}. ${description} `
    },
    log(m) {
      data.log.push(m)
    },
    sleep(milliseconds) {},
    pass(test, step) {
      stepResultLines.push(currentStepLine + ' PASS')
    },
    fail(test, step, err) {
      stepResultLines.push(currentStepLine + ' FAIL')
    },
    success(test) {
      writeTestSummary(true)
    },
    error(test, err) {
      writeTestSummary(false)
    },
    finished(test) {},
  }
}

const initReportFile = config => {
  return new Promise(resolve => {
    //no need to print header if the file already exists
    if (fs.existsSync(filename)) {
      return resolve()
    }

    let header = 'Storm Test Suite - 2020 (c) RDKM\n\n'

    header += `Report for:        ${config.devicename ? config.devicename : 'unknown'}\n`
    header += `Software version:  ${config.version ? config.version : 'unknown'}\n`
    header += `Serial number:     ${config.serialnumber ? config.serialnumber : 'uknown'}\n`
    header += `Date of report:    ${moment().toISOString()}\n`

    fs.writeFileSync(filename, header, { flag: 'as' })
    divider('=')
    resolve()
  })
}

const divider = sign => {
  addToReport(`\n${''.padEnd(80, sign ? sign : '-')}\n`)
}

const findStepByDescription = (steps, description) => {
  return steps.findIndex(step => step.description === description)
}

const addToReport = data => {
  fs.writeFileSync(filename, data + '\n', { flag: 'as' })
}

const writeTestSummary = success => {
  let diff = moment().diff(moment(start), 'minutes')
  if (diff === 0) {
    diff = moment().diff(moment(start), 'seconds') + 's'
  } else {
    diff += 'm'
  }

  addToReport(`\nTest result:       ${success === true ? 'PASS' : 'FAIL'}`)
  addToReport(`Test ran for:        ${diff}`)
  divider()

  addToReport('Steps:')
  stepResultLines.forEach(s => {
    addToReport(s)
  })

  if (success === false) {
    divider()
    addToReport('Log results:')
    data.log.forEach(l => {
      addToReport(l)
    })
  }

  divider('=')
}

const getDeviceInfo = config => {
  return new Promise(resolve => {
    const t = ThunderJS({ host: config.host })
    t.DeviceInfo.systeminfo()
      .then(result => {
        config.version = result.version
        config.devicename = result.devicename
        config.serialnumber = result.serialnumber
        resolve(config)
      })
      .catch(e => {
        resolve(config)
      })
  })
}
