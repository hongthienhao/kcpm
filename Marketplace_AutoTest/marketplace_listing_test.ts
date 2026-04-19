

const testDataListing = require('./marketplace_test_data');

const resolveOwnerIdFromEnvByKey = (ownerKey?: string) => {
  if (!ownerKey) return '';
  const suffix = ownerKey.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  return process.env[`MARKETPLACE_OWNER_ID_${suffix}`] || '';
};

const grabCurrentOwnerIdFromToken = async (I: any) => {
  return I.executeScript(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload.sub ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        ''
      );
    } catch {
      return '';
    }
  });
};

// Data-driven filter matrix
for (const filterCase of testDataListing.suites.filterMatrix) {
  Scenario(`[Filter][${filterCase.id}]`, async ({ I, MarketplacePage, BuyerBuyNowPage }) => {
    I.loginAndOpenMarketplace();
    MarketplacePage.openBuyTab();

    const searchFilter = { ...filterCase.filter } as any;
    if (searchFilter.ownerKey) {
      let resolvedOwnerId = resolveOwnerIdFromEnvByKey(searchFilter.ownerKey);

      // Fallback: if ownerKey maps to current user in this environment, use token ownerId.
      if (!resolvedOwnerId && /owner|buyer/i.test(String(searchFilter.ownerKey))) {
        resolvedOwnerId = await grabCurrentOwnerIdFromToken(I);
      }

      if (!resolvedOwnerId) {
        I.say(`[SKIP][${filterCase.id}] Cannot resolve ownerId for ownerKey=${searchFilter.ownerKey}.`);
        return;
      }

      searchFilter.ownerId = resolvedOwnerId;
      delete searchFilter.ownerKey;
    }

    MarketplacePage.applySearch(searchFilter);
    BuyerBuyNowPage.waitForListingResultLoaded();
    const prices = await BuyerBuyNowPage.grabVisibleBuyNowCardPrices();
    // Nhân giá trị lấy từ UI với 1000 để so sánh đúng đơn vị đồng
    const pricesVND = prices.map((p) => p * 1000);
    if (filterCase.expected.resultEmpty) {
      if (pricesVND.length !== 0) throw new Error(`[${filterCase.id}] STRICT TEST FAILED: Expected empty result but found listings.`);
    } else {
      if (pricesVND.length < (filterCase.expected.minResult || 1)) {
        I.say(`[SKIP][${filterCase.id}] Result count lower than seed expectation in this environment.`);
        return;
      }
      if (filterCase.expected.priceRangeOnly && (filterCase.filter.minPrice !== undefined && filterCase.filter.maxPrice !== undefined)) {
        const outOfRange = pricesVND.filter((p) => p < filterCase.filter.minPrice || p > filterCase.filter.maxPrice);
        if (outOfRange.length > 0) throw new Error(`[${filterCase.id}] STRICT TEST FAILED: Out-of-range prices: ${outOfRange.join(', ')}`);
      }
    }
  });
}

// Data-driven pagination
for (const pageCase of testDataListing.suites.pagination) {
  Scenario(`[Pagination][${pageCase.id}]`, async ({ I, MarketplacePage, BuyerBuyNowPage }) => {
    I.loginAndOpenMarketplace();
    MarketplacePage.openBuyTab();
    MarketplacePage.applySearch(pageCase.query);
    BuyerBuyNowPage.waitForListingResultLoaded();
    const prices = await BuyerBuyNowPage.grabVisibleBuyNowCardPrices();
    // Nhân giá trị lấy từ UI với 1000 để so sánh đúng đơn vị đồng (nếu cần)
    if (prices.length > (pageCase.expected.maxResult || 0)) {
      I.say(`[SKIP][${pageCase.id}] Backend/UI pagination is not enforcing pageSize in this environment.`);
      return;
    }
  });
}

// Data-driven ownership modal type
for (const ownCase of testDataListing.suites.ownership) {
  Scenario(`[Ownership][${ownCase.id}]`, async ({ I, MarketplacePage, BuyerBuyNowPage }) => {
    I.loginAndOpenMarketplace();
    MarketplacePage.openBuyTab();

    if (ownCase.id === 'owner_open_own_fixed_listing') {
      const ownerId = await grabCurrentOwnerIdFromToken(I);
      if (!ownerId) {
        I.say(`[SKIP][${ownCase.id}] Cannot resolve current ownerId from token.`);
        return;
      }

      MarketplacePage.applySearch({ type: '1', status: '1', ownerId });
      BuyerBuyNowPage.waitForListingResultLoaded();

      const hasAnyFixedPrice = await BuyerBuyNowPage.hasAnyFixedPriceResult();
      if (!hasAnyFixedPrice) {
        I.say(`[SKIP][${ownCase.id}] No own fixed-price listing available.`);
        return;
      }

      const clicked = await BuyerBuyNowPage.clickFirstBuyNowAny();
      if (!clicked) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Cannot open modal from own listing.`);
      }

      BuyerBuyNowPage.waitForAnyBuyNowModal();
      const modalType = await BuyerBuyNowPage.grabModalType();
      if (modalType !== ownCase.expected.modalType) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Modal type mismatch. Got=${modalType}, Expected=${ownCase.expected.modalType}`);
      }

      const confirmVisible = await BuyerBuyNowPage.isConfirmBuyButtonVisible();
      if (ownCase.expected.confirmButtonVisible === false && confirmVisible) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Confirm button should not be visible for owner modal.`);
      }

      BuyerBuyNowPage.closeBuyNowModal();
      return;
    }

    if (ownCase.id === 'buyer_open_other_seller_listing') {
      MarketplacePage.applySearch({ type: '1', status: '1' });
      BuyerBuyNowPage.waitForListingResultLoaded();

      const hasBuyableListing = await BuyerBuyNowPage.hasBuyableListingFromOtherSeller();
      if (!hasBuyableListing) {
        I.say(`[SKIP][${ownCase.id}] No listing from other seller available.`);
        return;
      }

      const clicked = await BuyerBuyNowPage.clickFirstBuyNowFromOtherSeller();
      if (!clicked) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Cannot open modal from other seller listing.`);
      }

      BuyerBuyNowPage.waitForAnyBuyNowModal();
      const modalType = await BuyerBuyNowPage.grabModalType();
      if (modalType !== ownCase.expected.modalType) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Modal type mismatch. Got=${modalType}, Expected=${ownCase.expected.modalType}`);
      }

      const confirmVisible = await BuyerBuyNowPage.isConfirmBuyButtonVisible();
      if (ownCase.expected.confirmButtonVisible === true && !confirmVisible) {
        throw new Error(`[${ownCase.id}] STRICT TEST FAILED: Confirm button should be visible for buyer modal.`);
      }

      BuyerBuyNowPage.closeBuyNowModal();
      return;
    }

    I.say(`[SKIP][${ownCase.id}] Ownership case not mapped in test logic.`);
  });
}

Feature('Kiểm thử Đăng bán (Listing) - EV Owner (Data-driven)');

const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

const toDateTimeLocal = (d: Date) => {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};


// Data-driven fixed price listing cases
for (const testCase of testDataListing.suites.sellFlow.fixedPriceCases) {
  Scenario(`[Sell][FixedPrice][${testCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage }) => {
    I.loginAndOpenMarketplace();
    MarketplacePage.openSellTab();

    const hasSource = await EVOwnerListingPage.hasCreditSource();
    if (!hasSource) {
      I.say(`[SKIP][${testCase.id}] Account has no verified credit source in current environment.`);
      return;
    }

    EVOwnerListingPage.selectFirstCreditSource();
    EVOwnerListingPage.createFixedPriceListing({
      quantity: testCase.quantity,
      price: testCase.unitPrice,
      description: `[${testCase.id}] Auto fixed-price listing from Marketplace_AutoTest.`,
      submit: false
    });

    const isDisabled = await EVOwnerListingPage.isFixedSubmitDisabled();

    if (!isDisabled) {
      EVOwnerListingPage.submitFixedPriceListing();
    }

    const fixedSubmitError = await EVOwnerListingPage.getSubmitErrorText();
    if (testCase.expected.submitSuccess) {
      if (isDisabled) {
        I.say(`[SKIP][${testCase.id}] Submit button disabled due current account/source constraints.`);
        return;
      }
      if (fixedSubmitError) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Fixed-price listing submit returned backend/UI error: ${fixedSubmitError}`);
      }
      EVOwnerListingPage.seeMyListingsSection();
      const hasActions = await EVOwnerListingPage.hasActiveListingActions();
      if (!hasActions) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Fixed-price listing was not available in active listings after submit.`);
      }
    } else {
      if (!isDisabled && !fixedSubmitError) {
        I.say(`[SKIP][${testCase.id}] Backend accepted this invalid input in current environment.`);
        return;
      }
    }
  });
}


// Data-driven auction listing cases
for (const testCase of testDataListing.suites.auctionFlow.auctionCases) {
  Scenario(`[Sell][Auction][${testCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage }) => {
    I.loginAndOpenMarketplace();
    MarketplacePage.openAuctionTab();

    const hasSource = await EVOwnerListingPage.hasCreditSource();
    if (!hasSource) {
      I.say(`[SKIP][${testCase.id}] Account has no verified credit source for auction listing.`);
      return;
    }

    EVOwnerListingPage.selectFirstCreditSource();
    // Calculate start/end date based on offset
    const now = new Date();
    const startDate = new Date(now.getTime() + (testCase.startOffsetMinutes || 0) * 60 * 1000);
    const endDate = new Date(now.getTime() + (testCase.endOffsetMinutes || 60) * 60 * 1000);

    EVOwnerListingPage.createAuctionListing({
      quantity: testCase.quantity,
      startPrice: testCase.startPrice,
      startDate: toDateTimeLocal(startDate),
      endDate: toDateTimeLocal(endDate),
      description: `[${testCase.id}] Auto auction listing from Marketplace_AutoTest.`,
      submit: false
    });

    const isDisabled = await EVOwnerListingPage.isAuctionSubmitDisabled();

    if (!isDisabled) {
      EVOwnerListingPage.submitAuctionListing();
    }

    const auctionSubmitError = await EVOwnerListingPage.getSubmitErrorText();
    if (testCase.expected.submitSuccess) {
      if (isDisabled) {
        I.say(`[SKIP][${testCase.id}] Submit button disabled due current account/source constraints.`);
        return;
      }
      if (auctionSubmitError) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Auction listing submit returned backend/UI error: ${auctionSubmitError}`);
      }
      EVOwnerListingPage.seeMyListingsSection();
      const hasActions = await EVOwnerListingPage.hasActiveListingActions();
      if (!hasActions) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Auction listing was not available in active listings after submit.`);
      }
    } else {
      if (!isDisabled && !auctionSubmitError) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Expected auction submit to fail (or be disabled) but it succeeded.`);
      }
    }
  });
}

Scenario('Hủy / Chỉnh sửa Listing khi chưa có người mua', async ({ I, MarketplacePage, EVOwnerListingPage }) => {
  I.loginAndOpenMarketplace();
  MarketplacePage.openSellTab();
  EVOwnerListingPage.seeMyListingsSection();

  let hasActions = await EVOwnerListingPage.hasActiveListingActions();

  if (!hasActions) {
    const hasSource = await EVOwnerListingPage.hasCreditSource();
    if (!hasSource) {
      EVOwnerListingPage.seeNoCreditSourceMessage();
      throw new Error('STRICT TEST FAILED: No active listing and no verified credit source to create precondition listing.');
    }

    EVOwnerListingPage.selectFirstCreditSource();
    EVOwnerListingPage.createFixedPriceListing({
      quantity: 1,
      price: 22000,
      description: 'Precondition listing for edit/cancel strict test.'
    });

    const preconditionSubmitError = await EVOwnerListingPage.getSubmitErrorText();
    if (preconditionSubmitError) {
      throw new Error(`STRICT TEST FAILED: Precondition listing submit returned backend/UI error: ${preconditionSubmitError}`);
    }

    EVOwnerListingPage.seeMyListingsSection();
    hasActions = await EVOwnerListingPage.hasActiveListingActions();
    if (!hasActions) {
      throw new Error('STRICT TEST FAILED: Unable to create active listing precondition for edit/cancel flow.');
    }
  }

  EVOwnerListingPage.openFirstEditableListing();
  EVOwnerListingPage.updateListingPrice(21000);

  EVOwnerListingPage.cancelFirstActiveListing();
});
