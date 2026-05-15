import {
  API_BASE_URL,
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from '@/lib/api';
import { ApiPath } from '@/constants/api-paths';
import type {
  AccountDeletionInput,
  AccountDeletionResponse,
  AuthResponse,
  LoginInput,
  MessageResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  Session,
  UpdatePreferredLanguageInput,
  UpdateTimeZoneInput,
  UpdateProfileInput,
  User,
} from '@/types/auth';

export async function login(data: LoginInput): Promise<AuthResponse> {
  return postRequest<AuthResponse>(ApiPath.AuthLogin, data);
}

export function getGoogleOAuthStartUrl(data: {
  preferredLanguage: string;
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
}): string {
  return getOAuthStartUrl(ApiPath.AuthGoogle, data);
}

export function getAppleOAuthStartUrl(data: {
  preferredLanguage: string;
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
}): string {
  return getOAuthStartUrl(ApiPath.AuthApple, data);
}

function getOAuthStartUrl(
  path: string,
  data: {
    preferredLanguage: string;
    termsAccepted?: boolean;
    privacyPolicyAccepted?: boolean;
  },
): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${normalizedBaseUrl}${path}`);
  url.searchParams.set('language', data.preferredLanguage);
  url.searchParams.set(
    'termsAccepted',
    data.termsAccepted === true ? 'true' : 'false',
  );
  url.searchParams.set(
    'privacyPolicyAccepted',
    data.privacyPolicyAccepted === true ? 'true' : 'false',
  );
  return url.toString();
}

export async function register(data: RegisterInput): Promise<RegisterResponse> {
  return postRequest<RegisterResponse>(ApiPath.AuthRegister, data);
}

export async function refreshTokens(): Promise<RefreshResponse> {
  return postRequest<RefreshResponse>(ApiPath.AuthRefresh);
}

export async function logout(): Promise<void> {
  return postRequest(ApiPath.AuthLogout);
}

export async function logoutAll(): Promise<void> {
  return postRequest(ApiPath.AuthLogoutAll);
}

export async function getCurrentUser(): Promise<User> {
  return getRequest<User>(ApiPath.AuthMe);
}

export async function getActiveSessions(): Promise<Session[]> {
  return getRequest<Session[]>(ApiPath.AuthSessions);
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  return postRequest<MessageResponse>(ApiPath.AuthVerifyEmail, { token });
}

export async function resendVerification(
  email: string,
): Promise<MessageResponse> {
  return postRequest<MessageResponse>(ApiPath.AuthResendVerification, {
    email,
  });
}

export async function forgotPassword(
  email: string,
): Promise<MessageResponse> {
  return postRequest<MessageResponse>(ApiPath.AuthForgotPassword, { email });
}

export async function resetPassword(
  data: ResetPasswordInput,
): Promise<MessageResponse> {
  return postRequest<MessageResponse>(ApiPath.AuthResetPassword, data);
}

export async function requestAccountDeletion(
  data: AccountDeletionInput,
): Promise<AccountDeletionResponse> {
  return deleteRequest<AccountDeletionResponse>(ApiPath.AuthAccount, { data });
}

export async function confirmAccountDeletion(
  token: string,
): Promise<AccountDeletionResponse> {
  return postRequest<AccountDeletionResponse>(
    ApiPath.AuthAccountDeletionConfirm,
    { token },
  );
}

export async function cancelAccountDeletion(
  token: string,
): Promise<MessageResponse> {
  return postRequest<MessageResponse>(ApiPath.AuthAccountDeletionCancel, {
    token,
  });
}

export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  return patchRequest<User>(ApiPath.UsersMe, data);
}

export async function updatePreferredLanguage(
  data: UpdatePreferredLanguageInput,
): Promise<User> {
  return patchRequest<User>(ApiPath.UsersMeLanguage, data);
}

export async function updateTimeZone(data: UpdateTimeZoneInput): Promise<User> {
  return patchRequest<User>(ApiPath.UsersMeTimeZone, data);
}
