import LoginPage from './pages/LoginPage';

Feature('[Task 4] Quản lý Lô Hành trình (Batches)');

// @ts-ignore
Before(async ({ I }) => {
    await LoginPage.loginAsAdmin('admin_final@carbon.com', '123456');
});

// @ts-ignore
Scenario('[Task 4.1] Gom các hành trình lẻ thành một lô mới', ({ I, TripPage, BatchPage }) => {
    TripPage.goToTripPage();
    BatchPage.switchTab(BatchPage.tabs.journeyHistory);
    
    BatchPage.selectJourneys(1);
    BatchPage.executeCreateBatch();
    
    I.saveScreenshot('Task4_1_Tao_Lo_Thanh_Cong.png');
});

// @ts-ignore
Scenario('[Task 4.2] Gửi yêu cầu xác minh cho lô vừa tạo', ({ I, TripPage, BatchPage }) => {
    TripPage.goToTripPage();
    BatchPage.switchTab(BatchPage.tabs.pendingBatch);
    
    BatchPage.submitFirstBatchForVerification();
    
    // Tìm đúng chữ trên tab Lịch Sử Lô
    BatchPage.verifyBatchStatus('Đã Gửi Xác Minh'); 

    I.saveScreenshot('Task4_2_Gui_Xac_Minh_Thanh_Cong.png');
});