import baseTest from './WebKit_Performance_001.test.js'
import { settingUrl } from './commonMethods/commonFunctions'

const URL = 'https://webkit.org/blog-files/3d-transforms/morphing-cubes.html'

export default {
  ...baseTest,
  ...{
    title: 'WPEWebkit performance morphing cube',
    description: 'Loads the Morphing Cube CSS3 animation and measures its performance',
    steps: baseTest.steps.map((step, index) => {
      if (index === 4) {
        return {
          description: 'Navigating to Morphing Cube',
          test: settingUrl,
          params: URL,
          assert: URL,
        }
      }
      return step
    }),
  },
}
