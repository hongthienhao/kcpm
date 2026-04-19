/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type AdminLoginPage = typeof import('./pages/AdminLoginPage');
type AdminDashboardPage = typeof import('./pages/AdminDashboardPage');
type AdminUserManagementPage = typeof import('./pages/AdminUserManagementPage');
type AdminWithdrawalPage = typeof import('./pages/AdminWithdrawalPage');
type AdminDisputePage = typeof import('./pages/AdminDisputePage');
type CustomHelper = import('./helpers/CustomHelper');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, AdminLoginPage: AdminLoginPage, AdminDashboardPage: AdminDashboardPage, AdminUserManagementPage: AdminUserManagementPage, AdminWithdrawalPage: AdminWithdrawalPage, AdminDisputePage: AdminDisputePage }
  interface Methods extends Playwright, CustomHelper {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
