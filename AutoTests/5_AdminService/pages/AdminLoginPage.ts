const { I } = inject();

export = {
  // ─── Selectors ────────────────────────────────────────────────────────────
  // Dùng ID selectors (match Login.jsx)
  inputEmail: '#email',
  inputPassword: '#password',
  btnSubmit: 'button[type="submit"]',

  // ─── Methods ──────────────────────────────────────────────────────────────

  /**
   * Đăng nhập Admin qua UI Login form.
   * Admin login sẽ redirect sang /admin/dashboard (không phải /dashboard).
   */
  async loginAsAdmin(email = 'admin_test@carbon.test', password = 'Password123!') {
    I.amOnPage('/login');
    I.executeScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    I.wait(1);
    I.amOnPage('/login');
    
    // Điền thông tin đăng nhập
    I.waitForElement(this.inputEmail, 10);
    I.fillField(this.inputEmail, email);
    I.fillField(this.inputPassword, password);

    // Submit form
    I.waitForElement(this.btnSubmit, 5);
    I.click(this.btnSubmit);
    
    // Admin redirect sang /admin/* sau khi login thành công
    I.wait(5);
    I.say('Đăng nhập Admin thành công.');
  }
};
