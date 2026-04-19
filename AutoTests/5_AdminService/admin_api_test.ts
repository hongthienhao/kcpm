Feature('Admin Service - API Testing');

Scenario('Lấy danh sách người dùng (Admin User Management)', async ({ I }) => {
  const token = await I.getApiToken('admin_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/admin/users', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Lấy báo cáo tổng quan (Admin Dashboard Reports)', async ({ I }) => {
  const token = await I.getApiToken('admin_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/admin/reports', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Lấy danh sách yêu cầu rút tiền (Admin Withdrawals)', async ({ I }) => {
  const token = await I.getApiToken('admin_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/admin/withdrawals', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});
