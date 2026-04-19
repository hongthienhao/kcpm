const { I } = inject();

module.exports = {
  // Locators
  fields: {
    email: '#email',
    password: '#password'
  },
  submitButton: 'button[type="submit"]',

  // Methods
  login(email, password) {
    I.fillField(this.fields.email, email);
    I.fillField(this.fields.password, password);
    I.retry(2).click(this.submitButton);
  }
}
