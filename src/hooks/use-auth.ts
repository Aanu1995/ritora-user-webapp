"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { ApiError } from "@/lib/api-error";
import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type {
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  UpdatePreferredLanguageInput,
  UpdateProfileInput,
  User,
} from "@/types/auth";

const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";

async function clearPendingAuthSession(): Promise<void> {
  try {
    await authService.logout();
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
      const response = await authService.login(data);

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
      const response = await authService.register(data);
      await clearPendingRegistrationSession(response);
      return response;
    },
  });
}

export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const clearClientSession = () => {
    logoutStore();
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearClientSession();
    },
    onError: () => {
      clearClientSession();
    },
  });
}

export function useLogoutAll() {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const clearClientSession = () => {
    logoutStore();
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      clearClientSession();
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.AuthMe],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authService.resetPassword(data),
  });
}

export function useActiveSessions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.AuthSessions],
    queryFn: () => authService.getActiveSessions(),
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => authService.updateProfile(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData<User>([QueryKey.AuthMe], user);
    },
  });
}

export function useUpdatePreferredLanguage() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferredLanguageInput) =>
      authService.updatePreferredLanguage(data),
    onSuccess: (user) => {
      setUser(user, { syncLocale: true });
      queryClient.setQueryData<User>([QueryKey.AuthMe], user);
    },
  });
}
