const { I } = inject();

interface BidResult {
  success: boolean;
  error: string;
}

export = {
  bidButton: locate('button').withText('Đặt giá'),
  viewAuctionButton: locate('button').withText('Xem'),
  bidModalTitle: locate('h5').withText('Đặt giá cho phiên đấu giá'),
  ownerAuctionModalTitle: locate('h5').withText('Theo dõi đấu giá của bạn'),
  bidAmountInput: 'input#bidAmount',
  minBidHint: locate('small').withText('Giá tối thiểu:'),
  agreeAuctionTerms: 'input#agreeAuctionTerms',
  submitBidButton: locate('button').withText('Đặt giá'),
  bidValidationError: locate('small').withText('Giá đặt phải >='),
  bidSuccessTitle: locate('*').withText('Đặt giá thành công!'),
  outbidToastText: locate('*').withText('bị trả giá cao hơn'),

  waitForAuctionResultLoaded(timeout = 15) {
    I.waitForElement(this.bidButton, timeout);
    I.wait(1);
  },

  async hasAnyBidableAuction() {
    const count = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter((btn) => (btn.textContent || '').trim().includes('Đặt giá')).length;
    });

    return Number(count) > 0;
  },

  async hasOwnerAuction() {
    const count = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter((btn) => (btn.textContent || '').trim() === 'Xem').length;
    });

    return Number(count) > 0;
  },

  clickFirstBidAuction() {
    return I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((btn) => (btn.textContent || '').trim().includes('Đặt giá'));

      if (!target) return false;
      (target as HTMLButtonElement).click();
      return true;
    });
  },

  clickFirstOwnerAuctionView() {
    return I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((btn) => (btn.textContent || '').trim() === 'Xem');

      if (!target) return false;
      (target as HTMLButtonElement).click();
      return true;
    });
  },

  waitForBidModal(timeout = 10) {
    I.waitForFunction(() => {
      const titles = Array.from(document.querySelectorAll('h5'));
      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return shown && (el as HTMLElement).offsetParent !== null;
      };

      return titles.some((el) => {
        const text = (el.textContent || '').trim();
        return (text === 'Đặt giá cho phiên đấu giá' || text === 'Theo dõi đấu giá của bạn') && visible(el);
      });
    }, timeout);
  },

  async grabModalType() {
    const modalType = await I.executeScript(() => {
      const titles = Array.from(document.querySelectorAll('h5'));
      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return shown && (el as HTMLElement).offsetParent !== null;
      };

      const activeTitles = titles.filter((el) => visible(el)).map((el) => (el.textContent || '').trim());
      if (activeTitles.includes('Theo dõi đấu giá của bạn')) return 'owner';
      if (activeTitles.includes('Đặt giá cho phiên đấu giá')) return 'bidder';
      return 'unknown';
    });

    return String(modalType || 'unknown');
  },

  fillBidAmount(amount: number) {
    I.waitForElement(this.bidAmountInput, 10);
    I.fillField(this.bidAmountInput, String(amount));
  },

  async grabBidAmountValue() {
    const value = await I.grabValueFrom(this.bidAmountInput);
    return Number(String(value || '0').replace(/[,.\s]/g, ''));
  },

  async grabCurrentPrice() {
    const amount = await I.executeScript(() => {
      const labels = Array.from(document.querySelectorAll('div'));
      const targetLabel = labels.find((el) => (el.textContent || '').trim() === 'Giá hiện tại');
      if (!targetLabel) return 0;

      const root = targetLabel.parentElement;
      if (!root) return 0;

      const valueNode = root.querySelector('div:nth-child(2)');
      const text = (valueNode?.textContent || '').trim();
      const match = text.match(/([\d.,]+)/);
      if (!match) return 0;

      const normalized = match[1].replace(/\./g, '').replace(/,/g, '.');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    });

    return Number(amount || 0);
  },

  async grabMinBidAmount() {
    const amount = await I.executeScript(() => {
      const smalls = Array.from(document.querySelectorAll('small'));
      const target = smalls.find((el) => (el.textContent || '').includes('Giá tối thiểu:'));
      if (!target) return 0;

      const text = (target.textContent || '').trim();
      const match = text.match(/([\d.,]+)/);
      if (!match) return 0;

      const normalized = match[1].replace(/\./g, '').replace(/,/g, '.');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    });

    return Number(amount || 0);
  },

  checkAuctionTerms() {
    I.checkOption(this.agreeAuctionTerms);
  },

  uncheckAuctionTerms() {
    I.uncheckOption(this.agreeAuctionTerms);
  },

  async isSubmitBidVisible() {
    const count = await I.grabNumberOfVisibleElements(this.submitBidButton);
    return count > 0;
  },

  async isSubmitBidDisabled() {
    const state = await I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submit = buttons.find((btn) => (btn.textContent || '').trim() === 'Đặt giá') as HTMLButtonElement | undefined;
      if (!submit) return 'not-found';
      return submit.disabled ? 'disabled' : 'enabled';
    });

    if (state === 'not-found') return null;
    return state === 'disabled';
  },

  async grabBidValidationError() {
    const text = await I.executeScript(() => {
      const candidates = Array.from(document.querySelectorAll('small, p, div, span'));
      const target = candidates.find((el) => {
        const t = (el.textContent || '').trim();
        if (!/Giá đặt phải >=|Giá tối thiểu|Vui lòng đồng ý/i.test(t)) return false;

        const style = window.getComputedStyle(el);
        const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return shown && (el as HTMLElement).offsetParent !== null;
      });

      return target ? (target.textContent || '').trim() : '';
    });

    return String(text || '');
  },

  async submitBidAndWaitResult(timeoutSeconds = 20): Promise<BidResult> {
    I.click(this.submitBidButton);

    for (let i = 0; i < timeoutSeconds; i++) {
      const result = await I.executeScript(() => {
        const candidates = Array.from(document.querySelectorAll('small, p, div, span, h4'));
        const isVisible = (el: Element) => {
          const style = window.getComputedStyle(el);
          const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          return shown && (el as HTMLElement).offsetParent !== null;
        };

        const success = candidates.find((el) => {
          const text = (el.textContent || '').trim();
          return /Đặt giá thành công!/i.test(text) && isVisible(el);
        });

        if (success) {
          return { success: true, error: '' };
        }

        const errorNode = candidates.find((el) => {
          const text = (el.textContent || '').trim();
          return /Lỗi:|Giá đặt phải >=|Vui lòng đồng ý/i.test(text) && isVisible(el);
        });

        return {
          success: false,
          error: errorNode ? (errorNode.textContent || '').trim() : ''
        };
      });

      if (result.success) return result;
      if (result.error) return result;
      I.wait(1);
    }

    return { success: false, error: 'Timed out while waiting for bid result.' };
  },

  async waitForOutbidToast(timeoutSeconds = 12) {
    for (let i = 0; i < timeoutSeconds; i++) {
      const hit = await I.executeScript(() => {
        const nodes = Array.from(document.querySelectorAll('div, span'));
        const matched = nodes.find((el) => {
          const text = (el.textContent || '').trim();
          if (!/bị trả giá cao hơn|bi tra gia cao hon|outbid/i.test(text)) return false;

          const style = window.getComputedStyle(el);
          const shown = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          return shown && (el as HTMLElement).offsetParent !== null;
        });

        return Boolean(matched);
      });

      if (hit) return true;
      I.wait(1);
    }

    return false;
  },

  closeAnyModal() {
    I.executeScript(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const closeLike = buttons.find((btn) => {
        const text = (btn.textContent || '').trim();
        return text === 'Đóng' || text === 'Hủy';
      }) as HTMLButtonElement | undefined;

      if (closeLike) {
        closeLike.click();
        return;
      }

      const iconClose = buttons.find((btn) => !!btn.querySelector('i.bi-x')) as HTMLButtonElement | undefined;
      if (iconClose) {
        iconClose.click();
      }
    });

    I.wait(1);
  }
};