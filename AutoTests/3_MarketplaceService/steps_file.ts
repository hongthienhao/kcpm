// in this file you can append custom step methods to 'I' object

export = function() {
  return actor({
    loginToMarketplace(email?: string, password?: string) {
      // Dùng evowner_test vì account này có credited inventory để test Sell (Listing)
      // Dùng buyer_test cho Buy Now tests (trong marketplace_buy_now_test.ts)
      const loginEmail = email || process.env.MARKETPLACE_EMAIL || 'evowner_test@carbon.test';
      const loginPassword = password || process.env.MARKETPLACE_PASSWORD || 'Password123!';

      if (!loginEmail || !loginPassword) {
        throw new Error('Missing login credentials. Set MARKETPLACE_EMAIL and MARKETPLACE_PASSWORD env vars.');
      }

      this.amOnPage('/login');
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      this.amOnPage('/login');
      this.waitForElement('#email', 10);
      this.fillField('#email', loginEmail);
      this.fillField('#password', loginPassword);
      this.click('button[type="submit"]');
      this.wait(3);
      // Sau khi login thành công với EVOwner/Buyer redirect đến /dashboard
      this.waitInUrl('/dashboard', 15);
    },

    loginAndOpenMarketplace(email?: string, password?: string) {
      this.loginToMarketplace(email, password);
      this.amOnPage('/marketplace');
      this.waitInUrl('/marketplace', 10);
    }
  });
};
