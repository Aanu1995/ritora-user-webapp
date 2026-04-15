export enum AppRoute {
  Home = '/',
  Login = '/login',
  Register = '/register',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
  VerifyEmail = '/verify-email',
  ResendVerification = '/resend-verification',
  Onboarding = '/onboarding',
  Dashboard = '/dashboard',
  SkinProfile = '/skin-profile',
  Settings = '/settings',
  Privacy = '/privacy',
  Terms = '/terms',
  Cookies = '/cookies',
}

export const PROTECTED_APP_ROUTES = [
  AppRoute.Onboarding,
  AppRoute.Dashboard,
  AppRoute.SkinProfile,
  AppRoute.Settings,
] as const;

export const PUBLIC_METADATA_ROUTES = [
  AppRoute.Home,
  AppRoute.Privacy,
  AppRoute.Terms,
  AppRoute.Cookies,
] as const;
