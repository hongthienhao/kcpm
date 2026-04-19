import LoginPage from '../pages/AdminLoginPage';

Feature('Admin - Rút tiền');

Before(async ({ I }) => {
  await LoginPage.loginAsAdmin('admin_final@carbon.com', '123456');
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 10);
});

Scenario('Admin duyệt yêu cầu rút tiền hợp lệ', ({ I, AdminWithdrawalPage }) => {
  AdminWithdrawalPage.open();
  AdminWithdrawalPage.viewPendingWithdrawals();
  AdminWithdrawalPage.approveFirstRequest();
}).tag('@approve-withdrawal');

Scenario('Admin từ chối yêu cầu rút tiền', ({ I, AdminWithdrawalPage }) => {
  AdminWithdrawalPage.open();
  AdminWithdrawalPage.viewPendingWithdrawals();
  AdminWithdrawalPage.rejectFirstRequest();
}).tag('@reject-withdrawal');

