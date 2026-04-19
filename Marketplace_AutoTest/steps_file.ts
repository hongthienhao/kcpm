// in this file you can append custom step methods to 'I' object

export = function() {
  return actor({
    loginToMarketplace(email?: string, password?: string) {
      const loginEmail = email || process.env.MARKETPLACE_EMAIL || 'acamet117@gmail.com';
      const loginPassword = password || process.env.MARKETPLACE_PASSWORD || '123456';

      if (!loginEmail || !loginPassword) {
        throw new Error('Missing login credentials. Set MARKETPLACE_EMAIL and MARKETPLACE_PASSWORD env vars.');
      }

      this.amOnPage('/login');
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      this.amOnPage('/login');
      this.waitForElement('input[name="email"]', 10);
      this.fillField('input[name="email"]', loginEmail);
      this.fillField('input[name="password"]', loginPassword);

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

    loginAndOpenMarketplace(email?: string, password?: string) {
      this.loginToMarketplace(email, password);
      this.amOnPage('/marketplace');
      this.waitInUrl('/marketplace', 10);
    }
  });
};
