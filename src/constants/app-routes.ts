export enum AppRoute {
  Home = '/',
  Login = '/login',
  Register = '/register',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
  VerifyEmail = '/verify-email',
  ConfirmAccountDeletion = '/confirm-account-deletion',
  CancelAccountDeletion = '/cancel-account-deletion',
  ResendVerification = '/resend-verification',
  PostLogin = '/post-login',
  Dashboard = '/dashboard',
  CheckProduct = '/check-product',
  SkinProfile = '/skin-profile',
  Shelf = '/shelf',
  TodaysSuggestion = '/todays-suggestion',
  Schedule = '/schedule',
  Journal = '/journal',
  SmartPicks = '/smart-picks',
  SmartPicksWishlist = '/smart-picks/wishlist',
  History = '/history',
  Insights = '/insights',
  Notifications = '/notifications',
  Settings = '/settings',
  Privacy = '/privacy',
  Terms = '/terms',
  Cookies = '/cookies',
}

export const NOTIFICATION_SETTINGS_ROUTE = `${AppRoute.Settings}?tab=notifications`;

export const PROTECTED_APP_ROUTES = [
  AppRoute.PostLogin,
  AppRoute.Dashboard,
  AppRoute.CheckProduct,
  AppRoute.SkinProfile,
  AppRoute.Shelf,
  AppRoute.TodaysSuggestion,
  AppRoute.Schedule,
  AppRoute.Journal,
  AppRoute.SmartPicks,
  AppRoute.SmartPicksWishlist,
  AppRoute.History,
  AppRoute.Insights,
  AppRoute.Notifications,
  AppRoute.Settings,
] as const;

export const PUBLIC_METADATA_ROUTES = [
  AppRoute.Home,
  AppRoute.Privacy,
  AppRoute.Terms,
  AppRoute.Cookies,
] as const;
