// @ts-nocheck
Feature('[Task 4] Carbon Lifecycle - Quản lý Lô Hành trình (Batches)');

/**
 * Batch tests dùng EVOwner vì EVOwner là người tạo và gửi lô hành trình để xác minh.
 * loginAsAdmin() trong Before cũ là sai - EVOwner mới có trips để gom lô.
 */
Before(({ I }) => {
  I.loginAsEVOwner();
});

Scenario('[Task 4.1] Gom các hành trình lẻ thành một lô mới', async ({ I, TripPage, BatchPage }) => {
  TripPage.goToTripPage();
  BatchPage.switchTab(BatchPage.tabs.journeyHistory);

  // Kiểm tra xem có hành trình nào để gom không
  const journeyCount = await I.grabNumberOfVisibleElements('table tbody tr');
  if (journeyCount === 0) {
    I.say('SKIP [Task 4.1]: Không có hành trình nào để gom thành lô. Chạy [Ý 1] trước để tạo dữ liệu mồi.');
    return;
  }

  BatchPage.selectJourneys(1);
  BatchPage.executeCreateBatch();
  
  I.saveScreenshot('Task4_1_Tao_Lo_Thanh_Cong.png');
});

Scenario('[Task 4.2] Gửi yêu cầu xác minh cho lô vừa tạo', async ({ I, TripPage, BatchPage }) => {
  TripPage.goToTripPage();
  BatchPage.switchTab(BatchPage.tabs.pendingBatch);

  // Kiểm tra có lô nào pending không
  const batchCount = await I.grabNumberOfVisibleElements('table tbody tr');
  if (batchCount === 0) {
    I.say('SKIP [Task 4.2]: Không có lô nào ở trạng thái pending. Chạy [Task 4.1] trước để tạo lô.');
    return;
  }

  BatchPage.submitFirstBatchForVerification();
  BatchPage.verifyBatchStatus('Đã Gửi Xác Minh'); 

  I.saveScreenshot('Task4_2_Gui_Xac_Minh_Thanh_Cong.png');
});