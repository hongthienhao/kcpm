const { I } = inject();

export = {
  route: '/admin/disputes',
  pageTitle: locate('h4').withText('Dispute Management'),
  
  // Nút xem chi tiết trong DataGrid (dùng Tooltip với title)
  viewDetailButtonInRow: '[title="View Details"]',
  
  dialogTitle: locate('[role="dialog"] h6'), // Chứa "Dispute Details #xyz"
  
  // Edit button trong dialog (IconButton chứa Edit icon với aria-label)
  editButton: locate('[role="dialog"] button').withDescendant('[aria-label*="Edit"]'),
  
  // MUI Radio group labels
  resolutionApproveNode: locate('label').withText('Approve (User is right)'),
  resolutionRejectNode: locate('label').withText('Reject (User is wrong)'),
  
  // ActionType Labels
  actionRefundNode: locate('label').withText('Refund buyer'),
  
  // TextArea với label "Resolution Notes *"
  resolutionNotesInput: 'textarea[name="resolutionNotes"]',
  saveChangesBtn: locate('button').withText('Save Changes'),

  open() {
    I.amOnPage(this.route);
    I.waitForElement(this.pageTitle, 10);
    I.waitForElement('[role="grid"]', 10);
    I.wait(2);
  },

  viewDisputeDetail() {
    I.executeScript(() => {
      // Tìm bằng title (Tooltip truyền xuống)
      const btn = document.querySelector('[title="View Details"]');
      if (btn) { (btn as HTMLElement).click(); return; }
      
      // Tìm bằng icon Visibility
      const icon = document.querySelector('[data-testid="VisibilityIcon"]');
      if (icon) {
        const parentBtn = icon.closest('button');
        if (parentBtn) parentBtn.click();
      }
    });
    I.waitForElement(this.dialogTitle, 10);
  },

  /**
   * Hoàn tiền cho Buyer: Chọn Approve -> Chọn Refund -> Nhập Note -> Lưu
   */
  resolveRefundBuyer(note: string) {
    I.waitForElement(this.editButton, 5);
    I.click(this.editButton);
    
    // Chọn label Radio thay vì input (vì MUI ẩn input auth radio)
    I.waitForElement(this.resolutionApproveNode, 5);
    I.click(this.resolutionApproveNode);
    
    // Khi Approve -> hiện bảng Action -> Chọn Refund
    I.waitForElement(this.actionRefundNode, 5);
    I.click(this.actionRefundNode);
    
    I.fillField(this.resolutionNotesInput, note);
    I.click(this.saveChangesBtn);
    
    // Đợi UI chuyển lại về View mode
    I.wait(3); 
  },

  /**
   * Dispute bị từ chối: Chọn Reject -> Không có action phụ -> Nhập note -> Lưu
   */
  resolveRejectBuyer(note: string) {
    I.waitForElement(this.editButton, 5);
    I.click(this.editButton);
    
    I.waitForElement(this.resolutionRejectNode, 5);
    I.click(this.resolutionRejectNode);
    
    I.fillField(this.resolutionNotesInput, note);
    I.click(this.saveChangesBtn);
    
    I.wait(3); 
  }
};

