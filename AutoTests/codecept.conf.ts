import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';

// Headless mode: HEADLESS=true npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS === 'true');

// Enable all common plugins
setCommonPlugins();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

export const config: CodeceptJS.MainConfig = {
  // Quét toàn bộ 5 thư mục service
  tests: './**/*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      url: BASE_URL,
      show: process.env.HEADLESS !== 'true',
      browser: 'chromium',
      waitForNavigation: 'domcontentloaded',
      waitForTimeout: 15000,
      timeout: 60000,
      chromium: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      },
    },
    REST: {
      endpoint: 'http://localhost:7000/api',
      timeout: 10000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    JSONResponse: {},
  },
  include: {
    I: './steps_file',
    // -- Auth --
    LoginPage: './1_AuthService/pages/LoginPage',
    RegisterPage: './1_AuthService/pages/RegisterPage',
    // -- Wallet --
    WalletPage: './2_WalletService/pages/WalletPage',
    // -- Marketplace --
    MarketplacePage: './3_MarketplaceService/pages/MarketplacePage',
    EVOwnerListingPage: './3_MarketplaceService/pages/EVOwnerListingPage',
    BuyerBuyNowPage: './3_MarketplaceService/pages/BuyerBuyNowPage',
    AuctionBidPage: './3_MarketplaceService/pages/AuctionBidPage',
    // -- Carbon Lifecycle --
    VehiclePage: './4_CarbonLifecycleService/pages/VehiclePage',
    TripPage: './4_CarbonLifecycleService/pages/TripPage',
    BatchPage: './4_CarbonLifecycleService/pages/BatchPage',
    VerificationDashboardPage: './4_CarbonLifecycleService/pages/VerificationDashboardPage',
    ReviewModalPage: './4_CarbonLifecycleService/pages/ReviewModalPage',
    // -- Admin --
    AdminLoginPage: './5_AdminService/pages/AdminLoginPage',
    AdminDashboardPage: './5_AdminService/pages/AdminDashboardPage',
    AdminUserManagementPage: './5_AdminService/pages/AdminUserManagementPage',
    AdminWithdrawalPage: './5_AdminService/pages/AdminWithdrawalPage',
    AdminDisputePage: './5_AdminService/pages/AdminDisputePage',
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output',
      reportFilename: 'report',
    },
  },
  plugins: {
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
    htmlReporter: {
      enabled: true,
    },
  },
  timeout: 120,
  name: 'CarbonTC AutoTests',
};
