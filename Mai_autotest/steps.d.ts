/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type VerificationDashboardPage = typeof import('./pages/VerificationDashboardPage');
type ReviewModalPage = typeof import('./pages/ReviewModalPage');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, VerificationDashboardPage: VerificationDashboardPage, ReviewModalPage: ReviewModalPage }
  interface Methods extends Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
