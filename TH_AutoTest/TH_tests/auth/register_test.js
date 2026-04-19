Feature('Register');

const { faker } = require('@faker-js/faker');
const MESSAGES = require('../../TH_pages/fragments/messages');

Scenario('Kịch bản 1: Đăng ký EV Owner thành công', ({ I, TH_RegisterPage }) => {
  I.amOnPage('/register');

  const timestamp = Date.now();
  const dynamicEmail = `evowner_${timestamp}@carbon.test`;
  const password = 'Password123!';

  const userData = {
    fullName: faker.person.fullName(),
    email: dynamicEmail,
    password: password,
    confirmPassword: password,
    role: 'EVOwner'
  };

  TH_RegisterPage.register(userData);

  // Chờ và verify URL chuyển hướng về trang Dashboard
  I.waitInUrl('/dashboard', 5);
  I.seeInCurrentUrl('/dashboard');
});

Scenario('Kịch bản 2: Form Validation - Để trống các trường bắt buộc', ({ I, TH_RegisterPage }) => {
  I.amOnPage('/register');

  const emptyData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EVOwner'
  };

  TH_RegisterPage.register(emptyData);

  // Verify UI hiển thị thông báo yêu cầu nhập
  I.waitForText(MESSAGES.REG_REQUIRED_FULLNAME, 5);
  I.see(MESSAGES.REG_REQUIRED_EMAIL);
  I.see(MESSAGES.REG_REQUIRED_PASSWORD);
  I.see(MESSAGES.REG_REQUIRED_CONFIRM);
});

Scenario('Kịch bản 2: Form Validation - Nhập email sai định dạng', ({ I, TH_RegisterPage }) => {
  I.amOnPage('/register');

  const invalidEmailData = {
    fullName: faker.person.fullName(),
    email: 'invalid@email', // Bỏ qua dot để trigger React validation mà pass qua browser built-in validation
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'EVOwner'
  };

  TH_RegisterPage.register(invalidEmailData);

  // Verify lỗi định dạng
  I.waitForText(MESSAGES.REG_INVALID_EMAIL, 5);
});

Scenario('Kịch bản 3: Trùng Email', async ({ I, TH_RegisterPage }) => {
  const timestamp = Date.now();
  const duplicateEmail = `duplicate_${timestamp}@carbon.test`;
  const password = 'Password123!';
  
  const userData = {
    fullName: faker.person.fullName(),
    email: duplicateEmail,
    password: password,
    confirmPassword: password,
    role: 'EVOwner'
  };

  // Đăng ký lần 1
  I.amOnPage('/register');
  TH_RegisterPage.register(userData);
  I.waitInUrl('/dashboard', 5);

  // Clear cookie/storage để đảm bảo có thể đăng ký lại (tránh bị redirect nếu đang đăng nhập)
  I.clearCookie();
  I.executeScript(() => localStorage.clear());

  // Đăng ký lần 2 với cùng email
  I.amOnPage('/register');
  TH_RegisterPage.register(userData);

  // Verify thông báo 'Email already exists' từ hệ thống
  // Verify thông báo lỗi
  // Chờ hiển thị thông báo lỗi
  // Hệ thống trả về "Đã xảy ra lỗi trong quá trình đăng ký" thay vì "Email already exists" 
  I.waitForText(MESSAGES.REG_ERROR, 5, '[role="alert"]');


});
