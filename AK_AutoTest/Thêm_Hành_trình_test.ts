import LoginPage from './pages/LoginPage';

Feature('[Task 3] Thêm Hành trình (Upload)');

// @ts-ignore
Before(({ I }) => {
    LoginPage.loginAsAdmin('admin_final@carbon.com', '123456');
    I.wait(5);
});

// @ts-ignore
Scenario('[Ý 1] Nhập form thành công để làm dữ liệu mồi', ({ I, TripPage }) => {
    TripPage.goToTripPage();
    TripPage.openSingleJourneyForm();
    TripPage.fillSingleJourneyForm('120', 'Vinfast-VFe34', '2025-10-26T08:00', '2025-10-26T12:00');
    TripPage.submitSingleJourneyForm();
    TripPage.verifyUploadSuccess();
    TripPage.verifyJourneyInList('Vinfast-VFe34');
    I.saveScreenshot('task3_y1_thanh_cong.png');
});

// @ts-ignore
Scenario('[Ý 2] Test lỗi validate (Quãng đường âm)', ({ I, TripPage }) => {
    TripPage.goToTripPage();
    TripPage.openSingleJourneyForm();
    TripPage.fillSingleJourneyForm('-50', 'Vinfast-VFe34', '2023-10-26T12:00', '2023-10-26T08:00');
    TripPage.submitSingleJourneyForm();
    I.seeElement({xpath: "//*[contains(text(), 'Quãng đường phải là số dương') or contains(text(), 'không hợp lệ')] | //*[contains(@class, 'text-red')] | //*[contains(@class, 'error')]"});
    I.saveScreenshot('task3_y2_validate_error.png');
});

// @ts-ignore
Scenario('[Ý 3] Test Upload file CSV/JSON thành công', ({ I, TripPage }) => {
    // 1. Vào trang Hành trình
    TripPage.goToTripPage();

    // 2. Mở form Upload
    TripPage.openFileUploadForm();

    // 3. ĐÍNH KÈM FILE (Bot sẽ tìm file trong thư mục data bạn vừa tạo)
    TripPage.uploadJourneyFile('hanh_trinh_test.csv');

    // 4. Bấm nút Tải lên (Submit)
    TripPage.submitFileUpload();

    // 5. Xác nhận thành công
    TripPage.verifyUploadSuccess();
    
    // 6. Check xem dữ liệu từ file (Vinfast-VF9) đã lên bảng chưa
TripPage.verifyCsvUploadSuccess('Vinfast-VFe34');
    I.saveScreenshot('task3_y3_upload_csv_thanh_cong.png');
});