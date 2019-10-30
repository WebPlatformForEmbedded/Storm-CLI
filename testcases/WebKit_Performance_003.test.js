import baseTest from './WebKit_Performance_001.test.js'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'https://webkit.org/blog-files/leaves/'

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance falling leaves',
    description: 'Loads the falling leaves CSS3 animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to falling leaves',
          test: settingUrl,
          params: URL,
          assert: URL,
        }
      }
      return step
    }),
  },
}
