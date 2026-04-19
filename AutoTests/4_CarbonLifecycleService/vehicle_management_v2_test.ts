// @ts-nocheck
Feature('[Task 2] Qua n ly Phuong tien');

// Before hook: Login as EVOwner (they own the vehicles)
Before(({ I }) => {
  I.loginAsEVOwner();
});

Scenario('[Task 2.1] Test hien thi danh sach xe (Empty state)', async ({ I, VehiclePage }) => {
  VehiclePage.navigateToVehiclePage();
  
  // Kiem tra xem co xe hay khong
  const hasVehicles = await I.executeScript(() => {
    return document.querySelector('[class*="vehicleCard"]') !== null;
  });
  
  if (hasVehicles) {
    I.say('Tai khoan nay co xe - khong kiem tra Empty State duoc. Skip.');
    return;
  }
  
  // Xac minh giao dien khi khong co xe
  VehiclePage.verifyEmptyState();
  I.saveScreenshot('Task2_EmptyState.png');
});

Scenario('[Task 2.2] Test danh sach xe va xem chi tiet (Co data)', async ({ I, VehiclePage }) => {
  VehiclePage.navigateToVehiclePage();
  
  // Kiem tra co xe hay khong
  const hasVehicles = await I.executeScript(() => {
    return document.querySelector('[class*="vehicleCard"]') !== null;
  });
  
  if (!hasVehicles) {
    I.say('SKIP: Tai khoan nay chua co xe. Can upload hanh trinh truoc.');
    return;
  }
  
  // Kiem tra su xuat hien cua luoi danh sach xe
  VehiclePage.verifyListHasData();
  
  // Mo Modal va dong lai
  VehiclePage.openVehicleDetails();
  VehiclePage.closeVehicleDetails();
  I.saveScreenshot('Task2_Modal_Success.png');
});