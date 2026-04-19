const { I } = inject();

module.exports = {
  // Locators
  fields: {
    fullName: '#fullName',
    email: '#email',
    password: '#password',
    confirmPassword: '#confirmPassword',
  },
  roles: {
    EVOwner: 'div[class*="roleOption"]:has-text("Chủ xe điện")',
    CreditBuyer: 'div[class*="roleOption"]:has-text("Nhà mua credit")'
  },
  agreeTermsCheckbox: '#agreeTerms',
  submitButton: 'button[type="submit"]',

  // Methods
  register(userData) {
    I.fillField(this.fields.fullName, userData.fullName);
    I.fillField(this.fields.email, userData.email);
    I.fillField(this.fields.password, userData.password);
    I.fillField(this.fields.confirmPassword, userData.confirmPassword);
    
    if (userData.role === 'CreditBuyer') {
      I.retry(2).click(this.roles.CreditBuyer);
    } else {
      I.retry(2).click(this.roles.EVOwner);
    }
    
    I.checkOption(this.agreeTermsCheckbox);
    I.retry(2).click(this.submitButton);
  }
}
