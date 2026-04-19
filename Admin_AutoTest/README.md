# Hướng dẫn chạy CodeceptJS cho Admin_AutoTest

Đây là thư mục chứa kịch bản kiểm thử tự động E2E (End-to-End) cho các chức năng Admin của dự án sử dụng **CodeceptJS** và **Playwright**.

## 1. Cài đặt các công cụ cần thiết

Trước khi chạy, hãy đảm bảo bạn đã cài đặt các thư viện cần thiết. Nếu chưa cài đặt, hãy mở terminal tại thư mục `Admin_AutoTest` (hiện tại hệ thống đang tự động chạy giúp bạn) bằng lệnh sau:

```bash
cd Admin_AutoTest
npm install
```

Lệnh này cũng sẽ tự tải trình duyệt thông qua Playwright cho bạn.

## 2. Các lệnh chạy Test

Bạn có thể chạy các kịch bản test bằng các lệnh đã được cấu hình sẵn trong `package.json`. Hãy mở Terminal (Command Prompt hoặc PowerShell) tại đúng thư mục `Admin_AutoTest` trước khi chạy.

### Chạy ở chế độ Heading (Mở giao diện trình duyệt để xem)

Chế độ này sẽ mở trình duyệt Chromium lên để bạn nhìn thấy các thao tác click, điền chữ,... trực tiếp.

```bash
npm run test
# hoặc
npm run test:headed
```

### Chạy ở chế độ Headless (Chạy ngầm - không hiện trình duyệt)

Chế độ này sẽ chạy trình duyệt ở backgound (ngầm) giúp tăng tốc độ đáng kể. Tránh làm cản trở bạn sử dụng máy tính vào việc khác. Thích hợp để bạn chạy một lần nhiều test hoặc tích hợp vào Github Actions CI/CD.

```bash
npm run test:headless
```

### Chạy từng chức năng riêng biệt

Nếu bạn đang phát triển hoặc bảo trì chỉ một chức năng, bạn có thể chạy một trong các lệnh chạy lẻ (Chạy có giao diện UI):

- Kiểm thử **Quản lý người dùng**:
  ```bash
  npm run test:user-management
  ```
- Kiểm thử **Quy trình Rút tiền**:
  ```bash
  npm run test:withdrawal
  ```
- Kiểm thử **Xử lý tranh chấp**:
  ```bash
  npm run test:dispute
  ```

## 3. Cấu hình biến môi trường (Environment Variables)

Test script có cấu hình sẵn để vượt qua quá trình xác thực hoặc trỏ đúng URL máy chủ. Bạn có thể thay đổi các biến số trên trực tiếp tại terminal (ví dụ cho Windows Powershell):

```powershell
$env:BASE_URL="http://abc.com:5173"
$env:ADMIN_EMAIL="quantri@example.com"
$env:ADMIN_PASSWORD="superpassword"

npm run test
```

*Lưu ý: Mặc định nếu bạn không gán biến môi trường nào ở trên, hệ thống auto test sẽ trỏ tới URL gốc máy chủ là `http://localhost:5173`.*

## 4. Báo cáo kiểm thử (Test Report)

Kết quả test cùng với danh sách thao tác thành công và **hình chụp màn hình lỗi** (nếu có lỗi bất chợt xảy ra) sẽ được CodeceptJS tự động xuất ra thư mục:

```
/Admin_AutoTest/output/
```

Trong thư mục trên, bạn sẽ tìm thấy một file có tên `report.html`. Bạn có thể click đúp mở nó lên bằng Chrome để xem báo cáo test bằng giao diện Dashboard html rất trực quan và dễ đọc.
