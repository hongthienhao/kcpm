// in this file you can append custom step methods to 'I' object

export = function() {
  return actor({
    generateRandomEmail() {
      const timestamp = new Date().getTime();
      return `admin_test_${timestamp}@example.com`;
    },

    /**
     * Đăng nhập Admin qua UI.
     * Admin sau khi login sẽ redirect sang /admin/... (không phải /dashboard).
     */
    loginAsAdmin(email?: string, password?: string) {
      const loginEmail = email || process.env.ADMIN_EMAIL || 'admin_test@carbon.test';
      const loginPassword = password || process.env.ADMIN_PASSWORD || 'Password123!';

      this.amOnPage('/login');
      
      // Clear storage
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      this.amOnPage('/login');
      this.waitForElement('#email', 10);
      this.fillField('#email', loginEmail);
      this.fillField('#password', loginPassword);
      this.click('button[type="submit"]');
      // Admin redirect sang /admin/... sau khi login thành công
      this.wait(5);
    },

    loginAndOpenAdminDashboard(email?: string, password?: string) {
      this.loginAsAdmin(email, password);
      this.amOnPage('/admin/dashboard');
      this.waitInUrl('/admin/dashboard', 10);
    }
  });
};
