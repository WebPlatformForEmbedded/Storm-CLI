import baseTest from './WebKit_Performance_001.test.js'
import { calcAvgFPS, validateFPS } from './commonMethods/webKitPerformanceCommonFunctions'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://ie.microsoft.com/testdrive/performance/fishietank/'

let minFPS = 2

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance fishietank',
    description: 'Loads the Fish IE tank canvas animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Fish IE tank canvas',
          test: settingUrl,
          params: URL,
          assert: URL,
        }
      }
      if (index === 7) {
        return {
          description: 'Calculate average FPS',
          test: calcAvgFPS,
          validate(results) {
            validateFPS(results, minFPS)
          },
        }
      }
      return step
    }),
  },
}
