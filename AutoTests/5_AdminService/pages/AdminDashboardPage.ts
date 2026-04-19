const { I } = inject();

export = {
  route: '/admin/dashboard',

  // MUI Typography h4 or h5 for dashboard title
  title: locate('h4,h5,h6').withText('Dashboard').or(locate('h4,h5,h6').withText('Bảng điều khiển')),

  open() {
    I.amOnPage(this.route);
    I.wait(2);
  },

  verifyIsOnDashboard() {
    I.waitInUrl('/admin/dashboard', 10);
  },
};
