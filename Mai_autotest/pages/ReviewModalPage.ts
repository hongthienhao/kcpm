const { I } = inject();

export = {
  locators: {
    approveBtn: '#btn-approve',
    rejectBtn: '#btn-reject',
    reasonInput: '#reason-input',
    confirmBtn: '#btn-confirm'
  },
  approve() {
    I.click(this.locators.approveBtn);
    I.click(this.locators.confirmBtn);
  }
}