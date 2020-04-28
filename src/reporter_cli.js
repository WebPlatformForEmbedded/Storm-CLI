import Chalk from 'chalk'
import moment from 'moment'

import { clearConsole, center, renderSeparator } from './helpers/ui-helpers'

const progressLookup = {
  0: 'In Progress',
  1: 'Success',
  2: 'Failed',
  3: 'Timedout',
  4: 'Not Applicable',
  5: 'Not Started',
}

const maxDisplaySteps = 20
let renderLoop = null
let data = {}

export default config => {
  data = {
    host: config.host,
    test: null,
    steps: [],
    status: 0,
    log: [],
  }

  return {
    init(test) {
      data.test = test
      data.title = test.title ? test.title : 'No title provided'
      data.description = test.description ? test.description : 'No description provided'
      data.steps = test.steps
      data.status = 0
      data.stepCount = Object.keys(test.steps).length
      data.currentStep = 1
      data.timeStarted = moment()

      renderLoop = setInterval(renderTaskProgress, 1000)
      renderTaskProgress()
    },
    step(test, step) {
      data.currentStep = findStepByDescription(data.steps, step.description) + 1
    },
    log(m) {
      data.log.push(m)
    },
    sleep(milliseconds) {},
    pass(test, step) {
      const index = findStepByDescription(data.steps, step.description)
      if (index > -1) {
        data.steps[index].status = 'PASS'
      }
    },
    fail(test, step, err) {
      const index = findStepByDescription(data.steps, step.description)
      if (index > -1) {
        data.steps[index].status = 'FAIL'
      }
    },
    success(test) {
      clearInterval(renderLoop)

      data.status = 1
      renderTaskProgress()
    },
    error(test, err) {
      clearInterval(renderLoop)

      data.status = 2
      renderTaskProgress()
      renderLogs()
    },
    finished(test) {
      data = {
        host: config.host,
        test: null,
        steps: [],
        status: 0,
        log: [],
      }
    },
  }
}

const header = () => {
  console.log(
    Chalk.yellow(
      [renderSeparator('='), center('Storm CLI - Test Runner'), renderSeparator('=')].join('\n')
    )
  )
}

const findStepByDescription = (steps, description) => {
  return steps.findIndex(step => step.description === description)
}

const getDurationString = () => {
  let diff = moment().diff(moment(data.timeStarted), 'minutes')

  // handle seconds if its a really small diff
  if (diff === 0) return moment().diff(moment(data.timeStarted), 'seconds') + 's'

  return diff + 'm'
}

const renderLogs = () => {
  console.log('\nProcess log:')
  const logs = data.log.slice(Math.max(data.log.length - maxDisplaySteps, 0))
  logs.forEach((l, index) => {
    console.log(index + '. ' + l)
  })
}

const renderTask = (step, index) => {
  const description = step.description.slice(0, 40)
  const requiredPadding = 50 - description.length
  let padding = ''
  for (var j = 0; j < requiredPadding; j++) {
    padding += ' '
  }

  console.log(
    center(` ${index + 1}. ${description} ${padding} ${step.status ? step.status : '...'}`)
  )
}

const renderTaskProgress = () => {
  clearConsole()
  header()

  const result = progressLookup[data.status]
  const progressPerct = Math.round((data.currentStep / data.stepCount) * 100)
  const progressBarPerct = Math.round((data.currentStep / data.stepCount) * 50) //since we only have 50 chars
  let progressBar = ''
  //[>-------------------------------------------------]
  for (var i = 0; i < 50; i++) {
    if (i < progressBarPerct) progressBar += '#'
    else if (i === progressBarPerct) progressBar += '>'
    else progressBar += '-'
  }

  console.log(center(`Task: ${data.title} \t\t\t Result: ${result}`))
  console.log(center(`Host: ${data.host} \t\t\t Duration: ${getDurationString()}`))
  console.log(Chalk.white(renderSeparator('-')))

  /*
  if (currentTask.repeating === true)
      renderRepeat(i);
  */
  console.log(
    center(`Progress ${data.currentStep}/${data.stepCount} [${progressBar}] ${progressPerct}%`)
  )
  console.log(Chalk.white(renderSeparator('-')))

  console.log(center('Steps:'))
  let logStart = 0
  if (data.log.length > maxDisplaySteps) logStart = data.log.length - maxDisplaySteps

  // render individual tasks
  data.steps.forEach((step, index) => {
    if (data.steps.length > maxDisplaySteps && index < data.log.length - maxDisplaySteps) return
    renderTask(step, index)
  })
}
