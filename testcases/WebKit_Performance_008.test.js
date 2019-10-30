import baseTest from './WebKit_Performance_001.test.js'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'http://helloracer.com/webgl/'

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance helloracer',
    description: 'Loads the Helloracer WebGL animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Helloracer WebGL',
          test: settingUrl,
          params: URL,
          assert: URL,
        }
      }
      return step
    }),
  },
}
