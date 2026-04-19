/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type LoginPage = typeof import('./1_AuthService/pages/LoginPage');
type RegisterPage = typeof import('./1_AuthService/pages/RegisterPage');
type WalletPage = typeof import('./2_WalletService/pages/WalletPage');
type MarketplacePage = typeof import('./3_MarketplaceService/pages/MarketplacePage');
type EVOwnerListingPage = typeof import('./3_MarketplaceService/pages/EVOwnerListingPage');
type BuyerBuyNowPage = typeof import('./3_MarketplaceService/pages/BuyerBuyNowPage');
type AuctionBidPage = typeof import('./3_MarketplaceService/pages/AuctionBidPage');
type VehiclePage = typeof import('./4_CarbonLifecycleService/pages/VehiclePage');
type TripPage = typeof import('./4_CarbonLifecycleService/pages/TripPage');
type BatchPage = typeof import('./4_CarbonLifecycleService/pages/BatchPage');
type VerificationDashboardPage = typeof import('./4_CarbonLifecycleService/pages/VerificationDashboardPage');
type ReviewModalPage = typeof import('./4_CarbonLifecycleService/pages/ReviewModalPage');
type AdminLoginPage = typeof import('./5_AdminService/pages/AdminLoginPage');
type AdminDashboardPage = typeof import('./5_AdminService/pages/AdminDashboardPage');
type AdminUserManagementPage = typeof import('./5_AdminService/pages/AdminUserManagementPage');
type AdminWithdrawalPage = typeof import('./5_AdminService/pages/AdminWithdrawalPage');
type AdminDisputePage = typeof import('./5_AdminService/pages/AdminDisputePage');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, LoginPage: LoginPage, RegisterPage: RegisterPage, WalletPage: WalletPage, MarketplacePage: MarketplacePage, EVOwnerListingPage: EVOwnerListingPage, BuyerBuyNowPage: BuyerBuyNowPage, AuctionBidPage: AuctionBidPage, VehiclePage: VehiclePage, TripPage: TripPage, BatchPage: BatchPage, VerificationDashboardPage: VerificationDashboardPage, ReviewModalPage: ReviewModalPage, AdminLoginPage: AdminLoginPage, AdminDashboardPage: AdminDashboardPage, AdminUserManagementPage: AdminUserManagementPage, AdminWithdrawalPage: AdminWithdrawalPage, AdminDisputePage: AdminDisputePage }
  interface Methods extends Playwright, REST, JSONResponse {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
