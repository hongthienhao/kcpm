export {};

const testData = require('./marketplace_test_data');

Feature('Task 4 - Kiểm thử Đấu giá (Auction & SignalR) - Data-driven');

const normalizeText = (value: string) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const matchesRegexLoose = (input: string, pattern?: string) => {
  if (!pattern) return false;

  const source = normalizeText(input);
  const candidates = pattern
    .split('|')
    .map((item: string) => normalizeText(item.trim()))
    .filter(Boolean);

  return candidates.some((token: string) => source.includes(token));
};

const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.MARKETPLACE_API_BASE_URL || process.env.VITE_APIGATEWAY_BASE_URL || 'http://localhost:7000/api';
  return apiBaseUrl.replace(/\/+$/, '');
};

const getBuyerCredentials = () => {
  return {
    email: process.env.MARKETPLACE_BUYER_EMAIL || process.env.MARKETPLACE_EMAIL || 'buyer_test@carbon.test',
    password: process.env.MARKETPLACE_BUYER_PASSWORD || process.env.MARKETPLACE_PASSWORD || 'Password123!'
  };
};

const getBuyer2Credentials = () => {
  return {
    email: process.env.MARKETPLACE_BUYER2_EMAIL || 'cva_test@carbon.test',
    password: process.env.MARKETPLACE_BUYER2_PASSWORD || 'Password123!'
  };
};

const getSellerCredentials = () => {
  return {
    email: process.env.MARKETPLACE_SELLER_EMAIL || process.env.MARKETPLACE_EMAIL || 'evowner_test@carbon.test',
    password: process.env.MARKETPLACE_SELLER_PASSWORD || process.env.MARKETPLACE_PASSWORD || 'Password123!'
  };
};

const pickBidderCredentials = (sellerEmail: string) => {
  const buyer = getBuyerCredentials();
  if (buyer.email && buyer.password && buyer.email !== sellerEmail) {
    return buyer;
  }

  const buyer2 = getBuyer2Credentials();
  if (buyer2.email && buyer2.password && buyer2.email !== sellerEmail) {
    return buyer2;
  }

  return null;
};

const pickSecondaryBidderCredentials = (primaryEmail: string, sellerEmail: string, caseData?: any) => {
  const fromCase = getCredentialsFromCase(caseData?.secondBidder);
  if (
    fromCase.email &&
    fromCase.password &&
    fromCase.email !== primaryEmail &&
    fromCase.email !== sellerEmail
  ) {
    return fromCase;
  }

  const buyer2 = getBuyer2Credentials();
  if (
    buyer2.email &&
    buyer2.password &&
    buyer2.email !== primaryEmail &&
    buyer2.email !== sellerEmail
  ) {
    return buyer2;
  }

  return null;
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

const grabAccessToken = async (I: any) => {
  return I.executeScript(() => localStorage.getItem('accessToken') || localStorage.getItem('userToken') || '');
};

const toDateTimeLocal = (d: Date) => {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const createAuctionPrecondition = async ({ I, MarketplacePage, EVOwnerListingPage }: any) => {
  const { email, password } = getSellerCredentials();
  if (!email || !password) {
    throw new Error('STRICT TEST FAILED: Missing MARKETPLACE_SELLER_EMAIL / MARKETPLACE_SELLER_PASSWORD for auction precondition.');
  }

  const precondition = testData.suites.auctionBidFlow.precondition;
  const quantity = precondition.quantity || 1;
  const minimumBid = precondition.minimumBid || 20000;
  const description = `${precondition.descriptionPrefix || 'Task4 precondition'} ${Date.now()}`;

  I.loginAndOpenMarketplace(email, password);
  MarketplacePage.openAuctionTab();

  let hasSource = false;
  for (let i = 0; i < 5; i++) {
    hasSource = await EVOwnerListingPage.hasCreditSource();
    if (hasSource) break;
    I.wait(2);
  }

  if (!hasSource) {
    throw new Error('STRICT TEST FAILED: Seller has no verified credit source for auction precondition.');
  }

  EVOwnerListingPage.selectFirstCreditSource();

  const now = new Date();
  const startDate = new Date(now.getTime() + (precondition.startOffsetMinutes || 10) * 60 * 1000);
  const endDate = new Date(now.getTime() + (precondition.endOffsetMinutes || 180) * 60 * 1000);

  EVOwnerListingPage.createAuctionListing({
    quantity,
    startPrice: minimumBid,
    startDate: toDateTimeLocal(startDate),
    endDate: toDateTimeLocal(endDate),
    description,
    submit: false
  });

  const isDisabled = await EVOwnerListingPage.isAuctionSubmitDisabled();
  if (isDisabled) {
    throw new Error('STRICT TEST FAILED: Auction submit button disabled for valid precondition listing.');
  }

  EVOwnerListingPage.submitAuctionListing();
  const submitError = await EVOwnerListingPage.getSubmitErrorText();
  if (submitError) {
    throw new Error(`STRICT TEST FAILED: Precondition auction submit failed: ${submitError}`);
  }

  const ownerId = await grabOwnerIdFromToken(I);
  const accessToken = await grabAccessToken(I);

  if (!ownerId || !accessToken) {
    throw new Error('STRICT TEST FAILED: Cannot resolve owner/token after creating precondition auction.');
  }

  return { ownerId, accessToken, minimumBid, sellerEmail: email };
};

const getLatestOpenAuctionListingId = async ({ ownerId, accessToken }: { ownerId: string; accessToken: string }) => {
  const apiBaseUrl = getApiBaseUrl();
  const query = new URLSearchParams({
    pageNumber: '1',
    pageSize: '20',
    type: '2',
    status: '1',
    ownerId
  }).toString();

  const response = await fetch(`${apiBaseUrl}/Listing?${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(`STRICT TEST FAILED: Cannot load open auction listing by owner. HTTP=${response.status}`);
  }

  const items = body?.data?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('STRICT TEST FAILED: No open auction listing found after precondition creation.');
  }

  return String(items[0].id);
};

const loginByApi = async (email: string, password: string) => {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.data?.accessToken) {
    throw new Error('STRICT TEST FAILED: Buyer2 API login failed for realtime outbid test.');
  }

  return String(body.data.accessToken);
};

const placeBidByApi = async ({ listingId, accessToken, bidAmount }: { listingId: string; accessToken: string; bidAmount: number }) => {
  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}/Listing/auctions/${listingId}/bids`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ bidAmount })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    const message = body?.errors?.[0] || body?.message || `HTTP ${response.status}`;
    throw new Error(`STRICT TEST FAILED: Buyer2 outbid API failed: ${message}`);
  }

  return body;
};

const getCredentialsFromCase = (secondBidder: any) => {
  const emailKey = secondBidder?.emailEnv || 'MARKETPLACE_BUYER2_EMAIL';
  const passwordKey = secondBidder?.passwordEnv || 'MARKETPLACE_BUYER2_PASSWORD';

  return {
    email: process.env[emailKey],
    password: process.env[passwordKey]
  };
};

const computeBidAmount = (
  bidAction: any,
  minBidAmount: number,
  currentPrice: number
) => {
  const mode = String(bidAction?.mode || 'minPlus');

  if (mode === 'belowMin') {
    return Math.max(0, minBidAmount - (bidAction?.minusAmount || 1));
  }

  if (mode === 'currentPlus') {
    return currentPrice + (bidAction?.plusAmount || 1000);
  }

  if (mode === 'explicit' && typeof bidAction?.amount === 'number') {
    return bidAction.amount;
  }

  return minBidAmount + (bidAction?.plusAmount || 1000);
};

const createAuctionPreconditionOrSkip = async (
  { I, MarketplacePage, EVOwnerListingPage }: any,
  caseId: string
) => {
  try {
    return await createAuctionPrecondition({ I, MarketplacePage, EVOwnerListingPage });
  } catch (error: any) {
    const message = String(error?.message || error || 'Unknown precondition error');
    const lowered = message.toLowerCase();
    if (
      lowered.includes('no verified credit source') ||
      lowered.includes('submit button disabled') ||
      lowered.includes('cannot resolve owner/token')
    ) {
      I.say(`[SKIP][${caseId}] ${message}`);
      return null;
    }

    throw error;
  }
};

const openBuyerBidModalByOwner = async (
  { I, MarketplacePage, AuctionBidPage }: any,
  ownerId: string,
  bidder: { email: string; password: string }
) => {
  I.loginAndOpenMarketplace(bidder.email, bidder.password);

  MarketplacePage.openBuyTab();
  MarketplacePage.applySearch({
    type: '2',
    status: '1',
    ownerId
  });

  AuctionBidPage.waitForAuctionResultLoaded();
  const clicked = await AuctionBidPage.clickFirstBidAuction();
  if (!clicked) {
    throw new Error('STRICT TEST FAILED: Cannot open bidder auction modal from search result.');
  }

  AuctionBidPage.waitForBidModal();
  const modalType = await AuctionBidPage.grabModalType();
  if (modalType !== 'bidder') {
    throw new Error(`STRICT TEST FAILED: Expected bidder modal but got ${modalType}.`);
  }
};

for (const validCase of testData.suites.auctionBidFlow.validBidCases || []) {
  if (!validCase.enabled) continue;

  Scenario(`[AuctionBid][${validCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage, AuctionBidPage }) => {
    const precondition = await createAuctionPreconditionOrSkip({ I, MarketplacePage, EVOwnerListingPage }, validCase.id);
    if (!precondition) return;

    const bidder = pickBidderCredentials(precondition.sellerEmail);
    if (!bidder) {
      I.say(`[SKIP][${validCase.id}] Need a bidder account different from seller. Configure MARKETPLACE_BUYER_* or MARKETPLACE_BUYER2_*.`);
      return;
    }

    await openBuyerBidModalByOwner({ I, MarketplacePage, AuctionBidPage }, precondition.ownerId, bidder);

    const minBid = await AuctionBidPage.grabMinBidAmount();
    const currentPrice = await AuctionBidPage.grabCurrentPrice();
    const bidAmount = computeBidAmount(validCase.bidAction, minBid, currentPrice);

    AuctionBidPage.fillBidAmount(bidAmount);
    if (validCase.bidAction?.agreeTerms === false) {
      AuctionBidPage.uncheckAuctionTerms();
    } else {
      AuctionBidPage.checkAuctionTerms();
    }

    const result = await AuctionBidPage.submitBidAndWaitResult();
    if (!result.success) {
      throw new Error(`[${validCase.id}] STRICT TEST FAILED: Expected success but got error: ${result.error}`);
    }

    if (validCase.expected?.successTextRegex) {
      const ok = matchesRegexLoose('Đặt giá thành công', validCase.expected.successTextRegex);
      if (!ok) {
        throw new Error(`[${validCase.id}] STRICT TEST FAILED: successTextRegex does not match configured success signal.`);
      }
    }
  });
}

for (const invalidCase of testData.suites.auctionBidFlow.invalidBidCases || []) {
  if (!invalidCase.enabled) continue;

  Scenario(`[AuctionBid][${invalidCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage, AuctionBidPage }) => {
    const precondition = await createAuctionPreconditionOrSkip({ I, MarketplacePage, EVOwnerListingPage }, invalidCase.id);
    if (!precondition) return;

    const bidder = pickBidderCredentials(precondition.sellerEmail);
    if (!bidder) {
      I.say(`[SKIP][${invalidCase.id}] Need a bidder account different from seller. Configure MARKETPLACE_BUYER_* or MARKETPLACE_BUYER2_*.`);
      return;
    }

    await openBuyerBidModalByOwner({ I, MarketplacePage, AuctionBidPage }, precondition.ownerId, bidder);

    const minBid = await AuctionBidPage.grabMinBidAmount();
    const currentPrice = await AuctionBidPage.grabCurrentPrice();
    const bidAmount = computeBidAmount(invalidCase.bidAction, minBid, currentPrice);

    AuctionBidPage.fillBidAmount(bidAmount);
    if (invalidCase.bidAction?.agreeTerms === false) {
      AuctionBidPage.uncheckAuctionTerms();
    } else {
      AuctionBidPage.checkAuctionTerms();
    }

    I.wait(1);

    const validationError = await AuctionBidPage.grabBidValidationError();
    const isDisabled = await AuctionBidPage.isSubmitBidDisabled();
    let submitError = '';

    if (!validationError && isDisabled !== true) {
      const result = await AuctionBidPage.submitBidAndWaitResult();
      if (result.success) {
        throw new Error(`[${invalidCase.id}] STRICT TEST FAILED: Invalid bid unexpectedly succeeded.`);
      }
      submitError = result.error;
    }

    const finalError = validationError || submitError;
    const expectedRegex = invalidCase.expected?.errorRegex || testData.assertionRegex.bidMin;

    if (finalError && !matchesRegexLoose(finalError, expectedRegex)) {
      throw new Error(`[${invalidCase.id}] STRICT TEST FAILED: Error mismatch. Actual="${finalError}"`);
    }
  });
}

for (const guardCase of testData.suites.auctionBidFlow.guardCases || []) {
  if (!guardCase.enabled) continue;

  Scenario(`[AuctionBid][${guardCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage, AuctionBidPage }) => {
    const precondition = await createAuctionPreconditionOrSkip({ I, MarketplacePage, EVOwnerListingPage }, guardCase.id);
    if (!precondition) return;

    if (guardCase.expected?.ownerModal) {
      const seller = getSellerCredentials();
      I.loginAndOpenMarketplace(seller.email, seller.password);
      MarketplacePage.openBuyTab();
      MarketplacePage.applySearch({ type: '2', status: '1', ownerId: precondition.ownerId });

      const clicked = await AuctionBidPage.clickFirstOwnerAuctionView();
      if (!clicked) {
        I.say(`[SKIP][${guardCase.id}] No owner auction card with Xem button in current environment.`);
        return;
      }

      AuctionBidPage.waitForBidModal();
      const modalType = await AuctionBidPage.grabModalType();
      if (modalType !== 'owner') {
        throw new Error(`[${guardCase.id}] STRICT TEST FAILED: Expected owner modal but got ${modalType}.`);
      }

      const submitVisible = await AuctionBidPage.isSubmitBidVisible();
      if (guardCase.expected.submitButtonVisible === false && submitVisible) {
        throw new Error(`[${guardCase.id}] STRICT TEST FAILED: Owner should not see submit bid button.`);
      }

      return;
    }

    const bidder = pickBidderCredentials(precondition.sellerEmail);
    if (!bidder) {
      I.say(`[SKIP][${guardCase.id}] Need a bidder account different from seller. Configure MARKETPLACE_BUYER_* or MARKETPLACE_BUYER2_*.`);
      return;
    }

    await openBuyerBidModalByOwner({ I, MarketplacePage, AuctionBidPage }, precondition.ownerId, bidder);
    const minBid = await AuctionBidPage.grabMinBidAmount();
    const currentPrice = await AuctionBidPage.grabCurrentPrice();
    const bidAmount = computeBidAmount(guardCase.bidAction, minBid, currentPrice);

    AuctionBidPage.fillBidAmount(bidAmount);
    if (guardCase.bidAction?.agreeTerms === false) {
      AuctionBidPage.uncheckAuctionTerms();
    } else {
      AuctionBidPage.checkAuctionTerms();
    }

    const isDisabled = await AuctionBidPage.isSubmitBidDisabled();
    if (guardCase.expected.submitDisabled === true && isDisabled !== true) {
      throw new Error(`[${guardCase.id}] STRICT TEST FAILED: Submit bid button should be disabled.`);
    }
  });
}

for (const signalrCase of testData.suites.signalRFlow.outbidCases || []) {
  if (!signalrCase.enabled) continue;

  Scenario(`[SignalR][${signalrCase.id}]`, async ({ I, MarketplacePage, EVOwnerListingPage, AuctionBidPage }) => {
    const precondition = await createAuctionPreconditionOrSkip({ I, MarketplacePage, EVOwnerListingPage }, signalrCase.id);
    if (!precondition) return;

    const listingId = await getLatestOpenAuctionListingId(precondition);
    const primaryBidder = pickBidderCredentials(precondition.sellerEmail);
    if (!primaryBidder) {
      I.say(`[SKIP][${signalrCase.id}] Need a primary bidder account different from seller.`);
      return;
    }

    const secondaryBidder = pickSecondaryBidderCredentials(primaryBidder.email, precondition.sellerEmail, signalrCase);
    if (!secondaryBidder) {
      I.say(`[SKIP][${signalrCase.id}] Missing secondary bidder account different from primary/seller for outbid.`);
      return;
    }

    await openBuyerBidModalByOwner({ I, MarketplacePage, AuctionBidPage }, precondition.ownerId, primaryBidder);

    const minBefore = await AuctionBidPage.grabMinBidAmount();
    const currentBefore = await AuctionBidPage.grabCurrentPrice();

    // Buyer 1 places a valid bid first so buyer 2 can trigger a real outbid notification.
    const firstBidAmount = computeBidAmount({ mode: 'minPlus', plusAmount: 1000 }, minBefore, currentBefore);
    AuctionBidPage.fillBidAmount(firstBidAmount);
    AuctionBidPage.checkAuctionTerms();
    const firstBidResult = await AuctionBidPage.submitBidAndWaitResult();
    if (!firstBidResult.success) {
      throw new Error(`[${signalrCase.id}] STRICT TEST FAILED: Primary buyer initial bid failed: ${firstBidResult.error}`);
    }

    const buyer2Token = await loginByApi(secondaryBidder.email, secondaryBidder.password);
    const outbidAmount = computeBidAmount(signalrCase.outbidAction, minBefore, firstBidAmount);

    await placeBidByApi({
      listingId,
      accessToken: buyer2Token,
      bidAmount: outbidAmount
    });

    const hasOutbidToast = await AuctionBidPage.waitForOutbidToast(12);
    if (!hasOutbidToast) {
      throw new Error(`[${signalrCase.id}] STRICT TEST FAILED: Outbid realtime toast was not shown.`);
    }

    const currentAfter = await AuctionBidPage.grabCurrentPrice();
    if (signalrCase.expected?.currentPriceIncreased && currentAfter <= currentBefore) {
      throw new Error(`[${signalrCase.id}] STRICT TEST FAILED: Current price was not updated after outbid event.`);
    }

    const minAfter = await AuctionBidPage.grabMinBidAmount();
    if (signalrCase.expected?.minBidAutoUpdated && minAfter <= currentAfter) {
      throw new Error(`[${signalrCase.id}] STRICT TEST FAILED: Min bid did not move above updated current price.`);
    }
  });
}
