// @ts-nocheck
// ============================================================
// 1_AuthService - Đăng ký (Register)
// Frontend: http://localhost:5173
// ============================================================

Feature('Auth - Đăng ký');

Scenario('[Auth-6] Đăng ký EV Owner thành công với email mới', async ({ I, RegisterPage }) => {
  const timestamp = Date.now();
  const dynamicEmail = `evowner_${timestamp}@carbon.test`;
  const password = 'Password123!';

  I.amOnPage('/register');
  RegisterPage.register({
    fullName: `Test EVOwner ${timestamp}`,
    email: dynamicEmail,
    password,
    confirmPassword: password,
    role: 'EVOwner',
  });

  // Sau khi đăng ký thành công → redirect sang /dashboard
  I.waitInUrl('/dashboard', 15);
  I.seeInCurrentUrl('/dashboard');
}).tag('@auth');

Scenario('[Auth-7] Đăng ký thất bại - Để trống tất cả trường bắt buộc', ({ I }) => {
  I.amOnPage('/register');
  // Không điền gì, chỉ click submit
  I.waitForElement('button[type="submit"]', 10);
  I.click('button[type="submit"]');
  I.wait(1);
  // React validation chặn - phải còn trên trang /register
  I.dontSeeInCurrentUrl('/dashboard');
}).tag('@auth');

Scenario('[Auth-8] Đăng ký thất bại - Email sai định dạng', ({ I, RegisterPage }) => {
  I.amOnPage('/register');
  RegisterPage.register({
    fullName: 'Test User',
    email: 'invalid-email-format',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'EVOwner',
  });
  // Browser/React email validation chặn
  I.dontSeeInCurrentUrl('/dashboard');
}).tag('@auth');

Scenario('[Auth-9] Đăng ký thất bại - Mật khẩu xác nhận không khớp', ({ I, RegisterPage }) => {
  const timestamp = Date.now();
  I.amOnPage('/register');
  RegisterPage.register({
    fullName: 'Test User Mismatch',
    email: `mismatch_${timestamp}@carbon.test`,
    password: 'Password123!',
    confirmPassword: 'DifferentPass456!',
    role: 'EVOwner',
  });
  // React validation hiển thị lỗi "Mật khẩu không khớp"
  I.waitForElement('[class*="invalidFeedback"]', 5);
  I.dontSeeInCurrentUrl('/dashboard');
}).tag('@auth');

Scenario('[Auth-10] Đăng ký thất bại - Email đã tồn tại trong hệ thống', async ({ I, RegisterPage }) => {
  // Dùng email đã có sẵn trong DB
  const existingEmail = 'evowner@gmail.com';
  const password = 'Password123!';

  I.amOnPage('/register');
  RegisterPage.register({
    fullName: 'Duplicate User',
    email: existingEmail,
    password,
    confirmPassword: password,
    role: 'EVOwner',
  });

  // Hệ thống hiển thị lỗi - role="alert" hoặc invalidFeedback
  I.waitForElement('[role="alert"], [class*="alertDanger"]', 10);
  I.dontSeeInCurrentUrl('/dashboard');
}).tag('@auth');
