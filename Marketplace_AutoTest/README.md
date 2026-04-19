# Marketplace_AutoTest

CodeceptJS + Playwright test suite for Marketplace flow using Page Object pattern.

## Structure

- `pages/MarketplacePage.ts`: Marketplace screen actions and assertions.
- `pages/ListingForm.ts`: Create Listing form actions and assertions.
- `marketplace_listing_test.ts`: End-to-end scenarios using both page objects.
- `pages/BuyerBuyNowPage.ts`: Buyer Buy Now flow actions and assertions.
- `marketplace_buy_now_test.ts`: End-to-end strict suite for Buyer Buy Now (validation + owner-case + success).

## Setup

1. Install dependencies:
   - `npm install`
2. Configure base URL if needed:
   - PowerShell: `$env:BASE_URL='http://localhost:3000'`
3. Default login credentials are already configured in test steps:
   - Email: `acamet117@gmail.com`
   - Password: `123456`
4. (Optional) Override credentials by environment variables:
   - PowerShell: `$env:MARKETPLACE_EMAIL='your-email@example.com'`
   - PowerShell: `$env:MARKETPLACE_PASSWORD='your-password'`
    - Buyer account for Buy Now test:
       - PowerShell: `$env:MARKETPLACE_BUYER_EMAIL='buyer@example.com'`
       - PowerShell: `$env:MARKETPLACE_BUYER_PASSWORD='buyer-password'`
    - Seller account for Buy Now precondition auto-create:
       - PowerShell: `$env:MARKETPLACE_SELLER_EMAIL='seller@example.com'`
       - PowerShell: `$env:MARKETPLACE_SELLER_PASSWORD='seller-password'`
5. Run tests:
   - `npm test`
   - `npm run test:single`
   - `npm run test:buy-now`
   - `npm run test:auction-bid`
   - `npm run test:headless`

## Task 4 (Auction & SignalR)

- New suite file: `marketplace_auction_bid_test.ts`
- Covered flows:
  - Buyer place bid success
  - Bid error (lower than min bid)
  - Owner cannot place bid
  - Submit disabled when terms unchecked
  - SignalR outbid realtime notification and price update

Environment variables for realtime outbid scenario:
- `MARKETPLACE_BUYER2_EMAIL`
- `MARKETPLACE_BUYER2_PASSWORD`

Seller precondition variables (required to auto-create auction listing):
- `MARKETPLACE_SELLER_EMAIL`
- `MARKETPLACE_SELLER_PASSWORD`

## Notes

- Prefer stable selectors with `data-testid` in UI for reliability.
- Current selectors include fallback CSS/text selectors for easier bootstrap.
- `marketplace_listing_test.ts` is now strict real-flow testing for EV Owner listing.
- `marketplace_buy_now_test.ts` now covers: quantity validation, terms required, quantity clamp, owner no-confirm, and successful purchase.
- For full Buy Now coverage, use two accounts (`MARKETPLACE_BUYER_*` and `MARKETPLACE_SELLER_*`) and ensure seller has verified credit source.
- Strict tests require verified credit source data on the test account. If not available, scenarios fail with explicit precondition errors.
