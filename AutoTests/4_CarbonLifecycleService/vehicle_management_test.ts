// @ts-nocheck
Feature('[Task 4] Carbon Lifecycle - Quản lý Phương tiện (Vehicles)');

Before(({ I }) => {
  // EVOwner quản lý phương tiện của họ
  I.amOnPage('/login');
  I.executeScript(() => { localStorage.clear(); sessionStorage.clear(); });
  I.amOnPage('/login');
  I.waitForElement('#email', 10);
  I.fillField('#email', 'evowner_test@carbon.test');
  I.fillField('#password', 'Password123!');
  I.click('button[type="submit"]');
  I.wait(3);
  I.waitInUrl('/dashboard', 15);
});

Scenario('[Ý 1] Xem danh sách phương tiện điện', async ({ I, VehiclePage }) => {
  VehiclePage.goToVehiclePage();
  I.saveScreenshot('Task4_Vehicle_List.png');

  // Kiểm tra có xe trong danh sách hay không
  const hasVehicles = await I.executeScript(() => {
    // Nếu có xe sẽ có card, nếu không có sẽ thấy EmptyState
    return document.querySelector('[class*="vehicleCard"]') !== null;
  });

  if (hasVehicles) {
    I.say('✅ Có xe trong danh sách - tiến hành xem chi tiết.');
    // Xem chi tiết xe đầu tiên
    I.waitForElement(locate('button').withText('Xem chi tiết').first(), 10);
    I.click(locate('button').withText('Xem chi tiết').first());
    // Chi tiết xe hiện ra - tìm các thông tin
    I.waitForText('Tổng quãng đường:', 8);
    I.see('Tổng tín chỉ:');
    I.see('CO₂ giảm phát thải:');
    I.saveScreenshot('Task4_Vehicle_Detail.png');
    // Đóng modal
    I.click(locate('button').withText('Đóng').last());
    I.wait(1);
  } else {
    // Trường hợp chưa có xe → EmptyState
    I.waitForText('Chưa có xe điện nào', 8);
    I.see('Thêm hành trình');
    I.say('ℹ️ Chưa có xe - hiển thị EmptyState đúng như thiết kế. Cần upload hành trình để hệ thống tạo xe tự động.');
  }
});
