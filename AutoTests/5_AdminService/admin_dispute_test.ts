// @ts-nocheck
Feature('Admin - Xử lý Tranh chấp');

/**
 * Trước mỗi test: đăng nhập Admin và điều hướng vào admin/dashboard.
 */
Before(({ I }) => {
  I.loginAsAdmin();
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 15);
});

Scenario('Admin xử lý tranh chấp: Hoàn tiền cho Buyer', async ({ I, AdminDisputePage }) => {
  AdminDisputePage.open();

  // Kiểm tra có dispute nào trong grid không
  const disputeCount = await I.executeScript(() => {
    return document.querySelectorAll('[data-testid="VisibilityIcon"], [title="View Details"]').length;
  });
  
  if (disputeCount === 0) {
    I.say('SKIP: Không có dispute nào trong hệ thống. Cần tạo dispute data trước.');
    return;
  }

  AdminDisputePage.viewDisputeDetail();
  AdminDisputePage.resolveRefundBuyer('Người mua (buyer) đã bị lừa đảo. Tiến hành hoàn tiền cho người mua.');
}).tag('@dispute-refund');

Scenario('Admin xử lý tranh chấp: Trả tiền cho Seller (Reject Buyer)', async ({ I, AdminDisputePage }) => {
  AdminDisputePage.open();

  // Kiểm tra có dispute nào trong grid không
  const disputeCount = await I.executeScript(() => {
    return document.querySelectorAll('[data-testid="VisibilityIcon"], [title="View Details"]').length;
  });
  
  if (disputeCount === 0) {
    I.say('SKIP: Không có dispute nào trong hệ thống. Cần tạo dispute data trước.');
    return;
  }

  AdminDisputePage.viewDisputeDetail();
  AdminDisputePage.resolveRejectBuyer('Người mua không cung cấp đủ bằng chứng. Tranh chấp bị từ chối, tiền sẽ được thanh toán cho seller.');
}).tag('@dispute-reject');
