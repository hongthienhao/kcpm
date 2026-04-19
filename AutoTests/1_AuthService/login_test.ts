// @ts-nocheck
// ============================================================
// 1_AuthService - Đăng nhập (Login)
// Frontend: http://localhost:5173
// ============================================================

Feature('Auth - Đăng nhập');

/**
 * Test đăng nhập cho 3 vai trò trong hệ thống CarbonTC.
 * Dùng các account _test đã xác nhận hoạt động (evowner_test, buyer_test, cva_test).
 */
let accounts = new DataTable(['role', 'email', 'password']);
accounts.add(['EV Owner', 'evowner_test@carbon.test', 'Password123!']);
accounts.add(['Buyer',    'buyer_test@carbon.test',   'Password123!']);
accounts.add(['CVA',      'cva_test@carbon.test',     'Password123!']);

Data(accounts).Scenario(
  '[Auth-1] Đăng nhập thành công cho từng Role',
  ({ I, current, LoginPage }) => {
    I.say(`Thực hiện test đăng nhập cho vai trò: ${current.role}`);
    I.amOnPage('/login');
    LoginPage.login(current.email, current.password);
    // Sau khi login thành công sẽ redirect sang /dashboard
    I.waitInUrl('/dashboard', 15);
    I.seeInCurrentUrl('/dashboard');
  }
).tag('@auth');

Scenario('[Auth-2] Đăng nhập thất bại - Sai mật khẩu', ({ I, LoginPage }) => {
  I.amOnPage('/login');
  LoginPage.login('evowner@gmail.com', 'SaiPass@999!');
  // Hệ thống hiện alert danger với role="alert"
  I.waitForElement('[role="alert"]', 8);
  I.seeElement('[role="alert"]');
}).tag('@auth');

Scenario('[Auth-3] Đăng nhập thất bại - Email không tồn tại', ({ I, LoginPage }) => {
  I.amOnPage('/login');
  LoginPage.login('emailkhongtontai@test.vn', 'Password123!');
  I.waitForElement('[role="alert"]', 8);
  I.seeElement('[role="alert"]');
}).tag('@auth');

Scenario('[Auth-4] Đăng nhập thất bại - Để trống email', ({ I }) => {
  I.amOnPage('/login');
  // Chỉ điền password, không điền email
  I.fillField('#password', 'Password123!');
  I.click('button[type="submit"]');
  I.wait(1);
  // React validation sẽ chặn - vẫn còn trên trang /login
  I.dontSeeInCurrentUrl('/dashboard');
}).tag('@auth');

Scenario('[Auth-5] Đăng xuất thành công', ({ I, LoginPage }) => {
  // Đăng nhập với EVOwner (không bị redirect sang /admin)
  I.amOnPage('/login');
  LoginPage.login('evowner_test@carbon.test', 'Password123!');
  I.waitInUrl('/dashboard', 15);

  // Click vào avatar/profile để mở dropdown
  I.waitForElement('[class*="userProfile"]', 10);
  I.click('[class*="userProfile"]');
  I.wait(1);

  // Click nút Đăng xuất trong dropdown menu (Portal rendered)
  I.waitForElement('[class*="logoutItem"]', 8);
  I.click('[class*="logoutItem"]');
  I.wait(1);
  
  // Xác nhận trong modal
  I.waitForElement('//button[contains(text(),"Đăng xuất")]', 8);
  I.click('//button[contains(text(),"Đăng xuất")]');

  // Sau khi đăng xuất sẽ redirect về /login
  I.waitInUrl('/login', 10);
  I.seeInCurrentUrl('/login');
}).tag('@auth');
