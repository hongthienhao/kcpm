const { I } = inject();

interface ListingData {
  quantity: number;
  price: number;
  description: string;
  agreeTerms?: boolean;
}

export = {
  // Sell form controls inside Marketplace sell tab.
  formTitle: locate('h3').withText('Niêm yết tín chỉ để bán'),
  sourceSectionTitle: locate('h3').withText('Chọn nguồn tín chỉ'),
  noVerifiedSourceMessage: locate('*').withText('Bạn không có nguồn tín chỉ nào (đã xác minh) để niêm yết.'),
  quantityInput: 'input#quantity',
  priceInput: 'input#price',
  descriptionInput: 'textarea#description',
  agreeTermsCheckbox: 'input#agreeTerms',
  submitButton: locate('button').withText('Niêm yết tín chỉ'),
  quantityErrorText: locate('*').withText('Số lượng phải lớn hơn 0'),
  inventoryHint: locate('*').withText('tín chỉ khả dụng'),

  waitForFormReady(timeout = 10) {
    I.waitForElement(this.formTitle, timeout);
    I.waitForElement(this.quantityInput, timeout);
    I.waitForElement(this.priceInput, timeout);
  },

  seeFormDisplayed() {
    I.seeElement(this.formTitle);
    I.seeElement(this.quantityInput);
    I.seeElement(this.priceInput);
    I.seeElement(this.descriptionInput);
  },

  fillRequired(data: ListingData) {
    this.waitForFormReady();
    I.fillField(this.quantityInput, String(data.quantity));
    I.fillField(this.priceInput, String(data.price));
    I.fillField(this.descriptionInput, data.description);
  },

  fillPrice(price: number) {
    I.fillField(this.priceInput, String(price));
  },

  fillQuantity(quantity: number) {
    I.fillField(this.quantityInput, String(quantity));
  },

  fillDescription(description: string) {
    I.fillField(this.descriptionInput, description);
  },

  setAgreeTerms(checked = true) {
    if (checked) {
      I.checkOption(this.agreeTermsCheckbox);
      return;
    }

    I.uncheckOption(this.agreeTermsCheckbox);
  },

  submit() {
    I.waitForElement(this.submitButton, 10);
    I.click(this.submitButton);
  },

  createListing(data: ListingData) {
    this.fillRequired(data);

    if (data.agreeTerms) {
      this.setAgreeTerms(true);
    }

    this.submit();
  },

  seeQuantityValidationError() {
    I.seeElement(this.quantityErrorText);
  },

  seeInventoryHint() {
    I.seeElement(this.inventoryHint);
  },

  seeNoVerifiedSourceMessage() {
    I.waitForText('Chọn nguồn tín chỉ', 15);
    I.see('Bạn không có nguồn tín chỉ nào', this.noVerifiedSourceMessage);
  }
};
