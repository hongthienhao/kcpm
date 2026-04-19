Feature('Verification Flow');

Before(({ I, VerificationDashboardPage }) => {
    I.amOnPage('/login');
    I.fillField('Email', 'cva@gmail.com');
    I.fillField('password', 'thienhao');
    I.click('Đăng nhập');

    I.waitForNavigation({});
    VerificationDashboardPage.goToPage();
});

Scenario('Sub-task: Test lọc danh sách yêu cầu chờ duyệt', ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterPendingBatches();
    // Tiêu đề của trang Verification (CVA) sau khi chuyển qua tab "Chờ duyệt"
    I.see('Yêu cầu chờ duyệt');
});

Scenario('Sub-task: Kiểm tra hiển thị chi tiết của một Batch được chủ xe gửi lên', async ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterPendingBatches();
    I.wait(2); // Dành 2s để chờ API load dữ liệu

    // Kiểm tra số lượng Lô đang hiển thị nhờ vào việc đếm nút "Xem chi tiết"
    const batchCount = await I.grabNumberOfVisibleElements(VerificationDashboardPage.locators.batchItemViewBtn);

    if (batchCount > 0) {
        // Trường hợp 1: Có dữ liệu (Đã có chủ xe gửi lên)
        I.say('Tìm thấy Lô (Batch) trên hệ thống! Đang mở xem chi tiết...');
        VerificationDashboardPage.viewFirstBatchDetail();
        // Kiểm tra xem Modal mở lên
        I.seeElement(VerificationDashboardPage.locators.detailModal);
        I.see('Chi tiết yêu cầu xác minh');

        // TEST YÊU CẦU: Kiểm tra đóng Modal chi tiết Batch
        I.say('Tiến hành đóng Modal chi tiết Batch...');
        VerificationDashboardPage.closeModal();
    } else {
        // Trường hợp 2: Không có dữ liệu
        I.say('Chưa có chủ xe nào gửi Batch! Báo cáo Passed trạng thái trống trải...');
        VerificationDashboardPage.viewDetail(); // Hàm viewDetail kiểm tra '.emptyData'
    }
});

Scenario('Sub-task: Kiểm tra tab danh sách yêu cầu Đã duyệt', async ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterApprovedBatches();
    I.see('Yêu cầu đã duyệt');
    I.wait(2); // Dành 2s để chờ API load dữ liệu

    // Kiểm tra số lượng Lô đang hiển thị nhờ vào việc đếm nút "Xem chi tiết"
    const batchCount = await I.grabNumberOfVisibleElements(VerificationDashboardPage.locators.batchItemViewBtn);

    if (batchCount > 0) {
        I.say('Tìm thấy Lô (Batch) Đã duyệt trên hệ thống! Đang mở xem chi tiết...');
        VerificationDashboardPage.viewFirstBatchDetail();
        I.seeElement(VerificationDashboardPage.locators.detailModal);
        I.see('Chi tiết yêu cầu xác minh');

        // TEST YÊU CẦU: Kiểm tra đóng Modal chi tiết Batch
        I.say('Tiến hành đóng Modal chi tiết Batch...');
        VerificationDashboardPage.closeModal();
    } else {
        I.say('Chưa có yêu cầu nào Đã duyệt! Báo cáo Passed trạng thái trống trải...');
        I.seeElement(VerificationDashboardPage.locators.emptyApprovedData);
    }
});

Scenario('Sub-task: Kiểm tra tab danh sách yêu cầu Đã từ chối', async ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterRejectedBatches();
    I.see('Yêu cầu đã từ chối');
    I.wait(2); // Dành 2s để chờ API load dữ liệu

    // Kiểm tra số lượng Lô đang hiển thị nhờ vào việc đếm nút "Xem chi tiết"
    const batchCount = await I.grabNumberOfVisibleElements(VerificationDashboardPage.locators.batchItemViewBtn);

    if (batchCount > 0) {
        I.say('Tìm thấy Lô (Batch) Đã từ chối trên hệ thống! Đang mở xem chi tiết...');
        VerificationDashboardPage.viewFirstBatchDetail();
        I.seeElement(VerificationDashboardPage.locators.detailModal);
        I.see('Chi tiết yêu cầu xác minh');

        // TEST YÊU CẦU: Kiểm tra đóng Modal chi tiết Batch
        I.say('Tiến hành đóng Modal chi tiết Batch...');
        VerificationDashboardPage.closeModal();
    } else {
        I.say('Chưa có yêu cầu nào Đã từ chối! Báo cáo Passed trạng thái trống trải...');
        I.seeElement(VerificationDashboardPage.locators.emptyRejectedData);
    }
});

Scenario('Sub-task: Test flow Duyệt (Approve) và kiểm tra tín chỉ được cấp', async ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterPendingBatches();
    I.wait(2); // Chờ API load

    const batchCount = await I.grabNumberOfVisibleElements(VerificationDashboardPage.locators.batchItemViewBtn);

    if (batchCount > 0) {
        I.say('Tìm thấy Lô chờ duyệt! Mở xem chi tiết...');
        VerificationDashboardPage.viewFirstBatchDetail();
        I.seeElement(VerificationDashboardPage.locators.detailModal);

        I.say('Kiểm tra tín chỉ...');
        await VerificationDashboardPage.checkCredits();

        I.say('Tiến hành nhập form và duyệt...');
        await VerificationDashboardPage.approveBatch('Đã kiểm tra và dữ liệu hợp lệ, đầy đủ thông tin hành trình.');

        I.say('Duyệt hoàn tất!');
    } else {
        I.say('Chưa có yêu cầu nào chờ duyệt để test flow duyệt!');
    }
});

Scenario('Sub-task: Test flow Từ chối (Reject) kèm lý do', async ({ I, VerificationDashboardPage }) => {
    VerificationDashboardPage.filterPendingBatches();
    I.wait(2); // Chờ API load

    const batchCount = await I.grabNumberOfVisibleElements(VerificationDashboardPage.locators.batchItemViewBtn);

    if (batchCount > 0) {
        I.say('Tìm thấy Lô chờ duyệt! Mở xem chi tiết...');
        VerificationDashboardPage.viewFirstBatchDetail();
        I.seeElement(VerificationDashboardPage.locators.detailModal);

        I.say('Tiến hành nhập form và từ chối...');
        await VerificationDashboardPage.rejectBatch('Dữ liệu chưa đạt chuẩn.', 'Lý do: Vui lòng bổ sung rõ bằng chứng hợp lệ.');

        I.say('Từ chối hoàn tất!');
    } else {
        I.say('Chưa có yêu cầu nào chờ duyệt để test flow từ chối!');
    }
});