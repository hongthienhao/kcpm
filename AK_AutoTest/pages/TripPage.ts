const { I } = inject();

export = {
  tableTrip: 'table',
  rowTrip: 'table tbody tr',

  goToTripPage() {
    I.amOnPage('http://localhost:5173/dashboard/trips');
    I.wait(3); 
    I.waitForText('Lịch Sử Hành Trình', 15);
  },

  openSingleJourneyForm() {
    I.click('Lịch Sử Hành Trình');
    I.wait(2); 
    I.waitForText('Tải lên Hành Trình Đơn Lẻ', 10);
    I.click('Tải lên Hành Trình Đơn Lẻ');
    I.waitForElement({ xpath: "//label[contains(., 'Quãng đường')]" }, 5);
  },

  fillSingleJourneyForm(distance: string, model: string, startTime: string, endTime: string) {
    I.fillField({ xpath: "//label[contains(., 'Quãng đường')]/following::input[1]" }, distance);
    I.fillField({ xpath: "//label[contains(., 'Loại xe')]/following::input[1]" }, model);
    
    I.executeScript(function (dt: any) {
      function forceReactInput(input: any, value: any) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (nativeInputValueSetter && nativeInputValueSetter.set) {
          nativeInputValueSetter.set.call(input, value);
        } else { input.value = value; }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const startInput = document.evaluate("//label[contains(., 'Thời gian bắt đầu')]/following::input[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (startInput) forceReactInput(startInput, dt.start);
      const endInput = document.evaluate("//label[contains(., 'Thời gian kết thúc')]/following::input[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (endInput) forceReactInput(endInput, dt.end);
    }, { start: startTime, end: endTime });
  },

  submitSingleJourneyForm() {
    // Form tĩnh: Nút tải lên nằm trước nút Hủy
    I.click({ xpath: "//button[contains(., 'Hủy')]/preceding-sibling::button" });
  },

  verifyUploadSuccess() {
    I.wait(3); 
  },

  verifyJourneyInList(vehicleModel: string) {
    I.waitForText(vehicleModel, 5);
  },

  // ==========================================
  // HÀM UPLOAD FILE ĐÃ ĐƯỢC CHUẨN HÓA DỰA VÀO ẢNH
  // ==========================================

  openFileUploadForm() {
    I.click('Lịch Sử Hành Trình');
    I.wait(2); 
    
    I.waitForText('Tải lên File (CSV/JSON)', 10);
    I.click('Tải lên File (CSV/JSON)');
    
    // Đợi đúng cái tiêu đề của Modal xuất hiện để chắc chắn Popup đã mở
    I.waitForText('Tải lên Dữ liệu Hành trình', 5);
  },

  uploadJourneyFile(filePath: string) {
    // Nhét file vào hệ thống
    I.attachFile('input[type="file"]', filePath);
    
    // Đợi 2s cho Web đọc cái tên file vừa nhét vào
    I.wait(2); 
  },

  submitFileUpload() {
    // BÍ KÍP MODAL: Chọn chính xác cái nút "Tải lên" xuất hiện sau cùng trên màn hình
    I.click({ xpath: "(//button[contains(., 'Tải lên')])[last()]" });
  },

  // ==========================================
  // HÀM CHUYÊN DỤNG CHO Ý 3 (KHÔNG ẢNH HƯỞNG Ý 1)
  // ==========================================
  verifyCsvUploadSuccess(vehicleModel: string) {
    I.wait(5); // Chờ server xử lý file
    
    I.refreshPage(); // F5 Thần chưởng
    I.wait(3); 
    
    // Bấm lại vào Tab Lịch sử
    I.waitForText('Lịch Sử Hành Trình', 5);
    I.click('Lịch Sử Hành Trình');
    
    // Quét tìm chiếc xe VF9
    I.waitForText(vehicleModel, 10);
  }
}