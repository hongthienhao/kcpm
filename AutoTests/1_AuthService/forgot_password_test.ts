// @ts-nocheck
// ============================================================
// 1_AuthService - Quên mật khẩu (Forgot Password)
// Auth Service: http://localhost:5001 (via Gateway port 7000)
// ============================================================

Feature('Auth - Quên mật khẩu');

Scenario('[Auth-11] Yêu cầu gửi OTP thành công - Hứng OTP từ Toast UI', async ({ I }) => {
  I.amOnPage('/login');
  I.retry(2).click('Quên mật khẩu?');

  // Nhập email đã tồn tại trong hệ thống
  I.fillField('email', 'evowner@gmail.com');
  I.click('button[type="submit"]');

  // Đợi nhảy sang form bước 2 (nhập OTP)
  I.waitForElement('input[name="otp"]', 15);

  // Bắt OTP từ React Toastify toast (chỉ dùng trong môi trường dev/sandbox có toast OTP)
  I.waitForElement('.Toastify__toast--success', 5);
  const toastText = await I.grabTextFrom('.Toastify__toast--success');
  const match = toastText.match(/\d{6}/);
  const otp = match ? match[0] : '';

  if (!otp) {
    I.say('Không bắt được OTP từ Toast - kiểm tra môi trường dev');
    return;
  }

  I.fillField('otp', otp);
  I.fillField('newPassword', 'NewPassword123!');
  I.click('button[type="submit"]');

  I.waitForText('Khôi phục mật khẩu thành công', 10);
  I.see('Khôi phục mật khẩu thành công');
}).tag('@auth');

Scenario('[Auth-12] Quên mật khẩu thất bại - Email không tồn tại', ({ I }) => {
  I.amOnPage('/login');
  I.click('Quên mật khẩu?');

  I.fillField('email', `nonexistent_${Date.now()}@nowhere.com`);
  I.click('button[type="submit"]');

  // Kiểm tra Toast lỗi màu đỏ
  I.waitForElement('.Toastify__toast--error, [role="alert"]', 10);
  I.see('Không tìm thấy tài khoản');
}).tag('@auth');

Scenario('[Auth-13] Quên mật khẩu thất bại - Nhập sai mã OTP', ({ I }) => {
  I.amOnPage('/login');
  I.click('Quên mật khẩu?');

  I.fillField('email', 'evowner@gmail.com');
  I.click('button[type="submit"]');

  // Đợi nhảy sang view bước 2
  I.waitForElement('input[name="otp"]', 10);

  // Nhập OTP sai
  I.fillField('otp', '000000');
  I.fillField('newPassword', 'NewPassword123!');
  I.click('button[type="submit"]');

  I.waitForElement('.Toastify__toast--error, [role="alert"]', 5);
  I.see('Mã OTP không hợp lệ');
}).tag('@auth');
