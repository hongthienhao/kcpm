// @ts-nocheck
// ============================================================
// 2_WalletService - Nạp tiền (Deposit)
// Frontend: http://localhost:5173/dashboard/wallet
// ============================================================

Feature('Ví tiền - Nạp tiền @wallet');

Before(({ I }) => {
  // Đăng nhập bằng EVOwner (người dùng có quyền thao tác ví tiền)
  I.loginAsEVOwner();
  // Điều hướng đến trang Ví
  I.amOnPage('/dashboard/wallet');
  
  // Đợi card ví tiền load - linh hoạt giữa Tiếng Việt và Tiếng Anh
  I.waitForText('Số dư ví tiền', 20);
  I.wait(2);
});

Scenario('[Wallet-Deposit-1] Tạo yêu cầu nạp tiền và nhận link thanh toán', async ({ I, WalletPage }) => {
  // Mở modal nạp tiền
  WalletPage.openDepositModal();
  
  // Điền số tiền
  WalletPage.fillDepositForm('500000');
  
  // Submit để tạo yêu cầu
  WalletPage.submitDeposit();
  
  // Sau khi submit thành công, modal chuyển sang trạng thái success
  // Hiển thị nút "Tiếp tục thanh toán" (link VNPay)
  I.waitForElement(WalletPage.btnContinuePayment, 10);
  I.seeElement(WalletPage.btnContinuePayment);
  I.say('✅ Tạo yêu cầu nạp tiền thành công. Link thanh toán VNPay được hiển thị.');
}).tag('@wallet');
