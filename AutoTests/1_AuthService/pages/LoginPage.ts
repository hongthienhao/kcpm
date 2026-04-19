const { I } = inject();

export = {
  // Selectors từ Login.jsx: id="email", id="password", button[type="submit"]
  inputEmail: '#email',
  inputPassword: '#password',
  btnSubmit: 'button[type="submit"]',
  alertDanger: '[role="alert"]',

  async login(email: string, password: string) {
    await I.login(email, password);
  },

  logout() {
    // Click vào avatar ở Topbar để mở dropdown
    I.waitForElement(`.userProfile, [class*="userProfile"]`, 10);
    I.click(`.userProfile, [class*="userProfile"]`);
    I.wait(1);
    // Click button Đăng xuất trong dropdown (rendered via Portal)
    I.waitForElement(`button[class*="logoutItem"]`, 5);
    I.click(`button[class*="logoutItem"]`);
    I.wait(1);
    // Xác nhận trong modal
    I.waitForElement(`button[class*="btnConfirm"], .modal button`, 5);
    I.click(`//button[contains(text(),'Đăng xuất')]`);
    I.wait(2);
  }
};
