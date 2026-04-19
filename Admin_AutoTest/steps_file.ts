// in this file you can append custom step methods to 'I' object

export = function() {
  return actor({
    generateRandomEmail() {
      const timestamp = new Date().getTime();
      return `admin_test_${timestamp}@example.com`;
    },

    /**
     * Đăng nhập Admin qua UI.
     * Ủy thác hoàn toàn cho AdminLoginPage.loginAsAdmin()
     * để tránh duplicate logic và dễ bảo trì.
     */
    loginAsAdmin(email?: string, password?: string) {
      const loginEmail = email || process.env.ADMIN_EMAIL || 'admin@example.com';
      const loginPassword = password || process.env.ADMIN_PASSWORD || '123456';

      this.amOnPage('/login');
      
      // Clear storage
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      this.amOnPage('/login');
      this.waitForElement('input[name="email"], input[type="email"]', 10);
      this.fillField('input[name="email"], input[type="email"]', loginEmail);
      this.fillField('input[name="password"], input[type="password"]', loginPassword);

      this.executeScript(() => {
        const normalize = (text: string) =>
          String(text || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const submitByType = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitByType) {
          submitByType.click();
          return;
        }

        const fallback = Array.from(document.querySelectorAll('button')).find((btn) => {
          const text = normalize((btn.textContent || '').trim());
          return text.includes('dang nhap') || text.includes('login') || text.includes('sign in');
        }) as HTMLButtonElement | undefined;

        if (fallback) {
          fallback.click();
        }
      });

      this.wait(2);
    },

    loginAndOpenAdminDashboard(email?: string, password?: string) {
      this.loginAsAdmin(email, password);
      this.amOnPage('/admin/dashboard');
      this.waitInUrl('/admin/dashboard', 10);
    }
  });
};
