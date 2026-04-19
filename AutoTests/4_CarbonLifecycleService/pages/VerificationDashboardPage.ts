const { I } = inject();

export = {
  locators: {
    pendingTab: '//button[contains(., "Chờ duyệt")]',
    approvedTab: '//button[contains(., "Đã duyệt")]',
    rejectedTab: '//button[contains(., "Đã từ chối")]',
    batchItemViewBtn: '//button[contains(., "Xem chi tiết")]', 
    emptyData: '//h4[contains(., "Không có yêu cầu")]', 
    emptyApprovedData: '//h4[contains(., "Không có yêu cầu nào đã duyệt")]',
    emptyRejectedData: '//h4[contains(., "Không có yêu cầu nào đã từ chối")]',
    detailModal: '//div[contains(@class, "modalContent")]',
    detailTitle: '//h3[contains(., "Chi tiết yêu cầu")]',
    closeModalBtn: '//button[.//i[contains(@class, "bi-x-lg")]]',
    // Locators cho luồng Duyệt và kiểm tra Tín chỉ
    auditSummaryTextArea: '//textarea[@placeholder[contains(., "tóm tắt audit")]]',
    cvaStandardDropdown: '//div[contains(@class, "selectWrapper")]//div[contains(@class, "formControl")]',
    cvaStandardFirstOption: '//div[contains(@class, "selectDropdown")]//div[contains(@class, "selectOption")][1]',
    approveSubmitBtn: '//button[.//span[text()="Duyệt"]]',
    totalCreditsSpan: '//span[contains(text(), "Tổng tín chỉ:")]',
    rejectReasonTextArea: '//textarea[@placeholder[contains(., "Nhập lý do từ chối")]]',
    rejectSubmitBtn: '//button[.//span[text()="Từ chối"]]'
  },

  goToPage() {
    I.amOnPage('/dashboard/verification'); 
    I.waitForElement(this.locators.pendingTab, 10);
  },

  filterPendingBatches() {
    I.click(this.locators.pendingTab);
    I.wait(1); 
  },

  filterApprovedBatches() {
    I.waitForElement(this.locators.approvedTab, 5);
    I.click(this.locators.approvedTab);
    I.wait(1); 
  },

  filterRejectedBatches() {
    I.waitForElement(this.locators.rejectedTab, 5);
    I.click(this.locators.rejectedTab);
    I.wait(1); 
  },

  viewDetail() {
    I.seeElement(this.locators.emptyData); 
  },

  viewFirstBatchDetail() {
    I.waitForElement(this.locators.batchItemViewBtn, 10);
    I.click(this.locators.batchItemViewBtn);
    I.wait(1);
  },

  closeModal() {
    I.waitForElement(this.locators.closeModalBtn, 5);
    I.click(this.locators.closeModalBtn);
    I.wait(1);
    I.dontSeeElement(this.locators.detailModal);
  },

  async checkCredits() {
    I.seeElement(this.locators.totalCreditsSpan);
    const creditsText = await I.grabTextFrom(this.locators.totalCreditsSpan);
    I.say(`Thông tin ${creditsText}`);
  },

  async approveBatch(summaryText: string) {
    I.fillField(this.locators.auditSummaryTextArea, summaryText);
    I.click(this.locators.cvaStandardDropdown);
    I.waitForElement(this.locators.cvaStandardFirstOption, 5);
    I.click(this.locators.cvaStandardFirstOption);
    I.click(this.locators.approveSubmitBtn);
    I.wait(2); // Chờ gọi API duyệt
  },

  async rejectBatch(summaryText: string, rejectReason: string) {
    I.waitForElement(this.locators.detailModal, 5);
    I.fillField(this.locators.auditSummaryTextArea, summaryText);
    I.fillField(this.locators.rejectReasonTextArea, rejectReason);
    I.click(this.locators.rejectSubmitBtn);
    I.wait(2);
    I.waitForInvisible(this.locators.detailModal, 5);
    I.say('Reject thành công');
  }
}