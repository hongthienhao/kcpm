Feature('[Task 2] Quản lý Phương tiện');

// Hàm Before này sẽ tự động chạy 2 lần: 1 lần trước 2.1 và 1 lần trước 2.2
Before(({ I, LoginPage, test }: any) => {  
    I.say(`--- Chuẩn bị môi trường cho: ${test.title} ---`);

  if (test.title.includes('2.1')) {
    I.say('Đăng nhập tài khoản RỖNG');
    LoginPage.loginAsAdmin('test_empty@gmail.com', '123456');
  } 
  else if (test.title.includes('2.2')) {
    I.say('Đăng nhập tài khoản ADMIN (Có dữ liệu)');
    // Sử dụng tài khoản admin mặc định của bạn
    LoginPage.loginAsAdmin('admin_final@carbon.com', '123456');
  }
});

Scenario('[Task 2.1] Test hiển thị danh sách xe (Empty state)', ({ I, VehiclePage }) => {
  // Bot đã được login test_empty ở Before
  VehiclePage.navigateToVehiclePage();
  
  // Xác minh giao diện khi không có xe
  VehiclePage.verifyEmptyState();
  I.saveScreenshot('Task2_EmptyState.png');
});

Scenario('[Task 2.2] Test danh sách xe và xem chi tiết (Có data)', ({ I, VehiclePage }) => {
  // Bot đã được login admin_final ở Before
  VehiclePage.navigateToVehiclePage();
  
  // Kiểm tra sự xuất hiện của lưới danh sách xe
  VehiclePage.verifyListHasData();
  
  // Mở Modal (Sử dụng nút "Xem chi tiết" trong VehicleCard)
  VehiclePage.openVehicleDetails();
  
  // Xác minh nội dung và đóng Modal (Nút "Đóng")
  VehiclePage.closeVehicleDetails();
  I.saveScreenshot('Task2_Modal_Success.png');
});