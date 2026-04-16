import { getRequest, patchRequest, postRequest } from '@/lib/api';
import { ApiPath } from '@/constants/api-paths';
import type {
  AuthResponse,
  LoginInput,
  MessageResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  Session,
  UpdateProfileInput,
  User,
} from '@/types/auth';

export async function login(data: LoginInput): Promise<AuthResponse> {
  return postRequest<AuthResponse>(ApiPath.AuthLogin, data);
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

export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  return patchRequest<User>(ApiPath.UsersMe, data);
}
