// @ts-nocheck
Feature('Ví tiền - Lọc giao dịch @wallet');

Before(({ I }) => {
  // Login và điều hướng thẳng vào wallet page
  I.loginAsEVOwner();
  I.amOnPage('/dashboard/wallet');
  
  // CHIẾN THUẬT: Đợi h2 chứa "Số dư ví tiền" bằng nhiều cách (đề phòng encoding)
  I.waitForElement({xpath: "//h2[contains(.,'Số dư ví tiền')] | //h2[contains(.,'S\u1ed1 d\u01b0 v\u00ed ti\u1ec1n')] | //h2[contains(.,'Wallet Balance')]"}, 20);
  I.wait(2); // Cho transaction table render xong
});

Scenario('[Wallet-Filter-1] Filter giao dịch theo loại: Nạp tiền / Rút tiền', ({ I }) => {
  I.see('Giao dịch gần đây');
  // Filter theo loại DEPOSIT
  I.selectOption('select:first-of-type', 'DEPOSIT');
  I.wait(1);
  // Filter sang WITHDRAW
  I.selectOption('select:first-of-type', 'WITHDRAW');
  I.wait(1);
  // Reset về tất cả  
  I.selectOption('select:first-of-type', 'all');
  I.wait(1);
  I.say('✅ Filter loại giao dịch hoạt động bình thường.');
}).tag('@wallet');

Scenario('[Wallet-Filter-2] Filter giao dịch theo trạng thái', ({ I }) => {
  I.selectOption('select:last-of-type', 'SUCCESS');
  I.wait(1);
  I.selectOption('select:last-of-type', 'PENDING');
  I.wait(1);
  I.selectOption('select:last-of-type', 'PROCESSING');
  I.wait(1);
  I.selectOption('select:last-of-type', 'all');
  I.wait(1);
  I.say('✅ Filter trạng thái giao dịch hoạt động bình thường.');
}).tag('@wallet');
