import baseTest from './WebKit_Performance_001.test'
import { calcAvgFPS, validateFPS } from './commonMethods/webKitPerformanceCommonFunctions'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://helloracer.com/racer-s/'

let minFPS = 30

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance racer-s',
    description: 'Loads the Racer-S WebGL animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Racer-S WebGL',
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
