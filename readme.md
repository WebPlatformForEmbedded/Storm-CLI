# Storm CLI

Command line interface for the Storm Test runner. Allows to invoke tests and see results locally.

## Getting started

1. Install the dependencies
```
npm install
```

2. Adjust the file `config.js` to match your Thunder enabled testing device.

3. Start Storm CLI
```
npm start
```

## Single test execution

For ease of test development you can execute a single test directly from the CLI:
```
npm run single -i <testcase.test.js>
```

Note: test case needs to be present in `./testcases/` of the CLI.

## Documentation

Documentation on test syntax and reporters can be found [here](https://github.com/WebPlatformForEmbedded/Storm/blob/master/docs/readme.md)

## Test cases

The storm test cases are stored in a seperate repository which can be found [here](https://github.com/WebPlatformForEmbedded/Storm-Testcases) and are automatically pulled in on npm start. If you want to test/include your own test cases you can place them in the `./testcases/` folder and the CLI will load them locally (and don't forget to upstream them 8)).
