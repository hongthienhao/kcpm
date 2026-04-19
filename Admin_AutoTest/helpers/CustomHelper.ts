import Helper from '@codeceptjs/helper';

/**
 * CustomHelper — các tiện ích tái sử dụng cho Admin test suite.
 *
 * Cung cấp:
 *  - Tạo dữ liệu ngẫu nhiên (email, phone, tên, số tiền)
 *  - Login nhanh qua API (bypass UI)
 *  - Các utility thường dùng trong test
 */
class CustomHelper extends Helper {
  private baseUrl: string;
  private adminEmail: string;
  private adminPassword: string;

  constructor(config: { baseUrl: string; adminEmail: string; adminPassword: string }) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.adminEmail = config.adminEmail || 'admin@example.com';
    this.adminPassword = config.adminPassword || '123456';
  }

  // ─────────────────────────────────────────────
  // 📦 Random Data Generators
  // ─────────────────────────────────────────────

  /**
   * Tạo email ngẫu nhiên theo timestamp
   * @example I.generateRandomEmail() → "test_1713100000000@example.com"
   */
  generateRandomEmail(prefix = 'test'): string {
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    return `${prefix}_${ts}_${rand}@example.com`;
  }

  /**
   * Tạo số điện thoại ngẫu nhiên hợp lệ (Việt Nam)
   */
  generateRandomPhone(): string {
    const prefixes = ['032', '033', '034', '035', '036', '037', '038', '039',
                      '056', '058', '070', '079', '077', '076', '075',
                      '090', '093', '096', '097', '098'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 9000000 + 1000000).toString();
    return `${prefix}${suffix}`;
  }

  /**
   * Tạo tên ngẫu nhiên (tiếng Việt)
   */
  generateRandomName(): string {
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
    const midNames = ['Văn', 'Thị', 'Đức', 'Hoàng', 'Minh', 'Thanh', 'Quang', 'Thành'];
    const firstNames = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Giang', 'Hà', 'Hùng', 'Khánh', 'Lan'];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(lastNames)} ${pick(midNames)} ${pick(firstNames)}`;
  }

  /**
   * Tạo số tiền ngẫu nhiên trong khoảng [min, max] (bội số của 1000)
   */
  generateRandomAmount(min = 100000, max = 10000000): number {
    const range = Math.floor((max - min) / 1000);
    return (Math.floor(Math.random() * range) + Math.floor(min / 1000)) * 1000;
  }

  /**
   * Tạo mật khẩu ngẫu nhiên đủ mạnh
   */
  generateRandomPassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // ─────────────────────────────────────────────
  // 🔐 API Login — Bypass UI
  // ─────────────────────────────────────────────

  /**
   * Đăng nhập admin qua API rồi inject token vào localStorage
   * → Bỏ qua form login, nhanh hơn UI login
   */
  async loginAsAdminViaAPI(email?: string, password?: string): Promise<void> {
    const loginEmail = email || this.adminEmail;
    const loginPassword = password || this.adminPassword;

    let token: string | null = null;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json() as { token?: string; accessToken?: string; data?: { token?: string } };
        token = data.token || data.accessToken || data.data?.token || null;
      }
    } catch {
      // API không available → fallback về UI login
      console.warn('[CustomHelper] API login failed, will use UI login instead.');
    }

    if (token) {
      const page = this.helpers['Playwright'].page;
      await page.goto(`${this.baseUrl}/admin/login`);
      await page.evaluate((t: string) => {
        localStorage.setItem('token', t);
        localStorage.setItem('accessToken', t);
        sessionStorage.setItem('token', t);
      }, token);
      await page.goto(`${this.baseUrl}/admin/dashboard`);
    }
    // Nếu không có token → để steps_file.ts loginAsAdmin() xử lý
  }

  // ─────────────────────────────────────────────
  // 🛠️ Browser Utilities
  // ─────────────────────────────────────────────

  /**
   * Xóa toàn bộ localStorage và sessionStorage
   */
  async clearBrowserStorage(): Promise<void> {
    const page = this.helpers['Playwright'].page;
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Đọc giá trị của một key trong localStorage
   */
  async getLocalStorageValue(key: string): Promise<string | null> {
    const page = this.helpers['Playwright'].page;
    return page.evaluate((k: string) => localStorage.getItem(k), key);
  }

  /**
   * Chờ cho đến khi network hoàn toàn idle (không có request in-flight)
   */
  async waitForNetworkIdle(timeout = 5000): Promise<void> {
    const page = this.helpers['Playwright'].page;
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Chụp screenshot với tên tự động theo timestamp
   */
  async takeTimestampScreenshot(name = 'screenshot'): Promise<void> {
    const page = this.helpers['Playwright'].page;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `output/${name}_${ts}.png`, fullPage: true });
  }

  /**
   * Format số tiền sang định dạng VND dễ đọc
   */
  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
}

export = CustomHelper;
