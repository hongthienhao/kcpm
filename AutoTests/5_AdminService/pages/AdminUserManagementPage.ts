const { I } = inject();

/**
 * Page Object: Admin User Management
 *
 * Mapping dựa trên GIAO DIỆN THỰC TẾ tại /admin/users:
 *   - Search box  : placeholder = "Search by name or email..."
 *   - Actions col : IconButton(👁) (View Details), IconButton(🗑) (Delete User)
 */

export = {
  // ─── Route ────────────────────────────────────────────────────────────────
  route: '/admin/users',
  pageTitle: locate('h4').withText('User Management'),
  dataGrid: '[role="grid"]',

  // ─── Search & Filter ──────────────────────────────────────────────────────
  searchInput: 'input[placeholder="Search by name or email..."]',

  // ─── Action Buttons trong từng row ────────────────────────────────────────
  // View Details:
  viewDetailButton: '[title="View Details"]',

  // Delete User:
  deleteButton: '[title="Delete User"]',

  // Block/Unblock (được gọi trong test):
  blockButton: locate('button').withText('Khóa'),
  unblockButton: locate('button').withText('Mở khóa'),

  // ─── Status Chip trong bảng ────────────────────────────────────────────────
  statusChipInRow: locate('[role="row"] .MuiChip-label'),

  // ─── UserDetailDialog ──────────────────────────────────────────────────────
  dialog: '[role="dialog"]',
  dialogTitle: locate('[role="dialog"] h6').withText('User Details'),
  dialogCloseButton: locate('[role="dialog"] button').withText('Close'),
  statusChipInDialog: locate('[role="dialog"] .MuiChip-label'),

  // ─── ConfirmDeleteDialog ──────────────────────────────────────────────────
  confirmDeleteDialogTitle: locate('[role="dialog"] h6').withText('Confirm Delete User'),
  confirmDeleteBtn: locate('[role="dialog"] button').withText('Delete User'),
  cancelDeleteBtn: locate('[role="dialog"] button').withText('Cancel'),

  // ─── Methods ──────────────────────────────────────────────────────────────

  open() {
    I.amOnPage(this.route);
    I.waitForElement(this.pageTitle, 10);
    I.waitForElement(this.dataGrid, 10);
    // Đợi grid load xong (có ít nhất 1 row hoặc no data message)
    I.waitForElement('[role="row"], .no-rows-message', 15);
    I.wait(2);
  },

  searchUser(keyword: string) {
    I.waitForElement(this.searchInput, 5);
    I.clearField(this.searchInput);
    I.fillField(this.searchInput, keyword);
    I.wait(2); // debounce
  },

  async viewUserDetail() {
    // Check if there are any users in grid
    const rowCount = await I.grabNumberOfVisibleElements('[role="row"]');
    if (rowCount === 0) {
      throw new Error('No users found in grid - cannot view detail');
    }

    I.waitForElement(this.viewDetailButton, 10);
    I.click(this.viewDetailButton);
    I.waitForElement(this.dialogTitle, 10);
  },

  closeDetailDialog() {
    I.waitForElement(this.dialogCloseButton, 5);
    I.click(this.dialogCloseButton);
    I.waitForInvisible(this.dialog, 5);
  },

  verifyStatusInTable(statusLabel: string) {
    I.waitForElement(this.statusChipInRow, 5);
    I.see(statusLabel, this.statusChipInRow);
  },

  verifyStatusInDialog(statusLabel: string) {
    I.waitForElement(this.statusChipInDialog, 5);
    I.see(statusLabel, this.statusChipInDialog);
  },

  /**
   * Khóa user: click nút "Khóa" và chờ toast thành công.
   */
  blockUser() {
    I.waitForElement(this.blockButton, 5);
    I.click(this.blockButton);
    I.waitForText('Khóa người dùng thành công', 5);
  },

  /**
   * Mở khóa user: click nút "Mở khóa" và chờ toast thành công.
   */
  unblockUser() {
    I.waitForElement(this.unblockButton, 5);
    I.click(this.unblockButton);
    I.waitForText('Mở khóa người dùng thành công', 5);
  },

  /**
   * Mở dialog xóa user ở row đầu tiên (nhấn icon thùng rác)
   */
  openDeleteDialog() {
    I.waitForElement(this.deleteButton, 5);
    I.click(this.deleteButton);
    I.waitForElement(this.confirmDeleteDialogTitle, 5);
  },

  /**
   * Xác nhận xóa user và chờ dialog biến mất
   */
  confirmDeleteUser() {
    I.waitForElement(this.confirmDeleteBtn, 5);
    I.click(this.confirmDeleteBtn);
    I.waitForInvisible(this.confirmDeleteDialogTitle, 5);
  }
};


