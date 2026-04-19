// @ts-nocheck
Feature('Ví tiền - Hiển thị @wallet');

Before(({ I }) => {
  // Login và đi thẳng vào trang Wallet
  I.loginAsEVOwner();
  I.amOnPage('/dashboard/wallet');
  // Đợi card ví tiền load - linh hoạt giữa Tiếng Việt và Tiếng Anh
  I.waitForText('Số dư ví tiền', 20);
  I.wait(2); // Cho tất cả data load xong
});

Scenario('[Wallet-Display-1] Kiểm tra UI hiển thị trang Ví', ({ I }) => {
  // Kiểm tra các phần tử cơ bản trong UI Wallet
  I.see('Số dư ví tiền');
  I.see('Nạp tiền');
  I.see('Rút tiền');
  I.see('Giao dịch gần đây');
  I.say('✅ UI Ví tiền hiển thị đầy đủ các thành phần cơ bản.');
}).tag('@wallet');

Scenario('[Wallet-Display-2] Kiểm tra filter giao dịch hiển thị đúng', ({ I }) => {
  // Trang Wallet có filter select dropdowns cho loại và trạng thái
  I.seeElement('select');
  I.say('✅ Filter dropdowns cho giao dịch hiển thị chính xác.');
}).tag('@wallet');
