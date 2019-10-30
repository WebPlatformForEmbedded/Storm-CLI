import {
  pluginDeactivate,
  pluginActivate,
  webKitBrowserActions,
  settingUrl,
} from './commonMethods/commonFunctions'
import {
  validateFPS,
  initializeSamplesArray,
  fetchFPS,
  calcAvgFPS,
} from './commonMethods/webKitPerformanceCommonFunctions'
import constants from './commonMethods/constants'

const URL = 'http://webkit.org/blog-files/3d-transforms/poster-circle.html'
let minFPS = 40

export default {
  setup() {
    initializeSamplesArray()
  },
  title: 'WPEWebkit performance poster circle',
  description: 'Loads the Poster Circle CSS3 animation and measures its performance',
  steps: [
    {
      description: 'Deactivating monitor',
      test: pluginDeactivate,
      params: constants.monitorPlugin,
      assert: 'deactivated',
    },
    {
      description: 'Deactivating WebKitBrowser',
      test: pluginDeactivate,
      params: constants.webKitBrowserPlugin,
      assert: 'deactivated',
    },
    {
      description: 'Activating WebKitBrowser',
      test: pluginActivate,
      params: constants.webKitBrowserPlugin,
      assert: 'suspended',
    },
    {
      description: 'Resuming WebKitBrowser',
      test: webKitBrowserActions,
      params: constants.resume,
      assert: 'resumed',
    },
    {
      description: 'Navigating to Poster Circle URL',
      test: settingUrl,
      params: URL,
      assert: URL,
    },
    {
      description: 'Sleeping for 5 seconds',
      sleep: 5,
      test() {
        this.$log('Sleeping for 5 seconds')
      },
    },
    {
      description: 'Fetch FPS',
      repeat: 11,
      test: fetchFPS,
      //Assertion is not required as it is handled in fetchFPS function
    },
    {
      description: 'Calculate average FPS',
      test: calcAvgFPS,
      validate(results) {
        validateFPS(results, minFPS)
      },
    },
    {
      description: 'Activating Monitor Plugin',
      test: pluginActivate,
      params: constants.monitorPlugin,
      assert: 'activated',
    },
    {
      description: 'Setting the URL to Blank',
      test: settingUrl,
      params: constants.blankUrl,
      assert: constants.blankUrl,
    },
  ],
}
