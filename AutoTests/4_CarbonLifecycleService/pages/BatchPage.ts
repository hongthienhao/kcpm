const { I } = inject();

export = {
  // --- LOCATORS ---
  tabs: {
    journeyHistory: "Lịch Sử Hành Trình",
    pendingBatch: "Lô Chờ Gửi",
    batchHistory: "Lịch Sử Lô",
  },

  buttons: {
    // Sửa lại tên nút chuẩn xác 100% theo code React: "Tạo Lô Hành Trình"
    createBatch: locate('button').withText('Tạo Lô Hành Trình'),
    submitVerify: locate('button').withText('Gửi Xác Minh'),
  },

switchTab(tabName: string) {    I.say(`Chuyển sang tab: ${tabName}`);
    // Nâng cấp Locator: Quét đúng vào các nút Tab (class chứa chữ tabButton), 
    // tránh click nhầm vào chữ tiêu đề vô thưởng vô phạt
    const tabLocator = `//button[contains(@class, 'tabButton') and contains(., '${tabName}')]`;
    
    I.waitForElement({ xpath: tabLocator }, 5);
    I.forceClick({ xpath: tabLocator });
    
    // Tùy chọn: Chờ danh sách render xong thay vì wait cứng 2s
    I.wait(1); 
  },

selectJourneys(count: number) {    I.say(`Chọn ${count} hành trình để gom lô`);
    
    // Dựa vào code React, checkbox được render bằng thẻ input[type="checkbox"]
    const checkboxLocator = "//input[@type='checkbox']";
    
    I.waitForElement({ xpath: `(${checkboxLocator})[1]` }, 15);
    
    for (let i = 1; i <= count; i++) {
      // Force click vào thẳng cái checkbox
      I.forceClick({ xpath: `(${checkboxLocator})[${i}]` });
    }
  },

  executeCreateBatch() {
    I.say('Bấm nút Tạo Lô Hành Trình');
    
    // Nút Tạo Lô Hành Trình chỉ xuất hiện SAU KHI đã chọn ít nhất 1 chuyến xe
    I.waitForElement(this.buttons.createBatch, 5);
    I.click(this.buttons.createBatch);

    I.say('Đang chờ API xử lý (Không có Modal Xác Nhận)...');
    
    // CHIẾN THUẬT MỚI: Bắt thông báo Toast
    // Code React gọi: showNotification('Tạo lô hành trình thành công!', 'success');
    I.waitForText('Tạo lô hành trình thành công!', 15);

    I.say('Chờ hệ thống tự động chuyển về tab Lô Chờ Gửi');
    // Code React gọi: setActiveTab('pending');
    // Ta kiểm tra xem tab Lô Chờ Gửi đã được thêm class 'tabActive' chưa
    I.waitForElement(`//button[contains(@class, 'tabActive') and contains(., '${this.tabs.pendingBatch}')]`, 10);
  },

  submitFirstBatchForVerification() {
    I.say('Tiến hành gửi lô đi xác minh');
    I.waitForElement(this.buttons.submitVerify, 10);
    I.click(this.buttons.submitVerify.first());
    
    // LOẠI BỎ wait(5) CỨNG NHẮC
    // Code React gọi: showNotification('Gửi yêu cầu xác minh thành công!', 'success');
    I.waitForText('Gửi yêu cầu xác minh thành công!', 15);
    
    // Đợi icon loading trên nút (spinner-border) biến mất để chắc chắn 100%
    I.waitForInvisible('.spinner-border', 10);
  },

verifyBatchStatus(expectedStatus: string) {    // Chuyển thẳng sang tab "Lịch Sử Lô" để tìm chữ trạng thái
    this.switchTab(this.tabs.batchHistory); 
    I.waitForText(expectedStatus, 15);
    I.say(`Xác nhận lô đã chuyển sang trạng thái: ${expectedStatus}`);
  }
}