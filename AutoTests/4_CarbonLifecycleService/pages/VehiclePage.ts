const { I } = inject();

export = {
  // --- 1. ĐỊNH VỊ (LOCATORS) ---
  list: {
    gridContainer: '[class*="vehiclesGrid"]', 
    // Lấy text chính xác từ nút bấm trong VehicleCard.jsx
    viewDetailBtn: locate('button').withText('Xem chi tiết'), 
  },

  modal: {
    // Dựa theo text cố định render trong modal của file Vehicles.jsx
    headerText: 'Chi tiết xe',
    closeBtn: locate('button').withText('Đóng'), 
  },

  emptyState: {
    text: 'Chưa có xe điện nào',
    btnAddTrip: locate('button').withText('Thêm hành trình')
  },

  // --- 2. HÀNH ĐỘNG (ACTIONS) ---

  navigateToVehiclePage() {
    I.say('Bỏ qua Sidebar, dùng quyền Admin nhảy thẳng vào URL trang Xe điện');
    // Truy cập trực tiếp để không bị chặn bởi logic lọc menu theo Role
    I.amOnPage('/dashboard/vehicles'); 
    
    // Đợi trang load xong dữ liệu (mất icon loading vòng lặp)
    I.waitForInvisible('.bi-arrow-repeat', 15); 
    
    // Đợi tiêu đề trang xuất hiện để chắc chắn DOM đã render xong
    I.waitForText('Xe điện của tôi', 15);
  },

  verifyEmptyState() {
    I.say('Kiểm tra giao diện khi KHÔNG CÓ XE');
    I.waitForText(this.emptyState.text, 10);
    I.see(this.emptyState.text);
    I.seeElement(this.emptyState.btnAddTrip);
    I.say('Đã xác nhận hiển thị Empty State thành công');
  },

  verifyListHasData() {
    I.say('Kiểm tra giao diện khi CÓ XE');
    I.waitForElement(this.list.gridContainer, 10);
    I.say('Đã tải danh sách xe thành công');
  },

  openVehicleDetails() {
    I.say('Bấm xem chi tiết chiếc xe đầu tiên');
    // Bấm thẳng vào nút "Xem chi tiết" đầu tiên tìm thấy trong Grid
    I.waitForElement(this.list.viewDetailBtn.first(), 10);
    I.click(this.list.viewDetailBtn.first());

    I.say('Đợi Modal Chi tiết xe xuất hiện...');
    I.waitForText(this.modal.headerText, 10);
    
    // Xác minh các thông số quan trọng do Vehicles.jsx render
    I.see('Tổng quãng đường:');
    I.see('Tổng tín chỉ:');
    I.see('CO₂ giảm phát thải:');
    I.say('Đã mở và kiểm tra nội dung Modal thành công');
  },

  closeVehicleDetails() {
    I.say('Đóng Modal Chi tiết');
    I.click(this.modal.closeBtn);
    
    // Phải chờ dòng chữ tiêu đề biến mất để chắc chắn modal đã tắt hẳn
    I.waitForInvisible(`//*[text()="${this.modal.headerText}"]`, 5); 
    I.say('Đã đóng Modal an toàn');
  },

  // --- Aliases and Missing Methods for vehicle_management_test.ts ---

  goToVehiclePage() {
    this.navigateToVehiclePage();
  },

  openAddVehicleForm() {
    I.say('Mở form thêm xe');
    I.waitForElement('button[class*="addButton"]', 10);
    I.click('button[class*="addButton"]');
  },

  fillVehicleForm(plate: string, model: string, vin: string) {
    I.say(`Điền thông tin xe: ${plate}, ${model}, ${vin}`);
    I.waitForElement('input[name="licensePlate"]', 10);
    I.fillField('input[name="licensePlate"]', plate);
    I.fillField('input[name="model"]', model);
    I.fillField('input[name="vin"]', vin);
  },

  submitVehicleForm() {
    I.say('Gửi form thêm xe');
    I.click('button[type="submit"]');
  },

  verifyVehicleInList(plate: string) {
    I.say(`Kiểm tra xe ${plate} có trong danh sách`);
    I.waitForText(plate, 15);
    I.see(plate);
  }
}