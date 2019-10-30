import baseTest from './WebKit_Performance_001.test.js'
import { calcAvgFPS, validateFPS } from './commonMethods/webKitPerformanceCommonFunctions'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://alteredqualia.com/three/examples/webgl_pasta.html'

let minFPS = 5

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance pasta',
    description: 'Loads the pasta WebGL animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to pasta WebGL',
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
