const { I } = inject();

export = {
  // ─── Selectors ────────────────────────────────────────────────────────────
  inputEmail: 'input[type="email"], input[name="email"]',
  inputPassword: 'input[type="password"], input[name="password"]',

  // Thử button[type="submit"] trước, fallback sang text "Đăng nhập" / "Login"
  btnSubmit: locate('button[type="submit"]')
    .or(locate('button').withText('Đăng nhập'))
    .or(locate('button').withText('Login')),

  // ─── Methods ──────────────────────────────────────────────────────────────

  /**
   * Đăng nhập Admin qua UI Login form.
   *
   * Dùng đường dẫn TƯƠNG ĐỐI '/login' để CodeceptJS tự ghép với
   * baseUrl đã cấu hình trong codecept.conf.ts (mặc định: http://localhost:5173).
   *
   * Nếu đã đang ở dashboard → bỏ qua đăng nhập lại.
   */
  async loginAsAdmin(email = 'admin_final@carbon.com', password = '123456') {
    // Dùng relative path → CodeceptJS ghép với baseUrl trong codecept.conf.ts
    I.amOnPage('/login');
    I.wait(2);

    // Nếu đã login rồi (đang ở dashboard) → skip
    const currentUrl = await I.grabCurrentUrl();
    if (currentUrl.includes('/dashboard')) {
      I.say('Đã đăng nhập từ trước, bỏ qua bước Login.');
      return;
    }

    I.say('Tiến hành đăng nhập mới...');

    // Clear session cũ trước khi login
    I.executeScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    I.refreshPage();

    // Điền thông tin đăng nhập
    I.waitForElement(this.inputEmail, 10);
    I.fillField(this.inputEmail, email);
    I.fillField(this.inputPassword, password);

    // Submit form
    I.waitForElement(this.btnSubmit, 10);
    I.forceClick(this.btnSubmit.first());

    // Chờ chuyển hướng thành công vào dashboard
    I.waitInUrl('/dashboard', 10);
    I.say('Đăng nhập thành công.');
  }
};
