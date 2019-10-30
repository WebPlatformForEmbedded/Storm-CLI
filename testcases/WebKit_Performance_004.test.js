import baseTest from './WebKit_Performance_001.test.js'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://www.smashcat.org/av/canvas_test/'

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance smashcat',
    description: 'Loads the smashcat Canvas animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to smashcat Canvas',
          test: settingUrl,
          params: URL,
          assert: URL,
        }
      }
      return step
    }),
  },
}
