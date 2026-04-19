import LoginPage from '../pages/AdminLoginPage';

Feature('Admin - Xử lý Tranh chấp');

Before(async ({ I }) => {
  await LoginPage.loginAsAdmin('admin_final@carbon.com', '123456');
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 10);
});

Scenario('Admin xử lý tranh chấp: Hoàn tiền cho Buyer', ({ I, AdminDisputePage }) => {
  AdminDisputePage.open();
  AdminDisputePage.viewDisputeDetail();
  AdminDisputePage.resolveRefundBuyer('Người mua (buyer) đã bị lừa đảo. Tiến hành hoàn tiền cho người mua.');
}).tag('@dispute-refund');

Scenario('Admin xử lý tranh chấp: Trả tiền cho Seller (Reject Buyer)', ({ I, AdminDisputePage }) => {
  AdminDisputePage.open();
  AdminDisputePage.viewDisputeDetail();
  AdminDisputePage.resolveRejectBuyer('Người mua không cung cấp đủ bằng chứng. Tranh chấp bị từ chối, tiền sẽ được thanh toán cho seller.');
}).tag('@dispute-reject');

