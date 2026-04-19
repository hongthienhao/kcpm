const { I } = inject();

interface SearchFilters {
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  ownerId?: string;
}

export = {
  // Actions for Marketplace page with Buy/Sell/Auction tabs.
  route: '/marketplace',
  tabBuy: { xpath: "//div[normalize-space()='Mua tín chỉ']" },
  tabSell: { xpath: "//div[normalize-space()='Bán tín chỉ']" },
  tabAuction: { xpath: "//div[normalize-space()='Đấu giá']" },
  typeFilter: 'select#type',
  statusFilter: 'select#status',
  minPriceFilter: 'input#minPrice',
  maxPriceFilter: 'input#maxPrice',
  ownerIdFilter: 'input#ownerId',
  searchButton: locate('button').withText('Tìm kiếm'),
  filterTitle: locate('h3').withText('Bộ lọc tìm kiếm'),
  loadingText: locate('*').withText('Đang tải dữ liệu...'),
  emptyResultText: locate('*').withText('Không tìm thấy listing nào phù hợp.'),
  appTitle: locate('*').withText('Thị trường tín chỉ carbon'),
  sellFormTitle: locate('h3').withText('Niêm yết tín chỉ để bán'),
  sourceSectionTitle: locate('h3').withText('Chọn nguồn tín chỉ'),

  open() {
    I.amOnPage(this.route);
    this.waitForLoaded();
  },

  waitForLoaded(timeout = 10) {
    I.waitForElement(this.tabBuy, timeout);
    I.waitForElement(this.tabSell, timeout);
    I.waitForElement(this.tabAuction, timeout);
    I.seeElement(this.appTitle);
  },

  applySearch(filters: SearchFilters = {}) {
    I.waitForElement(this.filterTitle, 10);

    if (filters.type) {
      I.selectOption(this.typeFilter, filters.type);
    }

    if (filters.status) {
      I.selectOption(this.statusFilter, filters.status);
    }

    if (typeof filters.minPrice === 'number') {
      I.fillField(this.minPriceFilter, String(filters.minPrice));
    }

    if (typeof filters.maxPrice === 'number') {
      I.fillField(this.maxPriceFilter, String(filters.maxPrice));
    }

    if (filters.ownerId) {
      I.fillField(this.ownerIdFilter, filters.ownerId);
    }

    I.click(this.searchButton);
    I.wait(1);
  },

  openBuyTab() {
    I.click(this.tabBuy);
    I.waitForElement(this.filterTitle, 10);
  },

  openSellTab() {
    I.forceClick(this.tabSell);
    I.wait(1);
    I.dontSeeElement(this.filterTitle);
  },

  openAuctionTab() {
    I.forceClick(this.tabAuction);
    I.waitForText('Đấu giá', 10);
  },

  seeEmptyResult() {
    I.seeElement(this.emptyResultText);
  },

  seeOnMarketplacePage() {
    I.waitInUrl(this.route, 10);
    I.seeElement(this.appTitle);
  }
};
