const { I } = inject();

export = {
  // Thực tế Frontend nằm tại /admin/wallet theo React Router setup
  route: '/admin/wallet',
  pageTitle: locate('h4').withText('Wallet Management'),
  
  tabs: {
    all: locate('.MuiTab-root').withText('All'),
    pending: locate('.MuiTab-root').withText('PENDING'),
    approved: locate('.MuiTab-root').withText('APPROVED'),
    rejected: locate('.MuiTab-root').withText('REJECTED')
  },
  
  // Nút hành động trong DataGrid (Chỉ hiển thị cho PENDING)
  // MUI Tooltip truyền title xuống IconButton
  approveButtonInRow: '[title="Approve"]',
  rejectButtonInRow: '[title="Reject"]',
  
  // Confirm Dialog (Không có ô nhập lý do trong code frontend)
  confirmDialogTitle: '[role="dialog"] h2',
  confirmDialogApproveBtn: locate('[role="dialog"] button').withText('Approve'),
  confirmDialogRejectBtn: locate('[role="dialog"] button').withText('Reject'),

  open() {
    I.amOnPage(this.route);
    I.waitForElement(this.pageTitle, 10);
    // Chờ grid render xong
    I.waitForElement('[role="grid"]', 10);
    I.wait(2);
  },

  viewPendingWithdrawals() {
    I.waitForElement(this.tabs.pending, 5);
    I.click(this.tabs.pending);
    I.wait(2); // Đợi grid filter apply
  },

  approveFirstRequest() {
    I.waitForElement(this.approveButtonInRow, 10);
    I.click(this.approveButtonInRow); // Click nút Approve của yêu cầu đầu tiên
    
    // Popup xác nhận
    I.waitForElement(this.confirmDialogTitle, 5);
    I.see('Approve Request', this.confirmDialogTitle);
    I.click(this.confirmDialogApproveBtn);
    
    // Chờ snackbar báo thành công
    I.waitForText('Request approved successfully', 10);
  },

  rejectFirstRequest() {
    I.waitForElement(this.rejectButtonInRow, 10);
    I.click(this.rejectButtonInRow); // Click nút Reject của yêu cầu đầu tiên
    
    // Popup xác nhận (Không yêu cầu điền lý do theo UI hiện tại)
    I.waitForElement(this.confirmDialogTitle, 5);
    I.see('Reject Request', this.confirmDialogTitle);
    I.click(this.confirmDialogRejectBtn);
    
    // Chờ snackbar báo thành công
    I.waitForText('Request rejected successfully', 10);
  }
};

