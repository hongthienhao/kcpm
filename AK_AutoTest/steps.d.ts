/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type VehiclePage = typeof import('./pages/VehiclePage');
type TripPage = typeof import('./pages/TripPage');
type LoginPage = typeof import('./pages/LoginPage');
type BatchPage = typeof import('./pages/BatchPage');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, VehiclePage: VehiclePage, TripPage: TripPage, LoginPage: LoginPage, BatchPage: BatchPage }
  interface Methods extends Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
