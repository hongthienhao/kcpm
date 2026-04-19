const { I } = inject();

interface PurchaseResult {
  success: boolean;
  error: string;
}

export = {
  typeFilter: 'select#type',
  statusFilter: 'select#status',
  ownerIdFilter: 'input#ownerId',
  searchButton: locate('button').withText('Tìm kiếm'),
  filterTitle: locate('h3').withText('Bộ lọc tìm kiếm'),
  typeFilterLabel: locate('*').withText('Loại niêm yết'),
  statusFilterLabel: locate('*').withText('Trạng thái'),
  minPriceFilterLabel: locate('*').withText('Giá tối thiểu (VNĐ)'),
  maxPriceFilterLabel: locate('*').withText('Giá tối đa (VNĐ)'),
  ownerIdFilterLabel: locate('*').withText('Mã người bán (OwnerId)'),
  loadingText: locate('*').withText('Đang tải dữ liệu...'),
  emptyResultText: locate('*').withText('Không tìm thấy listing nào phù hợp.'),
  fixedPriceBadge: locate('*').withText('Giá cố định'),
  buyNowButton: locate('button').withText('Mua ngay'),
  cardQuantityLabel: locate('*').withText('Số lượng'),
  cardUnitPriceLabel: locate('*').withText('Giá/tín chỉ'),
  cardTotalLabel: locate('*').withText('Tổng giá'),

  buyModalTitle: locate('h5').withText('Mua tín chỉ carbon'),
  ownerModalTitle: locate('h5').withText('Thông tin sản phẩm của bạn'),
  ownerNoticeTitle: locate('*').withText('Đây là sản phẩm của bạn'),
  ownerNoticeDescription: locate('*').withText('Bạn có thể xem thông tin chi tiết nhưng không thể mua sản phẩm của chính mình.'),
  transactionInfoTitle: locate('*').withText('Thông tin giao dịch'),
  availableBadge: locate('*').withText('Có sẵn'),
  transactionQuantityLabel: locate('*').withText('Số lượng tín chỉ'),
  transactionUnitPriceLabel: locate('*').withText('Đơn giá'),
  transactionTotalValueLabel: locate('*').withText('Tổng giá trị'),
  transactionSellerLabel: locate('*').withText('Người bán'),
  buyQuantityInput: 'input#buyQuantity',
  agreeTermsCheckbox: 'input#agreeTerms',
  confirmBuyButton: locate('button').withText('Xác nhận mua'),
  quantityMustBePositiveText: locate('*').withText('Số lượng phải lớn hơn 0.'),
  termsRequiredText: locate('*').withText('Vui lòng đồng ý với điều khoản giao dịch'),
  cancelButton: locate('button').withText('Hủy'),
  closeButton: locate('button').withText('Đóng'),

  purchaseSuccessTitle: locate('*').withText('Mua tín chỉ thành công!'),

  applyFixedPriceOpenFilter(ownerId?: string) {
    I.waitForElement(this.typeFilter, 10);
    I.selectOption(this.typeFilter, '1');
    I.selectOption(this.statusFilter, '1');
    I.fillField(this.ownerIdFilter, '');

    if (ownerId) {
      I.fillField(this.ownerIdFilter, ownerId);
    }

    I.click(this.searchButton);
  },

  waitForListingResultLoaded(timeout = 15) {
    I.waitForElement(this.searchButton, timeout);
    I.wait(1);
  },

  seeBuyScreenFilterUI() {
    I.waitForElement(this.filterTitle, 10);
    I.seeElement(this.typeFilterLabel);
    I.seeElement(this.statusFilterLabel);
    I.seeElement(this.minPriceFilterLabel);
    I.seeElement(this.maxPriceFilterLabel);
    I.seeElement(this.ownerIdFilterLabel);
    I.seeElement(this.typeFilter);
    I.seeElement(this.statusFilter);
    I.seeElement(this.ownerIdFilter);
    I.seeElement(this.searchButton);
  },

  seeListingCardUI() {
    I.waitForElement(this.fixedPriceBadge, 10);
    I.seeElement(this.buyNowButton);
    I.seeElement(this.cardQuantityLabel);
    I.seeElement(this.cardUnitPriceLabel);
    I.seeElement(this.cardTotalLabel);
  },

  async hasAnyFixedPriceResult() {
    const hasEmptyResult = await I.grabNumberOfVisibleElements(this.emptyResultText);
    if (hasEmptyResult > 0) {
      return false;
    }

    const buyBtnCount = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter((btn) => (btn.textContent || '').includes('Mua ngay')).length;
    });

    return Number(buyBtnCount) > 0;
  },

  async hasBuyableListingFromOtherSeller() {
    const candidateCount = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyButtons = buttons.filter((btn) => (btn.textContent || '').includes('Mua ngay'));

      const eligible = buyButtons.filter((btn) => {
        const card = btn.closest('div');
        if (!card) return false;
        return !card.querySelector('[title="Sản phẩm của bạn"]');
      });

      return eligible.length;
    });

    return Number(candidateCount) > 0;
  },

  clickFirstBuyNowFromOtherSeller() {
    return I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyButtons = buttons.filter((btn) => (btn.textContent || '').includes('Mua ngay'));

      const target = buyButtons.find((btn) => {
        const card = btn.closest('div');
        if (!card) return false;
        return !card.querySelector('[title="Sản phẩm của bạn"]');
      });

      if (target) {
        (target as HTMLButtonElement).click();
        return true;
      }

      return false;
    });
  },

  clickFirstBuyNowAny() {
    return I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((btn) => (btn.textContent || '').includes('Mua ngay'));

      if (target) {
        (target as HTMLButtonElement).click();
        return true;
      }

      return false;
    });
  },

  waitForAnyBuyNowModal(timeoutSeconds = 10) {
    I.waitForFunction(() => {
      const titles = Array.from(document.querySelectorAll('h5'));

      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return shown && (el as HTMLElement).offsetParent !== null;
      };

      return titles.some((el) => {
        const text = (el.textContent || '').trim();
        return (text === 'Mua tín chỉ carbon' || text === 'Thông tin sản phẩm của bạn') && visible(el);
      });
    }, timeoutSeconds);
  },

  fillBuyQuantity(quantity: number) {
    I.waitForElement(this.buyModalTitle, 10);
    I.waitForElement(this.buyQuantityInput, 10);
    I.fillField(this.buyQuantityInput, String(quantity));
  },

  fillBuyQuantityRaw(value: string) {
    I.waitForElement(this.buyQuantityInput, 10);
    I.fillField(this.buyQuantityInput, value);
  },

  async grabBuyQuantityValue() {
    const value = await I.grabValueFrom(this.buyQuantityInput);
    return String(value || '');
  },

  async grabMaxQuantityFromHint() {
    const max = await I.executeScript(() => {
      const smalls = Array.from(document.querySelectorAll('small'));
      const target = smalls.find((el) => {
        const text = (el.textContent || '').trim();
        return /^Số lượng tối đa:\s*[\d.,]+\s*tín chỉ$/i.test(text);
      });

      if (!target) return '';

      const text = (target.textContent || '').trim();
      const match = text.match(/([\d.,]+)/);
      if (!match) return '';

      return match[1].replace(/\./g, '').replace(/,/g, '.');
    });

    return Number(max || 0);
  },

  async grabVisibleBuyNowCardPrices() {
    const prices = await I.executeScript(() => {
      const parseNumber = (raw: string) => {
        const normalized = raw.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
        const value = Number(normalized);
        return Number.isFinite(value) ? value : NaN;
      };

      const buttons = Array.from(document.querySelectorAll('button'));
      const buyButtons = buttons.filter((btn) => (btn.textContent || '').includes('Mua ngay'));

      const collected = buyButtons
        .map((btn) => {
          const card = btn.closest('div[class*="marketplaceCard"]') || btn.closest('div');
          if (!card) return NaN;

          const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim();
          const match = cardText.match(/([\d.,]+)\s*Giá\/tín chỉ/i);
          if (!match) return NaN;

          return parseNumber(match[1]);
        })
        .filter((value) => Number.isFinite(value));

      return collected;
    });

    return Array.isArray(prices) ? prices.map((value) => Number(value)).filter((value) => Number.isFinite(value)) : [];
  },

  async grabModalTotalPrice() {
    const amount = await I.executeScript(() => {
      const parseNumber = (raw: string) => {
        const normalized = raw.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
        const value = Number(normalized);
        return Number.isFinite(value) ? value : 0;
      };

      const modalTitle = Array.from(document.querySelectorAll('h5')).find(
        (el) => (el.textContent || '').trim() === 'Mua tín chỉ carbon'
      );

      if (!modalTitle) return 0;

      const modalRoot = modalTitle.closest('div');
      const modalText = (modalRoot?.textContent || '').replace(/\s+/g, ' ').trim();
      const match = modalText.match(/Tổng giá trị\s*([\d.,]+)\s*VNĐ/i);
      if (!match) return 0;

      return parseNumber(match[1]);
    });

    return Number(amount || 0);
  },

  async grabEWalletBalance(apiBaseUrl: string) {
    const result = await I.executeScript(async (baseUrl: string) => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
      if (!token) {
        return { ok: false, balance: 0, error: 'Missing access token in localStorage.' };
      }

      const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '');
      if (!normalizedBaseUrl) {
        return { ok: false, balance: 0, error: 'Missing API base URL.' };
      }

      try {
        const response = await fetch(`${normalizedBaseUrl}/wallet/my-wallet`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*'
          }
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
          const message = body?.message || `HTTP ${response.status}`;
          return { ok: false, balance: 0, error: `Wallet API failed: ${message}` };
        }

        const candidates = [
          body?.data?.balance,
          body?.balance,
          body?.data?.wallet?.balance,
          body?.data?.availableBalance,
          body?.data?.amount
        ];

        const rawBalance = candidates.find((value) => value !== null && value !== undefined);
        const balance = Number(rawBalance);

        if (!Number.isFinite(balance)) {
          return { ok: false, balance: 0, error: 'Cannot parse wallet balance from API response.' };
        }

        return { ok: true, balance, error: '' };
      } catch (error: any) {
        return {
          ok: false,
          balance: 0,
          error: String(error?.message || 'Unknown error while loading wallet balance.')
        };
      }
    }, apiBaseUrl);

    if (!result?.ok) {
      throw new Error(`STRICT TEST FAILED: ${result?.error || 'Cannot load buyer wallet balance.'}`);
    }

    return Number(result.balance || 0);
  },

  agreeTransactionTerms() {
    I.checkOption(this.agreeTermsCheckbox);
  },

  uncheckTransactionTerms() {
    I.uncheckOption(this.agreeTermsCheckbox);
  },

  seeQuantityMustBePositiveError() {
    I.waitForElement(this.quantityMustBePositiveText, 10);
    I.seeElement(this.quantityMustBePositiveText);
  },

  seeTermsRequiredError() {
    I.waitForElement(this.termsRequiredText, 10);
    I.seeElement(this.termsRequiredText);
  },

  seeOwnerProductModal() {
    I.waitForElement(this.ownerModalTitle, 10);
    I.seeElement(this.ownerModalTitle);
  },

  seeOwnerProductModalFullUI() {
    I.waitForElement(this.ownerModalTitle, 10);
    I.seeElement(this.ownerModalTitle);
    I.seeElement(this.ownerNoticeTitle);
    I.seeElement(this.ownerNoticeDescription);
    I.seeElement(this.transactionInfoTitle);
    I.seeElement(this.availableBadge);
    I.seeElement(this.transactionQuantityLabel);
    I.seeElement(this.transactionUnitPriceLabel);
    I.seeElement(this.transactionTotalValueLabel);
    I.seeElement(this.transactionSellerLabel);
    I.seeElement(this.closeButton);
  },

  seeBuyerModalBasicUI() {
    I.waitForElement(this.buyModalTitle, 10);
    I.seeElement(this.buyModalTitle);
    I.seeElement(this.buyQuantityInput);
    I.seeElement(this.agreeTermsCheckbox);
    I.seeElement(this.confirmBuyButton);
  },

  async hasBuyerInteractionControls() {
    const hasInput = await I.grabNumberOfVisibleElements(this.buyQuantityInput);
    const hasTerms = await I.grabNumberOfVisibleElements(this.agreeTermsCheckbox);
    const hasConfirm = await I.grabNumberOfVisibleElements(this.confirmBuyButton);
    return hasInput > 0 && hasTerms > 0 && hasConfirm > 0;
  },

  async grabModalType() {
    const modalType = await I.executeScript(() => {
      const titles = Array.from(document.querySelectorAll('h5'));

      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return shown && (el as HTMLElement).offsetParent !== null;
      };

      const visibleTitles = titles
        .filter((el) => visible(el))
        .map((el) => (el.textContent || '').trim());

      const buyQuantityInput = document.querySelector('input#buyQuantity');
      const agreeTermsCheckbox = document.querySelector('input#agreeTerms');
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBuyButton = buttons.find((btn) => (btn.textContent || '').includes('Xác nhận mua'));

      const hasBuyerControls = [buyQuantityInput, agreeTermsCheckbox, confirmBuyButton].every((el) => {
        if (!el) return false;
        return visible(el);
      });

      if (hasBuyerControls) return 'buyer';

      if (visibleTitles.includes('Thông tin sản phẩm của bạn')) return 'owner';
      if (visibleTitles.includes('Mua tín chỉ carbon') && hasBuyerControls) return 'buyer';
      return 'unknown';
    });

    return String(modalType || 'unknown');
  },

  async isConfirmBuyButtonVisible() {
    const count = await I.grabNumberOfVisibleElements(this.confirmBuyButton);
    return count > 0;
  },

  async isConfirmBuyButtonDisabled() {
    const state = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirm = buttons.find((btn) => (btn.textContent || '').includes('Xác nhận mua')) as HTMLButtonElement | undefined;

      if (!confirm) return 'not-found';
      return confirm.disabled ? 'disabled' : 'enabled';
    });

    if (state === 'not-found') {
      return null;
    }

    return state === 'disabled';
  },

  closeBuyNowModal() {
    I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const closeLike = buttons.find((btn) => {
        const text = (btn.textContent || '').trim();
        return text === 'Hủy' || text === 'Đóng';
      }) as HTMLButtonElement | undefined;

      if (closeLike) {
        closeLike.click();
        return;
      }

      const iconClose = buttons.find((btn) => {
        const icon = btn.querySelector('i');
        return !!icon && (icon.className || '').includes('bi-x');
      }) as HTMLButtonElement | undefined;

      if (iconClose) {
        iconClose.click();
      }
    });

    I.wait(1);
  },

  async submitPurchaseAndWaitForResult(timeoutSeconds = 25): Promise<PurchaseResult> {
    I.click(this.confirmBuyButton);

    for (let i = 0; i < timeoutSeconds; i++) {
      const result = await I.executeScript(() => {
        const textNodes = Array.from(document.querySelectorAll('small, p, div, span, .error, .notification, .toast, [role="alert"]'));

        const visible = (el: Element) => {
          const style = window.getComputedStyle(el);
          const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          return shown && (el as HTMLElement).offsetParent !== null;
        };

        const successPatterns = ['Mua tín chỉ thành công!', 'Giao dịch thành công', 'Success'];
        const successNode = textNodes.find((el) => {
          const text = (el.textContent || '').trim();
          return successPatterns.some(p => text.includes(p)) && visible(el);
        });

        // Tìm lỗi: bắt đầu bằng "Lỗi:" HOẶC chứa các từ khóa lỗi quan trọng
        const errorKeywords = ['không đủ', 'vượt quá', 'thất bại', 'error', 'failed', 'invalid', 'đã có lỗi'];
        const errorNode = textNodes.find((el) => {
          const text = (el.textContent || '').trim().toLowerCase();
          const looksLikeError = /^lỗi:|^error:/i.test(text) || errorKeywords.some(kw => text.includes(kw));
          
          if (!looksLikeError) return false;
          
          const isVisible = visible(el);
          // Đảm bảo không nhầm với label hoặc placeholder
          return isVisible && text.length < 200; 
        });

        return {
          success: !!successNode,
          error: errorNode ? (errorNode.textContent || '').trim() : ''
        };
      });

      if (result?.success) {
        return { success: true, error: '' };
      }

      if (result?.error) {
        return { success: false, error: result.error };
      }

      I.wait(1);
    }

    return { success: false, error: 'Timed out while waiting for purchase result.' };
  },

  seePurchaseSuccessModal() {
    I.waitForElement(this.purchaseSuccessTitle, 10);
    I.seeElement(this.purchaseSuccessTitle);
  }
};
