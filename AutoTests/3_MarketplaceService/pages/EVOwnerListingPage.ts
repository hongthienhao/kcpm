const { I } = inject();

interface FixedPriceData {
  quantity: number;
  price: number;
  description: string;
  submit?: boolean;
}

interface AuctionData {
  quantity: number;
  startPrice: number;
  startDate: string;
  endDate: string;
  description: string;
  submit?: boolean;
}

export = {
  creditSourceRadio: 'input[name="creditSource"]',
  noSourceMessage: locate('*').withText('Bạn không có nguồn tín chỉ nào (đã xác minh) để niêm yết.'),

  fixedFormTitle: locate('h3').withText('Niêm yết tín chỉ để bán'),
  fixedQuantityInput: 'input#quantity',
  fixedPriceInput: 'input#price',
  fixedDescriptionInput: 'textarea#description',
  fixedAgreeTerms: 'input#agreeTerms',
  fixedSubmitButton: locate('button').withText('Niêm yết tín chỉ'),

  auctionFormTitle: locate('h3').withText('Tạo phiên đấu giá mới'),
  auctionQuantityInput: 'input#quantity',
  auctionStartPriceInput: 'input#startPrice',
  auctionStartDateInput: 'input#startDate',
  auctionEndDateInput: 'input#endDate',
  auctionDescriptionInput: 'textarea#description',
  auctionAgreeTerms: 'input#agreeTerms',
  auctionSubmitButton: locate('button').withText('Tạo phiên đấu giá'),
  submitErrorText: locate('*').withText('Lỗi: Request failed with status code 500'),

  myListingsTitle: locate('h3').withText('Niêm yết của bạn'),
  noListingsRow: locate('*').withText('Bạn chưa có niêm yết nào.'),
  editButton: { xpath: "//table//button[contains(normalize-space(.), 'Chỉnh sửa')]" },
  cancelButton: { xpath: "//table//button[normalize-space(.)='Hủy']" },

  editModalTitle: locate('h3').withText('Chỉnh sửa niêm yết'),
  editPriceInput: 'input#pricePerUnit',
  editSaveButton: locate('button').withText('Lưu thay đổi'),
  editModalCancelButton: {
    xpath: "//h3[contains(., 'Chỉnh sửa niêm yết')]/ancestor::div[contains(@class, 'modalContentStyle')][1]//button[normalize-space(.)='Hủy']"
  },

  cancelModalTitle: locate('h3').withText('Xác nhận hủy niêm yết?'),
  cancelConfirmButton: locate('button').withText('Xác nhận hủy'),

  async hasCreditSource() {
    const count = await I.executeScript((selector: string) => {
      return document.querySelectorAll(selector).length;
    }, this.creditSourceRadio);
    return Number(count) > 0;
  },

  async hasActiveListingActions() {
    const editCount = await I.grabNumberOfVisibleElements(this.editButton);
    const cancelCount = await I.grabNumberOfVisibleElements(this.cancelButton);
    return editCount > 0 && cancelCount > 0;
  },

  selectFirstCreditSource() {
    I.waitForElement(this.creditSourceRadio, 10);
    I.executeScript((selector: string) => {
      const radio = document.querySelector(selector) as HTMLInputElement | null;
      if (!radio) return;
      const label = radio.id
        ? (document.querySelector(`label[for="${radio.id}"]`) as HTMLLabelElement | null)
        : null;
      if (label) {
        label.click();
        return;
      }
      radio.click();
    }, this.creditSourceRadio);
  },

  seeNoCreditSourceMessage() {
    I.waitForElement(this.noSourceMessage, 10);
    I.seeElement(this.noSourceMessage);
  },

  setDateTimeLocalValue(selector: string, value: string) {
    I.executeScript((payload: { selector: string; value: string }) => {
      const input = document.querySelector(payload.selector) as HTMLInputElement | null;
      if (!input) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(input, payload.value);
      } else {
        input.value = payload.value;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }, { selector, value });
  },

  async getSubmitErrorText() {
    const errorText = await I.executeScript(() => {
      const candidates = Array.from(document.querySelectorAll('small, p, div, span'));
      const match = candidates.find((el) => {
        const text = (el.textContent || '').trim();
        if (!/^Lỗi:\s*Request failed with status code\s+\d{3}$/i.test(text)) {
          return false;
        }

        const style = window.getComputedStyle(el as Element);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        return isVisible && (el as HTMLElement).offsetParent !== null;
      });

      return match ? (match.textContent || '').trim() : '';
    });

    return errorText || '';
  },

  async isFixedSubmitDisabled() {
    return I.executeScript(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (el) => (el.textContent || '').includes('Niêm yết tín chỉ')
      ) as HTMLButtonElement | undefined;
      if (!btn) return true;
      return Boolean(btn.disabled);
    });
  },

  async isAuctionSubmitDisabled() {
    return I.executeScript(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (el) => (el.textContent || '').includes('Tạo phiên đấu giá')
      ) as HTMLButtonElement | undefined;
      if (!btn) return true;
      return Boolean(btn.disabled);
    });
  },

  submitFixedPriceListing() {
    I.amAcceptingPopups();
    I.click(this.fixedSubmitButton);
  },

  submitAuctionListing() {
    I.amAcceptingPopups();
    I.click(this.auctionSubmitButton);
  },

  createFixedPriceListing(data: FixedPriceData) {
    I.waitForElement(this.fixedFormTitle, 10);
    I.fillField(this.fixedQuantityInput, String(data.quantity));
    I.fillField(this.fixedPriceInput, String(data.price));
    I.fillField(this.fixedDescriptionInput, data.description);
    I.checkOption(this.fixedAgreeTerms);
    if (data.submit !== false) {
      this.submitFixedPriceListing();
    }
  },

  createAuctionListing(data: AuctionData) {
    I.waitForElement(this.auctionFormTitle, 10);
    I.fillField(this.auctionQuantityInput, String(data.quantity));
    I.fillField(this.auctionStartPriceInput, String(data.startPrice));
    this.setDateTimeLocalValue(this.auctionStartDateInput, data.startDate);
    this.setDateTimeLocalValue(this.auctionEndDateInput, data.endDate);
    I.fillField(this.auctionDescriptionInput, data.description);
    I.checkOption(this.auctionAgreeTerms);
    if (data.submit !== false) {
      this.submitAuctionListing();
    }
  },

  seeMyListingsSection() {
    I.waitForElement(this.myListingsTitle, 15);
    I.seeElement(this.myListingsTitle);
  },

  openFirstEditableListing() {
    I.waitForElement(this.editButton, 10);
    I.click(locate(this.editButton).first());
    I.waitForElement(this.editModalTitle, 10);
  },

  updateListingPrice(newPrice: number) {
    I.fillField(this.editPriceInput, String(newPrice));

    // Auction listing edits require a future end time; refresh it to avoid client-side validation lock.
    I.executeScript(() => {
      const input = document.querySelector('input#auctionEndTime') as HTMLInputElement | null;
      if (!input) return;

      const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const yyyy = String(target.getFullYear());
      const mm = String(target.getMonth() + 1).padStart(2, '0');
      const dd = String(target.getDate()).padStart(2, '0');
      const hh = String(target.getHours()).padStart(2, '0');
      const min = String(target.getMinutes()).padStart(2, '0');
      const value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(input, value);
      } else {
        input.value = value;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    I.click(this.editSaveButton);
    I.wait(1);

    I.executeScript(() => {
      const modalTitle = Array.from(document.querySelectorAll('h3')).find(
        (el) => (el.textContent || '').includes('Chỉnh sửa niêm yết')
      );

      if (!modalTitle) return;

      const modalRoot = modalTitle.closest('div');
      if (!modalRoot) return;

      const cancelBtn = Array.from(modalRoot.querySelectorAll('button')).find(
        (btn) => (btn.textContent || '').trim() === 'Hủy'
      ) as HTMLButtonElement | undefined;

      if (cancelBtn) {
        cancelBtn.click();
      }
    });
    I.wait(1);
  },

  cancelFirstActiveListing() {
    I.waitForElement(this.cancelButton, 10);
    I.click(locate(this.cancelButton).first());
    I.waitForElement(this.cancelModalTitle, 10);
    I.click(this.cancelConfirmButton);
    I.wait(1);
  }
};
