import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:5173',
      show: true,
      windowSize: '1920x1080'
    }
  },
 include: {
    I: './steps_file',
    VehiclePage: './pages/VehiclePage.ts',
    TripPage: './pages/TripPage.ts',
    LoginPage: './pages/LoginPage.ts',
    BatchPage: './pages/BatchPage.ts'
  },
  plugins: {
    htmlReporter: {
      enabled: true
    }
  },
  name: 'AK_AutoTest'
}