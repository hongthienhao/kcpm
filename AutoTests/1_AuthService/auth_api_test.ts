Feature('Auth Service - API Testing');

Scenario('Đăng nhập thành công qua API', async ({ I }) => {
  const res = await I.sendPostRequest('/Auth/login', {
    email: 'evowner_test@carbon.test',
    password: 'Password123!'
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Đăng nhập thất bại (sai password)', async ({ I }) => {
  const res = await I.sendPostRequest('/Auth/login', {
    email: 'evowner_test@carbon.test',
    password: 'wrongpassword'
  });
  I.seeResponseCodeIs(401);
});

Scenario('Lấy thông tin profile người dùng', async ({ I }) => {
  const token = await I.getApiToken('evowner_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/Users/profile', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});
