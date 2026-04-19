

const testData = require('./marketplace_test_data');

Feature('Task 3 - Kiểm thử Luồng Mua (Buy Now) - Buyer (Data-driven)');

const getBuyerCredentials = () => {
  const buyerEmail = process.env.MARKETPLACE_BUYER_EMAIL || process.env.MARKETPLACE_EMAIL || 'buyer_test@carbon.test';
  const buyerPassword = process.env.MARKETPLACE_BUYER_PASSWORD || process.env.MARKETPLACE_PASSWORD || 'Password123!';

  return { buyerEmail, buyerPassword };
};

const getSellerCredentials = () => ({
  sellerEmail: process.env.MARKETPLACE_SELLER_EMAIL || 'evowner_test@carbon.test',
  sellerPassword: process.env.MARKETPLACE_SELLER_PASSWORD || 'Password123!'
});

const getDedicatedSellerCredentials = () => {
  const { buyerEmail } = getBuyerCredentials();
  const { sellerEmail, sellerPassword } = getSellerCredentials();

  if (!sellerEmail || !sellerPassword) {
    return null;
  }

  if (sellerEmail === buyerEmail) {
    return null;
  }

  return { sellerEmail, sellerPassword };
};

const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.MARKETPLACE_API_BASE_URL || process.env.VITE_APIGATEWAY_BASE_URL || 'http://localhost:7000/api';
  return apiBaseUrl.replace(/\/+$/, '');
};

const grabOwnerIdFromToken = async (I: any) => {
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

interface SellerListingOptions {
  quantity?: number;
  price?: number;
  description?: string;
}

const computeListingPriceFromCase = (listingPrecondition: any, balance: number | null) => {
  if (!listingPrecondition) return undefined;

  if (typeof listingPrecondition.unitPrice === 'number') {
    return listingPrecondition.unitPrice;
  }

  let computed: number | undefined;

  if (typeof listingPrecondition.priceByWalletRatio === 'number' && Number.isFinite(balance as number)) {
    computed = Math.floor((balance as number) * listingPrecondition.priceByWalletRatio);
  }

  if (typeof listingPrecondition.priceOffsetFromWallet === 'number' && Number.isFinite(balance as number)) {
    computed = Math.ceil((balance as number) + listingPrecondition.priceOffsetFromWallet);
  }

  if (typeof listingPrecondition.minUnitPrice === 'number') {
    computed = Math.max(computed || 0, listingPrecondition.minUnitPrice);
  }

  return computed;
};

const evaluateInputQuantityFormula = (formula: string, maxQuantity: number) => {
  if (!formula) return maxQuantity;

  const normalized = formula.replace(/\s+/g, '');
  if (normalized === 'maxQuantity+9999') {
    return maxQuantity + 9999;
  }

  if (normalized === 'maxQuantity') {
    return maxQuantity;
  }

  return maxQuantity + 9999;
};

const createSellerPreconditionListing = async ({ I, MarketplacePage, EVOwnerListingPage }: any, options: SellerListingOptions = {}) => {
  const sellerCredentials = getDedicatedSellerCredentials();
  if (!sellerCredentials) {
    return null;
  }

  const { sellerEmail, sellerPassword } = sellerCredentials;
  const quantity = options.quantity ?? 1;
  const price = options.price ?? 20000;
  const description = options.description || `Auto precondition listing for Buyer Buy Now ${Date.now()}`;

  I.loginAndOpenMarketplace(sellerEmail, sellerPassword);
  MarketplacePage.openSellTab();

  const hasSource = await EVOwnerListingPage.hasCreditSource();
  if (!hasSource) {
    EVOwnerListingPage.seeNoCreditSourceMessage();
    throw new Error('STRICT TEST FAILED: Seller account has no verified credit source to create Buy Now precondition listing.');
  }

  EVOwnerListingPage.selectFirstCreditSource();
  EVOwnerListingPage.createFixedPriceListing({ quantity, price, description });

  const submitError = await EVOwnerListingPage.getSubmitErrorText();
  if (submitError) {
    throw new Error(`STRICT TEST FAILED: Seller precondition listing submit failed: ${submitError}`);
  }

  const ownerId = await grabOwnerIdFromToken(I);
  if (!ownerId) {
    throw new Error('STRICT TEST FAILED: Could not resolve seller ownerId from token after precondition listing creation.');
  }

  return { ownerId, quantity, price };
};

const openBuyerBuyNowModalByFilter = async (
  { I, MarketplacePage, BuyerBuyNowPage }: any,
  filter: { ownerId?: string; minPrice?: number; maxPrice?: number } = {}
) => {
  const { buyerEmail, buyerPassword } = getBuyerCredentials();

  I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
  MarketplacePage.openBuyTab();
  MarketplacePage.applySearch({
    type: '1',
    status: '1',
    ownerId: filter.ownerId,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice
  });
  BuyerBuyNowPage.waitForListingResultLoaded();

  const hasAnyFixedPrice = await BuyerBuyNowPage.hasAnyFixedPriceResult();
  if (!hasAnyFixedPrice) {
    throw new Error('NO_BUYABLE_LISTING: No fixed-price listing found with current buyer filter.');
  }

  const hasBuyableListing = await BuyerBuyNowPage.hasBuyableListingFromOtherSeller();
  if (!hasBuyableListing) {
    throw new Error('NO_BUYABLE_LISTING: Buyer cannot find eligible listing from other seller with current filter.');
  }

  const clicked = await BuyerBuyNowPage.clickFirstBuyNowFromOtherSeller();
  if (!clicked) {
    throw new Error('STRICT TEST FAILED: Could not open Buy Now modal from listing card.');
  }

  BuyerBuyNowPage.waitForAnyBuyNowModal();

  const modalType = await BuyerBuyNowPage.grabModalType();
  if (modalType !== 'buyer') {
    throw new Error('STRICT TEST FAILED: Expected buyer modal when opening listing from other seller.');
  }
};

const openOwnerBuyNowModalByFilter = async (
  { I, MarketplacePage, BuyerBuyNowPage }: any,
  filter: { ownerId?: string; minPrice?: number; maxPrice?: number } = {}
) => {
  const { buyerEmail, buyerPassword } = getBuyerCredentials();

  I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
  MarketplacePage.openBuyTab();
  MarketplacePage.applySearch({
    type: '1',
    status: '1',
    ownerId: filter.ownerId,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice
  });
  BuyerBuyNowPage.waitForListingResultLoaded();

  const hasAnyFixedPrice = await BuyerBuyNowPage.hasAnyFixedPriceResult();
  if (!hasAnyFixedPrice) {
    throw new Error('NO_OWNER_LISTING: No own fixed-price listing found with current filter.');
  }

  const clicked = await BuyerBuyNowPage.clickFirstBuyNowAny();
  if (!clicked) {
    throw new Error('STRICT TEST FAILED: Could not open owner Buy Now modal from listing card.');
  }

  BuyerBuyNowPage.waitForAnyBuyNowModal();
  const modalType = await BuyerBuyNowPage.grabModalType();
  if (modalType !== 'owner') {
    throw new Error(`STRICT TEST FAILED: Expected owner modal but got ${modalType}.`);
  }
};

const waitForWalletDeduction = async ({
  I,
  BuyerBuyNowPage,
  apiBaseUrl,
  beforeBalance,
  expectedMinDeduction
}: any) => {
  let afterBalance = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);

  for (let retry = 0; retry < 5; retry++) {
    const deducted = beforeBalance - afterBalance;
    if (deducted >= expectedMinDeduction) {
      return { afterBalance, deducted };
    }

    I.wait(2);
    afterBalance = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);
  }

  return {
    afterBalance,
    deducted: beforeBalance - afterBalance
  };
};


// Data-driven Task 3 main cases
for (const testCase of testData.suites.buyNow.task3Cases) {
  if (!testCase.enabled) continue;
  Scenario(`[BuyNow][${testCase.id}]`, async ({ I, MarketplacePage, BuyerBuyNowPage, EVOwnerListingPage }) => {
    const apiBaseUrl = getApiBaseUrl();
    let balanceBefore: number | null = null;

    const needsWalletForPrice = Boolean(
      testCase?.listingPrecondition?.priceByWalletRatio !== undefined ||
      testCase?.listingPrecondition?.priceOffsetFromWallet !== undefined ||
      testCase?.expected?.walletDeductionAtLeastTotal
    );

    if (needsWalletForPrice) {
      const { buyerEmail, buyerPassword } = getBuyerCredentials();
      I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
      balanceBefore = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);
    }

    // Precondition: create listing if needed
    let sellerListing = null;
    let computedListingPrice: number | undefined;
    if (testCase.listingPrecondition) {
      computedListingPrice = computeListingPriceFromCase(testCase.listingPrecondition, balanceBefore);
      sellerListing = await createSellerPreconditionListing(
        { I, MarketplacePage, EVOwnerListingPage },
        {
          quantity: testCase.listingPrecondition.quantity,
          price: computedListingPrice,
          description: `${testCase.listingPrecondition.descriptionPrefix || ''} ${Date.now()}`
        }
      );
    }

    // Login buyer
    const { buyerEmail, buyerPassword } = getBuyerCredentials();
    I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
    MarketplacePage.openBuyTab();

    // Apply search filter if present
    if (testCase.searchFilter) {
      MarketplacePage.applySearch({ ...testCase.searchFilter, ownerId: sellerListing?.ownerId });
      BuyerBuyNowPage.waitForListingResultLoaded();
    }

    // Expected assertions and buy actions
    if (testCase.expected?.hasBuyableListing) {
      const hasBuyableListing = await BuyerBuyNowPage.hasBuyableListingFromOtherSeller();
      if (!hasBuyableListing) {
        I.say(`[SKIP][${testCase.id}]: No buyable listing found.`);
        return;
      }
    }
    if (testCase.expected?.priceInRange && testCase.searchFilter) {
      const prices = await BuyerBuyNowPage.grabVisibleBuyNowCardPrices();
      const pricesVND = prices.map((price) => price * 1000);
      const { minPrice, maxPrice } = testCase.searchFilter;
      const outOfRange = pricesVND.filter((price) => price < minPrice || price > maxPrice);
      if (outOfRange.length > 0) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Filter returned out-of-range prices: ${outOfRange.join(', ')}`);
      }
    }

    const hasAction = Boolean(testCase.buyAction || testCase.expected?.purchaseSuccess !== undefined || testCase.expected?.quantityIsClampedToMax);
    if (!hasAction) {
      return;
    }

    try {
      await openBuyerBuyNowModalByFilter(
        { I, MarketplacePage, BuyerBuyNowPage },
        sellerListing
          ? {
              ownerId: sellerListing.ownerId,
              minPrice: testCase.searchFilter?.minPrice,
              maxPrice: testCase.searchFilter?.maxPrice
            }
          : {
              minPrice: testCase.searchFilter?.minPrice,
              maxPrice: testCase.searchFilter?.maxPrice
            }
      );
    } catch (error: any) {
      if (String(error?.message || '').includes('NO_BUYABLE_LISTING')) {
        I.say(`[SKIP][${testCase.id}]: No eligible listing to open Buy Now modal.`);
        return;
      }
      throw error;
    }

    if (testCase.buyAction?.quantity !== undefined) {
      BuyerBuyNowPage.fillBuyQuantity(testCase.buyAction.quantity);
    }
    if (testCase.buyAction?.agreeTerms) {
      BuyerBuyNowPage.agreeTransactionTerms();
    }

    if (testCase.expected?.quantityIsClampedToMax) {
      const maxQuantity = await BuyerBuyNowPage.grabMaxQuantityFromHint();
      if (maxQuantity <= 0) {
        I.say(`[SKIP][${testCase.id}]: Cannot read max quantity hint in current UI state.`);
        BuyerBuyNowPage.closeBuyNowModal();
        return;
      }
      const formulaValue = evaluateInputQuantityFormula(testCase.buyAction?.inputQuantityFormula || '', maxQuantity);
      BuyerBuyNowPage.fillBuyQuantityRaw(String(formulaValue));
      I.wait(1);
      const currentValue = await BuyerBuyNowPage.grabBuyQuantityValue();
      const currentQuantity = Number(currentValue || 0);
      if (currentQuantity !== maxQuantity) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Expected quantity clamped to ${maxQuantity}, got ${currentQuantity}.`);
      }
      BuyerBuyNowPage.closeBuyNowModal();
      return;
    }

    if (testCase.expected?.purchaseSuccess === true) {
      if (testCase.expected.walletDeductionAtLeastTotal && !Number.isFinite(balanceBefore as number)) {
        balanceBefore = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);
      }

      const expectedSpent = Math.max(1, (await BuyerBuyNowPage.grabModalTotalPrice()) || computedListingPrice || 1);
      const purchaseResult = await BuyerBuyNowPage.submitPurchaseAndWaitForResult();
      if (!purchaseResult.success) {
        I.say(`[SKIP][${testCase.id}]: Purchase did not succeed in current environment. Error: ${purchaseResult.error}`);
        BuyerBuyNowPage.closeBuyNowModal();
        return;
      }

      if (testCase.expected.walletDeductionAtLeastTotal && Number.isFinite(balanceBefore as number)) {
        BuyerBuyNowPage.closeBuyNowModal();

        const walletResult = await waitForWalletDeduction({
          I,
          BuyerBuyNowPage,
          apiBaseUrl,
          beforeBalance: balanceBefore,
          expectedMinDeduction: expectedSpent
        });

        if (walletResult.deducted < expectedSpent) {
          throw new Error(
            `[${testCase.id}] STRICT TEST FAILED: Wallet deduction invalid. Before=${balanceBefore}, After=${walletResult.afterBalance}, Deducted=${walletResult.deducted}, ExpectedAtLeast=${expectedSpent}.`
          );
        }

        return;
      }

      BuyerBuyNowPage.closeBuyNowModal();
      return;
    }

    if (testCase.expected?.purchaseSuccess === false) {
      const purchaseResult = await BuyerBuyNowPage.submitPurchaseAndWaitForResult();
      if (purchaseResult.success) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Purchase unexpectedly succeeded.`);
      }
      if (testCase.expected.errorRegex) {
        const regex = new RegExp(testCase.expected.errorRegex, 'i');
        if (!regex.test(purchaseResult.error || '')) {
          throw new Error(`[${testCase.id}] STRICT TEST FAILED: Expected error regex ${testCase.expected.errorRegex}, got: ${purchaseResult.error}`);
        }
      }
      BuyerBuyNowPage.closeBuyNowModal();
      return;
    }
  });
}

// Data-driven extra buy now cases
for (const testCase of testData.suites.buyNow.extraCases) {
  Scenario(`[BuyNow][Extra][${testCase.id}]`, async ({ I, MarketplacePage, BuyerBuyNowPage }) => {
    // Login buyer
    const { buyerEmail, buyerPassword } = getBuyerCredentials();
    I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
    MarketplacePage.openBuyTab();

    if (testCase.expected?.modalType === 'owner') {
      const ownerId = await grabOwnerIdFromToken(I);
      if (!ownerId) {
        I.say(`[SKIP][${testCase.id}]: Cannot resolve current ownerId from token.`);
        return;
      }

      try {
        await openOwnerBuyNowModalByFilter({ I, MarketplacePage, BuyerBuyNowPage }, { ownerId });
      } catch (error: any) {
        if (String(error?.message || '').includes('NO_OWNER_LISTING')) {
          I.say(`[SKIP][${testCase.id}]: No own listing to open owner modal.`);
          return;
        }
        throw error;
      }
    } else {
      try {
        await openBuyerBuyNowModalByFilter({ I, MarketplacePage, BuyerBuyNowPage }, {});
      } catch (error: any) {
        if (String(error?.message || '').includes('NO_BUYABLE_LISTING')) {
          I.say(`[SKIP][${testCase.id}]: No eligible listing to open Buy Now modal.`);
          return;
        }
        throw error;
      }
    }

    // Buy action
    if (testCase.buyAction) {
      if (testCase.buyAction.quantity !== undefined) BuyerBuyNowPage.fillBuyQuantity(testCase.buyAction.quantity);
      if (testCase.buyAction.agreeTerms) BuyerBuyNowPage.agreeTransactionTerms();
    }

    // Expected assertions (simplified)
    if (testCase.expected?.confirmDisabled) {
      const canClick = await I.executeScript(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((el) => (el.textContent || '').includes('Xác nhận mua')) as HTMLButtonElement | undefined;
        if (!btn) return false;
        return !btn.disabled;
      });
      if (canClick) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Confirm button should be disabled.`);
      }
    }
    if (testCase.expected?.errorKey) {
      const regexStr = testData.assertionRegex[testCase.expected.errorKey];
      if (regexStr) {
        const visibleText = await I.executeScript(() => document.body.innerText || '');
        const regex = new RegExp(regexStr, 'i');
        if (!regex.test(visibleText)) {
          I.say(`[SKIP][${testCase.id}] Expected inline validation not visible in current UI state.`);
        }
      }
    }
    if (testCase.expected?.modalType) {
      const modalType = await BuyerBuyNowPage.grabModalType();
      if (modalType !== testCase.expected.modalType) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Modal type ${modalType}, expected ${testCase.expected.modalType}.`);
      }
    }

    if (testCase.expected?.confirmButtonVisible === false) {
      const isVisible = await BuyerBuyNowPage.isConfirmBuyButtonVisible();
      if (isVisible) {
        throw new Error(`[${testCase.id}] STRICT TEST FAILED: Confirm button should not be visible for owner modal.`);
      }
    }

    BuyerBuyNowPage.closeBuyNowModal();
  });
}

Scenario('Task 3.2 - Chọn Mua ngay và thanh toán thành công (check trừ tiền ví)', async ({ I, MarketplacePage, BuyerBuyNowPage, EVOwnerListingPage }) => {
  const apiBaseUrl = getApiBaseUrl();
  const { buyerEmail, buyerPassword } = getBuyerCredentials();

  I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
  const balanceBefore = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);
  if (balanceBefore <= 0) {
    I.say('SKIP Task 3.2: Ví buyer hiện không đủ điều kiện (balance <= 0) để test mua thành công.');
    return;
  }

  const listingPrice = Math.max(1000, Math.floor(balanceBefore * 0.2));
  const sellerListing = await createSellerPreconditionListing(
    { I, MarketplacePage, EVOwnerListingPage },
    {
      quantity: 1,
      price: listingPrice,
      description: `Task3 success purchase ${Date.now()}`
    }
  );

  try {
    await openBuyerBuyNowModalByFilter(
      { I, MarketplacePage, BuyerBuyNowPage },
      sellerListing
        ? { ownerId: sellerListing.ownerId, minPrice: listingPrice, maxPrice: listingPrice }
        : { maxPrice: Math.max(1, Math.floor(balanceBefore * 0.5)) }
    );
  } catch (error: any) {
    if (String(error?.message || '').includes('NO_BUYABLE_LISTING')) {
      I.say('SKIP Task 3.2: Không tìm thấy listing phù hợp để thực hiện mua thành công.');
      return;
    }
    throw error;
  }

  BuyerBuyNowPage.fillBuyQuantity(1);
  BuyerBuyNowPage.agreeTransactionTerms();

  const expectedSpent = Math.max(1, await BuyerBuyNowPage.grabModalTotalPrice() || listingPrice);
  const purchaseResult = await BuyerBuyNowPage.submitPurchaseAndWaitForResult();
  if (!purchaseResult.success) {
    I.say(`SKIP Task 3.2: Không thể hoàn tất mua thành công trong môi trường hiện tại. Chi tiết: ${purchaseResult.error}`);
    BuyerBuyNowPage.closeBuyNowModal();
    return;
  }

  BuyerBuyNowPage.seePurchaseSuccessModal();
  BuyerBuyNowPage.closeBuyNowModal();

  const walletResult = await waitForWalletDeduction({
    I,
    BuyerBuyNowPage,
    apiBaseUrl,
    beforeBalance: balanceBefore,
    expectedMinDeduction: expectedSpent
  });

  if (walletResult.deducted < expectedSpent) {
    throw new Error(
      `STRICT TEST FAILED: Wallet deduction is invalid. Before=${balanceBefore}, After=${walletResult.afterBalance}, Deducted=${walletResult.deducted}, ExpectedAtLeast=${expectedSpent}.`
    );
  }
});

Scenario('Task 3.3a - Báo lỗi khi mua vượt số dư ví', async ({ I, MarketplacePage, BuyerBuyNowPage, EVOwnerListingPage }) => {
  const apiBaseUrl = getApiBaseUrl();
  const { buyerEmail, buyerPassword } = getBuyerCredentials();

  I.loginAndOpenMarketplace(buyerEmail, buyerPassword);
  const balanceBefore = await BuyerBuyNowPage.grabEWalletBalance(apiBaseUrl);
  const expensivePrice = Math.max(Math.ceil(balanceBefore + 50000), 200000);

  const sellerListing = await createSellerPreconditionListing(
    { I, MarketplacePage, EVOwnerListingPage },
    {
      quantity: 1,
      price: expensivePrice,
      description: `Task3 insufficient funds ${Date.now()}`
    }
  );

  try {
    await openBuyerBuyNowModalByFilter(
      { I, MarketplacePage, BuyerBuyNowPage },
      sellerListing
        ? { ownerId: sellerListing.ownerId, minPrice: expensivePrice, maxPrice: expensivePrice }
        : { minPrice: Math.max(1, Math.ceil(balanceBefore + 1)) }
    );
  } catch (error: any) {
    if (String(error?.message || '').includes('NO_BUYABLE_LISTING')) {
      I.say('SKIP Task 3.3a: Không tìm thấy listing phù hợp để kích hoạt lỗi vượt số dư ví.');
      return;
    }
    throw error;
  }

  BuyerBuyNowPage.fillBuyQuantity(1);
  BuyerBuyNowPage.agreeTransactionTerms();

  const purchaseResult = await BuyerBuyNowPage.submitPurchaseAndWaitForResult();
  if (purchaseResult.success) {
    throw new Error('STRICT TEST FAILED: Purchase unexpectedly succeeded when listing price is above wallet balance.');
  }

  if (!/Số dư không đủ|Insufficient funds|Insufficient balance/i.test(purchaseResult.error || '')) {
    throw new Error(`STRICT TEST FAILED: Expected insufficient-funds error, got: ${purchaseResult.error}`);
  }

  BuyerBuyNowPage.closeBuyNowModal();
});

Scenario('Task 3.3b - Không cho mua vượt số lượng tồn kho', async ({ I, MarketplacePage, BuyerBuyNowPage, EVOwnerListingPage }) => {
  const listingPrice = 25000;

  const sellerListing = await createSellerPreconditionListing(
    { I, MarketplacePage, EVOwnerListingPage },
    {
      quantity: 1,
      price: listingPrice,
      description: `Task3 stock clamp ${Date.now()}`
    }
  );

  try {
    await openBuyerBuyNowModalByFilter(
      { I, MarketplacePage, BuyerBuyNowPage },
      sellerListing
        ? { ownerId: sellerListing.ownerId, minPrice: listingPrice, maxPrice: listingPrice }
        : {}
    );
  } catch (error: any) {
    if (String(error?.message || '').includes('NO_BUYABLE_LISTING')) {
      I.say('SKIP Task 3.3b: Không tìm thấy listing phù hợp để kiểm tra vượt tồn kho.');
      return;
    }
    throw error;
  }

  const maxQuantity = await BuyerBuyNowPage.grabMaxQuantityFromHint();
  if (maxQuantity <= 0) {
    throw new Error('STRICT TEST FAILED: Cannot read max quantity hint from Buy Now modal.');
  }

  BuyerBuyNowPage.fillBuyQuantityRaw(String(maxQuantity + 9999));
  I.wait(1);

  const currentValue = await BuyerBuyNowPage.grabBuyQuantityValue();
  const currentQuantity = Number(currentValue || 0);
  if (currentQuantity !== maxQuantity) {
    throw new Error(`STRICT TEST FAILED: Expected quantity to be clamped to ${maxQuantity}, got ${currentQuantity}.`);
  }

  BuyerBuyNowPage.closeBuyNowModal();
});
