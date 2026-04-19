# Hướng dẫn chạy Auto Test (CodeceptJS) - Tối Ưu

Tài liệu này hướng dẫn cách chạy bộ kiểm thử tự động (End-to-End) bằng CodeceptJS và Playwright.

## 1. Yêu cầu trước khi chạy (Tiền quyết)
- **Luôn đảm bảo Frontend của bạn đã được start** (ở cổng `http://localhost:5173`) trước khi chạy test.
- Automation test sẽ truy cập vào ứng dụng thật để thao tác, nếu Frontend tắt, trình duyệt sẽ báo lỗi mạng: `net::ERR_CONNECTION_REFUSED`.
- Nếu có update liên kết/port cho Frontend, hãy thay đổi trong file sinh thái auto test: `TH_AutoTest/codecept.conf.js` ở trường `url`.

## 2. Cách chạy Test

Mở Terminal và cần di chuyển vào thư mục test:
```bash
cd TH_AutoTest
```

### Chạy TẤT CẢ các file test:
```bash
npx codeceptjs run --steps
```

### Chạy một file test cụ thể

**Chạy kiểm thử luồng Đăng nhập (Login):**
```bash
npx codeceptjs run TH_tests/auth/login_test.js --steps
```

**Chạy kiểm thử luồng Đăng ký (Register):**
```bash
npx codeceptjs run TH_tests/auth/register_test.js --steps
```

**Chạy kiểm thử luồng Quên mật khẩu (Forgot Password):**
```bash
npx codeceptjs run TH_tests/auth/forgot_password_test.js --steps
```

*(Cờ `--steps` giúp in ra các bước chi tiết mà framework mô phỏng để bạn dễ theo dõi quá trình test)*

## 3. Kiến Trúc (Cấu trúc thư mục)
`TH_AutoTest/`
- **TH_pages/** : Page Object Model. Gồm các lớp (class) đóng gói các đối tượng HTML (Button, TextBox, Selectors,...) trên trang. VD: `TH_LoginPage.js`, `TH_RegisterPage.js`
- **TH_tests/** : Thư mục chứa các kịch bản test (Scenarios). VD: `auth/login_test.js`, `auth/register_test.js`, `auth/forgot_password_test.js`
- **TH_pages/fragments/** : Chứa các file hỗ trợ như `messages.js` quản lý tập trung các thông báo lỗi (Error Messages).
- **TH_output/** : Chứa các báo cáo lỗi và ảnh chụp màn hình tự động khi test fail (bật qua plugin `screenshotOnFail`).
- **codecept.conf.js** : File cấu hình môi trường test, Playwright engine và plugin screenshot.

## 4. Troubleshooting (Xử lý lỗi cơ bản)

- **Lỗi thiếu trình duyệt:** Nếu bạn chạy lần đầu bị báo lỗi `browserType.launch: Executable doesn't exist`, hãy cài đặt Playwright Chromium bằng lệnh:
  ```bash
  npx playwright install chromium
  ```
- **Lỗi fail step:** Xem kĩ log dòng `× FAILED in ...`.
- Nếu lỗi UI hay giao diện API báo sai, các thư mục screenshot sẽ được save vào `TH_output`. Hãy xem ảnh screenshot để thấy hệ thống hiển thị gì trên app thực tế ở lúc test ngã ngữ.
- Test hiện tạo đã được thiết kế linh hoạt (nhận diện selector `[role="alert"]`) thay vì hardcode bằng Fix Text, nên dù Backend đổi nội dung thông báo thì Automation rào cản vẫn Verify được lỗi hiển thị bình thường. Tránh tình trạng fail oan uổng.

## 5. Các kịch bản kiểm thử (Test Scenarios)

### Đăng nhập (`login_test.js`)
- Đăng nhập thành công cho từng Role (EV Owner, Buyer, Admin, CVA).
- Đăng nhập thất bại do nhập sai mật khẩu.
- Đăng nhập thất bại do tài khoản bị khóa.

### Đăng ký (`register_test.js`)
- **Đăng ký EV Owner thành công**: Sử dụng thư viện `@faker-js/faker` để sinh dữ liệu và email email động.
- **Form Validation**: Kiểm tra Form bắt lỗi khi để trống các trường hoặc nhập email sai định dạng.
- **Trùng Email**: Kiểm tra luồng báo lỗi `Email already exists` khi đăng ký tồn tại email.

### Quên mật khẩu (`forgot_password_test.js`)
- **Yêu cầu gửi link đổi mật khẩu**: Truy cập trang đăng nhập, click Quên mật khẩu, nhập email và xác nhận hệ thống hiển thị thông báo gửi link reset thành công.

*Lưu ý: Các bước click quan trọng đều sử dụng lệnh `I.retry(2).click()` để tăng tính ổn định (tránh flaky test).*
