import Chalk from 'chalk'
import moment from 'moment'

import { clearConsole, center, renderSeparator } from '../helpers/ui-helpers'

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
  return {
    init(test) {
      data = {
        currentStep: 0,
        description: test.description ? test.description : 'No description provided',
        host: config.host,
        log: [],
        status: 0,
        steps: Array.isArray(test.steps) ? test.steps : Object.values(test.steps),
        timeStarted: moment(),
        title: test.title ? test.title : 'No title provided',
      }

      data.stepCount = data.steps.length
      data.stepResults = new Array(test.steps.length)
      renderTaskProgress()
    },
    step(test, step) {
      data.currentStep = findStepByDescription(data.steps, step.description) + 1
      data.stepResults[data.currentStep - 1] = 'RUN'
      renderTaskProgress()
    },
    log(m) {
      data.log.push(m)
    },
    sleep(milliseconds) {
      renderTaskProgress()
    },
    pass(test, step) {
      const index = findStepByDescription(data.steps, step.description)
      if (index > -1) {
        data.stepResults[index] = 'PASS'
      }

      renderTaskProgress()
    },
    fail(test, step, err) {
      const index = findStepByDescription(data.steps, step.description)
      if (index > -1) {
        data.stepResults[index] = 'FAIL'
      }

      //renderTaskProgress()
    },
    success(test) {
      data.status = 1
      //renderTaskProgress()
    },
    error(test, err) {
      data.status = 2
      //renderTaskProgress()
      renderLogs()
    },
    finished(test) {},
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

const renderTask = (step, index, result) => {
  if (!step) {
    return
  }

  const description = step.description
    ? step.description.slice(0, 40).padEnd(50, ' ')
    : ''.padEnd(50, ' ')
  console.log(center(` ${index + 1}. ${description} ${result ? result : '...'}`))
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

  console.log(center(`Task: ${data.title.padEnd(50)} Result: ${result}`))
  console.log(center(`Host: ${data.host.padEnd(50)} Duration: ${getDurationString()}`))
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
    renderTask(step, index, data.stepResults[index])
  })
}
