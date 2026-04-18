export enum AppRoute {
  Home = '/',
  Login = '/login',
  Register = '/register',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
  VerifyEmail = '/verify-email',
  ResendVerification = '/resend-verification',
  PostLogin = '/post-login',
  Dashboard = '/dashboard',
  SkinProfile = '/skin-profile',
  Shelf = '/shelf',
  TodaysSuggestion = '/todays-suggestion',
  Journal = '/journal',
  SmartPicks = '/smart-picks',
  History = '/history',
  Insights = '/insights',
  Notifications = '/notifications',
  Settings = '/settings',
  Privacy = '/privacy',
  Terms = '/terms',
  Cookies = '/cookies',
}

export const PROTECTED_APP_ROUTES = [
  AppRoute.PostLogin,
  AppRoute.Dashboard,
  AppRoute.SkinProfile,
  AppRoute.Shelf,
  AppRoute.TodaysSuggestion,
  AppRoute.Journal,
  AppRoute.SmartPicks,
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
