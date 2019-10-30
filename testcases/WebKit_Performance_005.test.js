import baseTest from './WebKit_Performance_001.test.js'
import { calcAvgFPS, validateFPS } from './commonMethods/webKitPerformanceCommonFunctions'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://themaninblue.com/experiment/AnimationBenchmark/canvas/'
let minFPS = 10
export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance man in blue',
    description: 'Loads the Man in Blue Canvas animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Man in Blue Canvas',
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
