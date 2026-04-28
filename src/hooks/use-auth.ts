"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import { ApiError } from "@/lib/api-error";
import {
  forgotPassword,
  getActiveSessions,
  getCurrentUser,
  login,
  logout as logoutRequest,
  logoutAll,
  register,
  resendVerification,
  resetPassword,
  updatePreferredLanguage,
  updateProfile,
  updateTimeZone,
  verifyEmail,
} from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type {
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  UpdatePreferredLanguageInput,
  UpdateTimeZoneInput,
  UpdateProfileInput,
  User,
} from "@/types/auth";

const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";

type QueryClientLike = ReturnType<typeof useQueryClient>;
type SetUser = ReturnType<typeof useAuthStore.getState>["setUser"];
type Logout = ReturnType<typeof useAuthStore.getState>["logout"];

function clearClientSession(
  queryClient: QueryClientLike,
  logout: Logout,
): void {
  logout();
  queryClient.clear();
}

function syncCurrentUser(
  queryClient: QueryClientLike,
  setUser: SetUser,
  user: User,
  options?: Parameters<SetUser>[1],
): void {
  setUser(user, options);
  queryClient.setQueryData<User>([QueryKey.AuthMe], user);
}

async function clearPendingAuthSession(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // Registration/login should still surface the original verification state.
  }
}

async function clearPendingRegistrationSession(
  response: RegisterResponse,
): Promise<void> {
  if (!response.accessToken) {
    return;
  }

  await clearPendingAuthSession();
}

function createEmailNotVerifiedError(): ApiError {
  return new ApiError("Email not verified", {
    status: 403,
    body: {
      code: EMAIL_NOT_VERIFIED_CODE,
      message: "Email not verified",
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await login(data);

      if (!response.user.emailVerified) {
        await clearPendingAuthSession();
        throw createEmailNotVerifiedError();
      }

      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await register(data);
      await clearPendingRegistrationSession(response);
      return response;
    },
  });
}

export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      clearClientSession(queryClient, logoutStore);
    },
    onError: () => {
      clearClientSession(queryClient, logoutStore);
    },
  });
}

export function useLogoutAll() {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAll(),
    onSuccess: () => {
      clearClientSession(queryClient, logoutStore);
    },
  });
}

export function useCurrentUser() {
  const isEnabled = useAuthEnabled();

  return useQuery({
    queryKey: [QueryKey.AuthMe],
    queryFn: () => getCurrentUser(),
    enabled: isEnabled,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => resetPassword(data),
  });
}

export function useActiveSessions() {
  const isEnabled = useAuthEnabled();

  return useQuery({
    queryKey: [QueryKey.AuthSessions],
    queryFn: () => getActiveSessions(),
    enabled: isEnabled,
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (user) => {
      syncCurrentUser(queryClient, setUser, user);
    },
  });
}

export function useUpdatePreferredLanguage() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferredLanguageInput) =>
      updatePreferredLanguage(data),
    onSuccess: (user) => {
      syncCurrentUser(queryClient, setUser, user, { syncLocale: true });
    },
  });
}

export function useUpdateTimeZone() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTimeZoneInput) => updateTimeZone(data),
    onSuccess: (user) => {
      syncCurrentUser(queryClient, setUser, user);
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Schedule] });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.ScheduleToday] });
    },
  });
}
