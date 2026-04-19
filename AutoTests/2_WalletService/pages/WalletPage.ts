const { I } = inject();

export = {
  // =========================================
  // Selectors (từ MoneyWalletCard + Modals)
  // =========================================
  
  // Buttons trong WalletCard (MoneyWalletCard)
  // Không có id, chỉ có text và class → dùng XPath hoặc :contains
  btnDeposit: { xpath: "//button[contains(.,'Nạp tiền')] | //button[contains(.,'Deposit')]" },
  btnWithdraw: { xpath: "//button[contains(.,'Rút tiền')] | //button[contains(.,'Withdraw')]" },

  // DepositModal
  inputDepositAmount: '#depositAmount',
  btnSubmitDeposit: { xpath: "//button[contains(.,'Tạo yêu cầu nạp tiền')] | //button[contains(.,'Create Deposit')]" },
  btnContinuePayment: { xpath: "//button[contains(.,'Tiếp tục thanh toán')] | //button[contains(.,'Continue Payment')]" },
  depositSuccessText: "Đã tạo yêu cầu nạp tiền",

  // WithdrawModal
  inputWithdrawAmount: '#withdrawAmount',
  selectWithdrawMethod: '#withdrawMethod',
  inputBankAccount: '#bankAccount',
  selectBankName: '#bankName',
  checkboxAgreeWithdraw: '#agreeTerms',
  btnConfirmWithdraw: { xpath: "//button[contains(.,'Xác nhận')] | //button[contains(.,'Confirm')]" },

  // =========================================
  // Methods
  // =========================================

  openDepositModal() {
    // Click nút Nạp tiền trong MoneyWalletCard
    I.waitForElement(this.btnDeposit, 10);
    I.click(this.btnDeposit);
    // Đợi modal mở
    I.waitForText('Tạo giao dịch nạp tiền', 8);
  },

  fillDepositForm(amount: string) {
    I.waitForElement(this.inputDepositAmount, 8);
    I.clearField(this.inputDepositAmount);
    I.fillField(this.inputDepositAmount, amount);
    // Tick checkbox đồng ý điều khoản (trong DepositModal, không có id riêng)
    I.waitForElement('input[type="checkbox"]', 3);
    // Chỉ checkOption nếu chưa checked
    I.executeScript(() => {
      const cb = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if(cb && !cb.checked) cb.click();
    });
  },

  submitDeposit() {
    I.click(this.btnSubmitDeposit);
    // Sau khi submit, modal chuyển sang state "success"
    I.waitForElement(this.depositSuccessText, 10);
  },

  openWithdrawModal() {
    // Click nút Rút tiền trong MoneyWalletCard
    I.waitForElement(this.btnWithdraw, 10);
    I.click(this.btnWithdraw);
    // Đợi modal mở
    I.waitForElement(this.selectWithdrawMethod, 8);
  },

  fillWithdrawForm(amount: string, account: string, bank: string) {
    // Điền số tiền rút
    // WithdrawModal dùng input với id="withdrawAmount" hoặc tương tự
    I.waitForElement('#withdrawAmount, input[name="amount"]', 5);
    I.clearField('#withdrawAmount, input[name="amount"]');
    I.fillField('#withdrawAmount, input[name="amount"]', amount);
    
    // Chọn phương thức: "bank" = Chuyển khoản ngân hàng
    I.selectOption(this.selectWithdrawMethod, 'bank');
    
    // Điền thông tin ngân hàng
    I.waitForElement(this.inputBankAccount, 5);
    I.fillField(this.inputBankAccount, account);
    I.selectOption(this.selectBankName, bank);
    
    // Tick điều khoản
    I.checkOption(this.checkboxAgreeWithdraw);
  },

  submitWithdraw() {
    I.click(this.btnConfirmWithdraw);
    I.wait(2);
  }
};
