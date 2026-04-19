Feature('Login');

// Data Table chứa kịch bản đăng nhập cho 4 vai trò
const MESSAGES = require('../../TH_pages/fragments/messages');

let accounts = new DataTable(['role', 'email', 'password']);
accounts.add(['EV Owner', 'evowner@gmail.com', 'kcpm1234']);
accounts.add(['Buyer', 'buyer@gmail.com', 'kcpm1234']);
accounts.add(['Admin', 'admin@gmail.com', 'kcpm1234']);
accounts.add(['CVA', 'cva@gmail.com', 'kcpm1234']);

Data(accounts).Scenario('Đăng nhập thành công cho từng Role', ({ I, current, TH_LoginPage }) => {
  // Ghi log để dễ theo dõi
  I.say(`Thực hiện test đăng nhập cho vai trò: ${current.role}`);
  
  // Truy cập trang đăng nhập
  I.amOnPage('/login'); // Hãy đảm bảo URL này đúng với hệ thống thực tế
  
  // Gọi hàm từ Page Object
  TH_LoginPage.login(current.email, current.password);
  
  // Chờ và verify URL chuyển hướng về trang Dashboard
  I.waitInUrl('/dashboard', 5); // Chờ tối đa 5s để chuyển trang
  I.seeInCurrentUrl('/dashboard');
});

Scenario('Đăng nhập thất bại - Nhập sai mật khẩu', ({ I, TH_LoginPage }) => {
  I.amOnPage('/login');
  TH_LoginPage.login('evowner@gmail.com', 'SaiPass123!');
  
  // Đợi dòng chữ đặc trưng mà API trả về
  I.waitForText('thất bại', 5);
  I.see(MESSAGES.LOGIN_FAILED);
});

Scenario('Đăng nhập thất bại - Tài khoản bị khóa (Locked)', ({ I, TH_LoginPage }) => {
  I.amOnPage('/login');
  TH_LoginPage.login('locked_account@gmail.com', 'kcpm1234');
  
  // Chờ hiển thị thông báo liên quan đến khóa hoặc đăng nhập thất bại
  // Tuỳ thuộc API báo gì, nếu tài khoản không tồn tại nó cũng báo Đăng nhập thất bại
  I.waitForText('thất bại', 5);
  I.see(MESSAGES.LOGIN_FAILED);
});
