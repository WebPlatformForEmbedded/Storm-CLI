import {
  pluginDeactivate,
  pluginActivate,
  webKitBrowserActions,
  settingUrl,
  isUrlLoaded,
} from './commonMethods/commonFunctions'
import constants from './commonMethods/constants'

const URL = 'http://peacekeeper.futuremark.com/run.action'
const resultURL = 'http://peacekeeper.futuremark.com/results'

export default {
  title: 'WPEWebkit Peacekeeper Benchmark test',
  description: 'Loads the Peacekeeper Benchmark test and get the results123456',
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
      description: 'Navigating to Load http://peacekeeper.futuremark.com/run.action',
      test: settingUrl,
      params: URL,
      assert: URL,
    },
    {
      description: 'Check if URL is loaded',
      sleep: 15,
      test: isUrlLoaded,
      params: URL,
      assert: true,
    },
    {
      description: 'Validate the test by verifying if the url is still loaded',
      sleep: 480,
      test() {
        this.$thunder.api.WebKitBrowser.url().then(url => {
          let PeacekeeperUrl = url.split('?')
          let result = PeacekeeperUrl[0]
          if (result === resultURL) return true
          else {
            throw (new Error(`Expected ${result} while result was ${URL}`),
            this.$log(`Expected ${result} while result was ${URL}`))
          }
        })
      },
      assert: true,
    },
    {
      description: 'Setting the URL to Blank',
      test: settingUrl,
      params: constants.blankUrl,
      assert: constants.blankUrl,
    },
    {
      description: 'Activating Monitor Plugin',
      test: pluginActivate,
      params: constants.monitorPlugin,
      assert: 'activated',
    },
  ],
}
