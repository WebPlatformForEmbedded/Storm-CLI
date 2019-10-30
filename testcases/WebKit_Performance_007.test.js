import baseTest from './WebKit_Performance_001.test.js'
import { calcAvgFPS, validateFPS } from './commonMethods/webKitPerformanceCommonFunctions'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://oos.moxiecode.com/js_webgl/particles_morph/'

let minFPS = 20

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance anisotropic',
    description: 'Loads the Particles webGL animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Particles webGL',
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
