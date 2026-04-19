// Global custom steps for all CarbonTC tests

export = function() {
  return actor({
    /**
     * Login as EV Owner (chủ xe điện)
     */
    async loginAsEVOwner(
      email = 'evowner_test@carbon.test',
      password = 'Password123!'
    ) {
      await this.login(email, password);
      this.waitInUrl('/dashboard', 15);
    },

    /**
     * Login as Admin
     */
    async loginAsAdmin(
      email = 'admin_test@carbon.test',
      password = 'Password123!'
    ) {
      await this.login(email, password);
      // Admin redirect sang /admin/... không phải /dashboard
      this.wait(5);
    },

    /**
     * Login as Buyer
     */
    async loginAsBuyer(
      email = 'buyer_test@carbon.test',
      password = 'Password123!'
    ) {
      await this.login(email, password);
      this.waitInUrl('/dashboard', 15);
    },

    /**
     * Login as CVA (Carbon Verification Authority)
     */
    async loginAsCVA(
      email = 'cva_test@carbon.test',
      password = 'Password123!'
    ) {
      await this.login(email, password);
      this.waitInUrl('/dashboard', 15);
    },

    /**
     * Generic login - sử dụng selectors chính xác từ Login.jsx (id="email", id="password")
     */
    async login(email: string, password: string) {
      this.amOnPage('/login');
      // Ensure clean state
      await this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      });
      this.amOnPage('/login');
      this.waitForElement('#email', 20);
      
      this.say(`Populating credentials for: ${email}`);
      this.fillField('#email', email);
      // Dùng click và clear trước để chắc chắn React nhận event
      this.click('#password');
      this.fillField('#password', password);
      
      this.say(`Submitting login form...`);
      this.pressKey('Enter');
      
      // Fallback click if Enter doesn't work
      await this.tryTo(() => this.click('button[type="submit"]', { force: true }));
      
      this.wait(2);// Chờ một chút để backend xử lý
      this.wait(2);
      
      // Chiến thuật: Chờ dashboard load hoặc URL thay đổi
      // Playwright sẽ tự động wait navigation khi click, nhưng ta thêm wait tường minh cho chắc
      const dashboardElement = '.userProfile, [class*="userProfile"], .layout, #root';
      const success = await this.tryTo(() => this.waitForElement(dashboardElement, 20));
      
      if (!success) {
        this.say('Chưa thấy Dashboard, thử đợi thêm hoặc kiểm tra thông báo lỗi...');
        const errorMsg = await this.tryTo(() => this.grabTextFrom('[role="alert"]'));
        if (errorMsg) {
          throw new Error(`Đăng nhập thất bại cho ${email}: ${errorMsg}`);
        }
        await this.waitForElement(dashboardElement, 15);
      }
      
      this.say('Đã thấy Dashboard. Đợi 2s để session ổn định...');
      this.wait(2);
      
      this.say('Đã đăng nhập thành công.');
    },

    /**
     * Compatibility helper for Marketplace tests
     */
    loginAndOpenMarketplace(email?: string, password?: string) {
      if (email && password) {
        this.login(email, password);
      } else {
        this.loginAsBuyer(); // Default to buyer for Marketplace viewing
      }
      this.waitInUrl('/dashboard', 10);
      this.amOnPage('/marketplace');
      // Thêm trợ giúp để đợi phần tử xuất hiện
      this.waitForElement(locate('input').withAttr({ placeholder: 'Tìm kiếm dự án...' }).or('.marketplace-search').or('h2'), 10);
    },

    async getApiToken(
      email = 'admin_test@carbon.test',
      password = 'Password123!'
    ) {
      this.say(`Lấy Token cho account: ${email}`);
      const response = await this.sendPostRequest('/Auth/login', {
        email: email,
        password: password
      });
      
      // Robust token extraction supporting PascalCase and camelCase
      // response.data là body JSON trả về từ server
      const body = response.data;
      const data = body?.data || body?.Data || body;
      const token = data?.accessToken || data?.AccessToken || data?.token || data?.Token;
      
      if (!token) {
        this.say('❌ LỖI: Không lấy được Token! Body trả về: ' + JSON.stringify(body));
      }
      
      return token;
    },

    generateRandomEmail() {
      const timestamp = new Date().getTime();
      return `test_${timestamp}@carbon.test`;
    },
  });
};
