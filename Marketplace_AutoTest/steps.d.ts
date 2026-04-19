/// <reference types='codeceptjs' />

type steps_file = typeof import('./steps_file');
type MarketplacePage = typeof import('./pages/MarketplacePage');
type ListingForm = typeof import('./pages/ListingForm');
type EVOwnerListingPage = typeof import('./pages/EVOwnerListingPage');
type BuyerBuyNowPage = typeof import('./pages/BuyerBuyNowPage');
type AuctionBidPage = typeof import('./pages/AuctionBidPage');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    MarketplacePage: MarketplacePage;
    ListingForm: ListingForm;
    EVOwnerListingPage: EVOwnerListingPage;
    BuyerBuyNowPage: BuyerBuyNowPage;
    AuctionBidPage: AuctionBidPage;
  }
  interface Methods extends Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
  interface CustomLocators {}
  interface Include {}
}
