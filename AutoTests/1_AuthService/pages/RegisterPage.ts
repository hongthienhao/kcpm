const { I } = inject();

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string; // 'EVOwner' | 'CreditBuyer'
}

export = {
  // Selectors từ Register.jsx: id="fullName", id="email", id="password", id="confirmPassword"
  // Role được chọn bằng cách click vào div.roleOption (custom card, không phải select/radio)
  // Terms checkbox: id="agreeTerms"
  // Submit: button[type="submit"]

  register(data: RegisterData) {
    // Chờ form load
    I.waitForElement('#fullName', 10);

    // Chọn role trước (click vào roleOption card)
    if (data.role === 'EVOwner') {
      I.click(`//div[contains(@class,'roleOption')][.//div[contains(text(),'Chủ xe điện')]]`);
    } else if (data.role === 'CreditBuyer') {
      I.click(`//div[contains(@class,'roleOption')][.//div[contains(text(),'Nhà mua credit')]]`);
    }

    I.wait(0.5);

    // Điền thông tin
    if (data.fullName) I.fillField('#fullName', data.fullName);
    if (data.email)    I.fillField('#email', data.email);
    if (data.password) I.fillField('#password', data.password);
    if (data.confirmPassword) I.fillField('#confirmPassword', data.confirmPassword);

    // Tick checkbox đồng ý điều khoản
    I.checkOption('#agreeTerms');

    // Submit
    I.click('button[type="submit"]');
    I.wait(3);
  },
};
