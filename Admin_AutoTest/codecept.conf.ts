import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';

// Set headless mode when HEADLESS env variable is set
setHeadlessWhen(process.env.HEADLESS === 'true');

// Enable all common plugins
setCommonPlugins();

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

export const config: CodeceptJS.MainConfig = {
  tests: './tests/**/*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      url: baseUrl,
      show: process.env.HEADLESS !== 'true',
      browser: 'chromium',
      waitForNavigation: 'load',
      waitForTimeout: 10000,
      timeout: 30000,
      // Persist login state across tests via storageState
      // waitForAction: 500,
      chromium: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      },
    },
    CustomHelper: {
      require: './helpers/CustomHelper',
      baseUrl,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
      adminPassword: process.env.ADMIN_PASSWORD || '123456',
    },
  },
  include: {
    I: './steps_file',
    AdminLoginPage: './pages/AdminLoginPage',
    AdminDashboardPage: './pages/AdminDashboardPage',
    AdminUserManagementPage: './pages/AdminUserManagementPage',
    AdminWithdrawalPage: './pages/AdminWithdrawalPage',
    AdminDisputePage: './pages/AdminDisputePage',
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output',
      reportFilename: 'report',
    },
  },
  bootstrap: null,
  teardown: null,
  hooks: [],
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
  // Global timeout settings
  timeout: 60, // 60 seconds per test
  name: 'Admin_AutoTest',
};
