const { I } = inject();

export = {
  inputEmail: 'input[type="email"]',
  inputPassword: 'input[type="password"]',
  
  // Nâng cấp bộ quét: Gọn gàng hơn
  btnSubmit: locate('button[type="submit"]').or(locate('button').withText('Đăng nhập')).or(locate('button').withText('Login')),

  async loginAsAdmin(email = 'admin_final@carbon.com', password = '123456') {
    I.amOnPage('http://localhost:5173/login');
    I.wait(2); 

    const currentUrl = await I.grabCurrentUrl();
    if (currentUrl.includes('/dashboard')) {
        I.say('Đã đăng nhập từ trước, bỏ qua bước Login.');
        return; 
    }

    I.say('Tiến hành đăng nhập mới.');
    I.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    I.refreshPage();
    
    I.waitForElement(this.inputEmail, 10);
    I.fillField(this.inputEmail, email);
    I.fillField(this.inputPassword, password);
    
    I.waitForElement(this.btnSubmit, 10);
    
    // VŨ KHÍ TỐI THƯỢNG: Ép click vào nút ĐẦU TIÊN tìm thấy, bỏ qua lỗi Strict Mode
    I.forceClick(this.btnSubmit.first());
    
    // Chờ 5s để đảm bảo chuyển hướng vào Dashboard thành công
    I.wait(5); 
  }
}