const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './TH_tests/**/*.js',
  output: './TH_output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:5173',
      show: true
    }
  },
  include: {
    I: './TH_steps_file.js',
    TH_LoginPage: './TH_pages/TH_LoginPage.js',
    TH_RegisterPage: './TH_pages/TH_RegisterPage.js'
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    }
  },
  name: 'CarbonTC'
}
