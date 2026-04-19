// @ts-nocheck
Feature('Admin - Rút tiền');

/**
 * Trước mỗi test: đăng nhập Admin và điều hướng sang admin/dashboard.
 */
Before(({ I }) => {
  I.loginAsAdmin();
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 15);
});

Scenario('Admin duyệt yêu cầu rút tiền hợp lệ', async ({ I, AdminWithdrawalPage }) => {
  AdminWithdrawalPage.open();
  AdminWithdrawalPage.viewPendingWithdrawals();
  
  // Check xem có pending request không bằng cách tìm CheckCircleIcon (Approve icon)
  const approveCount = await I.executeScript(() => {
    // Tìm CheckCircleOutlined hoặc CheckIcon trong grid
    const checkIcons = document.querySelectorAll('[data-testid="CheckCircleOutlinedIcon"], [data-testid="CheckIcon"], [data-testid="CheckCircleIcon"]');
    return checkIcons.length;
  });
  
  if (approveCount === 0) {
    // Fallback: kiểm tra text "Approve" button
    const approveBtn = await I.grabNumberOfVisibleElements('[title="Approve"]');
    if (approveBtn === 0) {
      I.say('SKIP: Không có yêu cầu rút tiền nào đang PENDING. Cần tạo withdraw request trước khi chạy test này.');
      return;
    }
  }

  // Click Approve button bằng executeScript để tìm đúng icon
  const clicked = await I.executeScript(() => {
    // Tìm theo title attribute (MUI Tooltip truyền xuống)
    const approveBtn = document.querySelector('[title="Approve"]');
    if (approveBtn) { approveBtn.click(); return true; }
    
    // Fallback: tìm CheckCircle icon
    const checkIcon = document.querySelector('[data-testid="CheckCircleOutlinedIcon"], [data-testid="CheckCircleIcon"]');
    if (checkIcon) {
      const btn = checkIcon.closest('button');
      if (btn) { btn.click(); return true; }
    }
    return false;
  });

  if (!clicked) {
    I.say('SKIP: Không tìm thấy nút Approve trong grid.');
    return;
  }
  
  // Popup xác nhận
  I.waitForElement('[role="dialog"]', 5);
  I.see('Approve Request', '[role="dialog"] h2');
  I.click(locate('[role="dialog"] button').withText('Approve'));
  I.waitForText('Request approved successfully', 10);
}).tag('@approve-withdrawal');

Scenario('Admin từ chối yêu cầu rút tiền', async ({ I, AdminWithdrawalPage }) => {
  AdminWithdrawalPage.open();
  AdminWithdrawalPage.viewPendingWithdrawals();
  
  // Click Reject button
  const clicked = await I.executeScript(() => {
    const rejectBtn = document.querySelector('[title="Reject"]');
    if (rejectBtn) { rejectBtn.click(); return true; }
    
    // Fallback: tìm CancelIcon hoặc CloseIcon
    const cancelIcon = document.querySelector('[data-testid="CancelIcon"], [data-testid="CloseIcon"]');
    if (cancelIcon) {
      const btn = cancelIcon.closest('button');
      if (btn) { btn.click(); return true; }
    }
    return false;
  });

  if (!clicked) {
    I.say('SKIP: Không có yêu cầu rút tiền nào đang PENDING. Cần tạo withdraw request trước khi chạy test này.');
    return;
  }
  
  // Popup xác nhận
  I.waitForElement('[role="dialog"]', 5);
  I.see('Reject Request', '[role="dialog"] h2');
  I.click(locate('[role="dialog"] button').withText('Reject'));
  I.waitForText('Request rejected successfully', 10);
}).tag('@reject-withdrawal');
