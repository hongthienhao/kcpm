import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  require: ['ts-node/register'],
  tests: './*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: process.env.BASE_URL || 'http://localhost:5173',
      show: true,
      waitForTimeout: 10000,
      waitForNavigation: 'load'
    }
  },
  include: {
    I: './steps_file',
    MarketplacePage: './pages/MarketplacePage',
    ListingForm: './pages/ListingForm',
    EVOwnerListingPage: './pages/EVOwnerListingPage',
    BuyerBuyNowPage: './pages/BuyerBuyNowPage',
    AuctionBidPage: './pages/AuctionBidPage'
  },
  plugins: {
    htmlReporter: {
      enabled: true,
      output: './output/report.html'
    }
  },
  name: 'Marketplace_AutoTest'
};
