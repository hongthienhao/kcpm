Feature('Admin - Quản lý người dùng');

/**
 * Before mỗi Scenario: đăng nhập Admin qua AdminLoginPage rồi vào Dashboard.
 *
 * AdminLoginPage được CodeceptJS inject tự động qua codecept.conf.ts → include.
 * Không cần import thủ công.
 */
Before(async ({ I, AdminLoginPage }) => {
  // Đăng nhập qua AdminLoginPage — dùng account admin thật hoặc biến môi trường
  await AdminLoginPage.loginAsAdmin(
    process.env.ADMIN_EMAIL    || 'admin_final@carbon.com',
    process.env.ADMIN_PASSWORD || '123456',
  );
  // Chuyển thẳng vào trang Admin Dashboard
  I.amOnPage('/admin/dashboard');
  I.waitInUrl('/admin/dashboard', 10);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-task: Xem chi tiết user
// ═══════════════════════════════════════════════════════════════════════════════

Scenario('Xem chi tiết người dùng', ({ I, AdminUserManagementPage }) => {
  AdminUserManagementPage.open();

  // Mở dialog xem chi tiết user đầu tiên trong grid
  AdminUserManagementPage.viewUserDetail();

  // ── Xác nhận dialog đã mở ──────────────────────────────────────────────────
  I.see('User Details');          // DialogTitle h6

  // ── Xác nhận 3 section headings ────────────────────────────────────────────
  I.see('Basic Information');     // UserDetailDialog.tsx
  I.see('Additional Information'); // UserDetailDialog.tsx
  I.see('Timestamps');            // UserDetailDialog.tsx

  // ── Xác nhận các field label trong <InfoRow> ───────────────────────────────
  I.see('Full Name');
  I.see('Email');
  I.see('Phone Number');
  I.see('Role');
  I.see('Status');
  I.see('Created At');

  // ── Đóng dialog ────────────────────────────────────────────────────────────
  AdminUserManagementPage.closeDetailDialog();
}).tag('@view-detail');

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-task: Xóa người dùng (Delete User)
// Thay thế Block/Unblock vì Giao Diện Thực Tế Frontend chỉ cung cấp tính năng Delete.
// ═══════════════════════════════════════════════════════════════════════════════

Scenario('Xóa người dùng (Delete User)', ({ I, AdminUserManagementPage }) => {
  AdminUserManagementPage.open();

  // Dùng search để tìm user test (nếu có user test) hoặc click xóa hàng đầu tiên cho phép xóa.
  // Ghi chú: Frontend chặn (role !== 'ADMIN') cho DeleteButton! Khuyến khích tạo test user trước.
  AdminUserManagementPage.openDeleteDialog();

  // Verify Confirm Dialog xuất hiện
  I.see('Confirm Delete User');
  I.see('This action cannot be undone');

  // Xác nhận xóa
  AdminUserManagementPage.confirmDeleteUser();

  // Sau khi xóa grid sẽ refresh và dialog đóng lại
  I.wait(2);
}).tag('@delete-user');
