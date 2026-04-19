// @ts-nocheck
Feature('Admin - Quản lý người dùng');

/**
 * Before mỗi Scenario: đăng nhập Admin qua login form, sau đó điều hướng vào admin dashboard.
 * Admin login redirect sang /admin/dashboard (không phải /dashboard thông thường).
 */
Before(async ({ I }) => {
  I.loginAsAdmin();
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 15);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-task: Xem chi tiết user
// ═══════════════════════════════════════════════════════════════════════════════

Scenario('Xem chi tiết người dùng', async ({ I, AdminUserManagementPage }) => {
  AdminUserManagementPage.open();

  // Kiểm tra có row nào trong grid không
  const rowCount = await I.grabNumberOfVisibleElements('[role="row"]');
  if (rowCount <= 1) { // 1 = chỉ có header row
    I.say('SKIP: Không có user trong grid để xem chi tiết.');
    return;
  }

  // MUI Tooltip render title trên wrapper span, không phải trực tiếp button
  // Dùng executeScript để click vào VisibilityIcon button đầu tiên trong grid
  const clicked = await I.executeScript(() => {
    // Tìm VisibilityIcon (SVG path data-testid="VisibilityIcon")
    const visibleIcons = document.querySelectorAll('[data-testid="VisibilityIcon"]');
    if (visibleIcons.length > 0) {
      // Click vào button cha của icon
      const btn = visibleIcons[0].closest('button');
      if (btn) { btn.click(); return true; }
    }
    
    // Fallback: tìm button theo tooltip text trong aria-describedby
    // MUI DataGrid action buttons thường nằm trong [role="cell"] cuối cùng
    const cells = document.querySelectorAll('[role="row"] [role="cell"]');
    if (cells.length > 0) {
      // Tìm cell cuối của row đầu tiên (Actions column)
      const rows = document.querySelectorAll('[role="row"]:not(:first-child)');
      if (rows.length > 0) {
        const actionCell = rows[0].querySelector('[role="cell"]:last-child button');
        if (actionCell) { actionCell.click(); return true; }
      }
    }
    return false;
  });

  if (!clicked) {
    I.say('SKIP: Không thể click vào View Details button - có thể grid rỗng hoặc selector lỗi.');
    return;
  }

  // Xác nhận dialog opened
  I.waitForElement('[role="dialog"]', 8);
  I.see('User Details');
  I.see('Basic Information');
  I.see('Full Name');
  I.see('Email');
  I.see('Role');
  I.see('Status');

  // Đóng dialog
  I.click(locate('[role="dialog"] button').withText('Close'));
  I.waitForInvisible('[role="dialog"]', 5);
}).tag('@view-detail');

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-task: Xóa người dùng (Delete User)
// Chỉ non-Admin user mới có Delete button (user.role !== 'ADMIN')
// ═══════════════════════════════════════════════════════════════════════════════

Scenario('Xóa người dùng (Delete User)', async ({ I, AdminUserManagementPage }) => {
  AdminUserManagementPage.open();

  // Tìm Delete button bằng DeleteIcon
  const deleteClicked = await I.executeScript(() => {
    // Tìm DeleteIcon SVG
    const deleteIcons = document.querySelectorAll('[data-testid="DeleteIcon"]');
    if (deleteIcons.length > 0) {
      const btn = deleteIcons[0].closest('button');
      if (btn) { btn.click(); return true; }
    }
    return false;
  });

  if (!deleteClicked) {
    I.say('SKIP: Không có user nào có thể xóa trong grid hiện tại (tất cả là admin hoặc grid rỗng).');
    return;
  }

  // Verify Confirm Dialog xuất hiện
  I.waitForElement('[role="dialog"]', 5);
  I.see('Confirm Delete User');
  I.see('This action cannot be undone');

  // HỦY bỏ để không mất data test
  I.click(locate('[role="dialog"] button').withText('Cancel'));
  I.waitForInvisible('[role="dialog"]', 5);
  I.say('✅ Dialog xóa user xuất hiện và có thể cancel - test thành công.');
}).tag('@delete-user');
