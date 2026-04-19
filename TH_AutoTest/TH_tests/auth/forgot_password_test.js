const { faker } = require('@faker-js/faker');

Feature('Forgot Password Flow Optimization');

Scenario('Test 1: Yêu cầu gửi link đổi mật khẩu thành công (Hứng OTP từ UI Toast)', async ({ I }) => {
  I.amOnPage('/login');

  // Click Quên mật khẩu
  I.retry(2).click('Quên mật khẩu?');

  // Nhập email thật
  I.fillField('email', 'evowner_1774242918237@carbon.test');
  I.click('button[type="submit"]');

  // Đợi nhảy sang form 2 (chứng tỏ API đã xử lý xong, phòng trường hợp BE cold-start tốn hơn 5s)
  I.waitForElement('input[name="otp"]', 15);

  // Bắt pop-up React Toastify vừa nổ ra
  I.waitForElement('.Toastify__toast--success', 5);
  const toastText = await I.grabTextFrom('.Toastify__toast--success');

  // Trích xuất 6 số OTP bằng Regex
  const match = toastText.match(/\d{6}/);
  const otp = match ? match[0] : '';

  if (!otp) {
    throw new Error('Không bắt được OTP từ Toast Pop-up!');
  }

  // Bước 2: Điền OTP thật và pass mới
  I.fillField('otp', otp);
  I.fillField('newPassword', 'NewPassword123!');
  I.click('button[type="submit"]');

  // Verify UI báo thành công (Thẻ Div xanh lá trên form)
  I.waitForText('Khôi phục mật khẩu thành công', 10);
  I.see('Khôi phục mật khẩu thành công');
});

Scenario('Test 2: Quên mật khẩu thất bại do Email không tồn tại', ({ I }) => {
  I.amOnPage('/login');
  I.click('Quên mật khẩu?');

  const fakeEmail = faker.internet.email();
  I.fillField('email', fakeEmail);
  I.click('button[type="submit"]');

  // Kiểm tra Toast báo lỗi màu đỏ (từ authService)
  I.waitForElement('.Toastify__toast--error', 5);
  I.see('Không tìm thấy tài khoản');
});

Scenario('Test 3: Thất bại do sai mã OTP', async ({ I }) => {
  I.amOnPage('/login');
  I.click('Quên mật khẩu?');

  I.fillField('email', 'evowner@gmail.com');
  I.click('button[type="submit"]');

  // Đợi nhảy sang view bước 2
  I.waitForElement('input[name="otp"]', 5);

  // Nhập OTP fake dể bẫy lỗi
  I.fillField('otp', '000000');
  I.fillField('newPassword', 'NewPassword123!');
  I.click('button[type="submit"]');

  I.waitForElement('.Toastify__toast--error', 5);
  I.see('Mã OTP không hợp lệ');
});
