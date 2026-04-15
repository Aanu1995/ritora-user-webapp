import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiPath } from '@/constants/api-paths';
import type { RefreshResponse } from '@/types/auth';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
          _skipAuthRefresh?: boolean;
        })
      | undefined;

    const unauthenticatedPaths: string[] = [
      ApiPath.AuthLogin,
      ApiPath.AuthRegister,
      ApiPath.AuthRefresh,
      ApiPath.AuthForgotPassword,
      ApiPath.AuthResetPassword,
      ApiPath.AuthVerifyEmail,
      ApiPath.AuthResendVerification,
    ];

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      (originalRequest.url !== undefined &&
        unauthenticatedPaths.includes(originalRequest.url))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post<RefreshResponse>(ApiPath.AuthRefresh, undefined, {
            _skipAuthRefresh: true,
          } as AxiosRequestConfig)
          .then((response) => {
            setAccessToken(response.data.accessToken);
            return response.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshedToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;

      return apiClient.request(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      setAccessToken(null);
      unauthorizedHandler?.();
      return Promise.reject(refreshError);
    }
  },
);

function throwServerError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    const err = new Error(serverMessage ?? fallbackMessage);
    (err as any).status = error.response?.status;
    (err as any).body = error.response?.data;
    throw err;
  }
  throw new Error(fallbackMessage);
}

export async function getRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(url, config);
    return data;
  } catch (error) {
    throwServerError(error, `Failed to fetch ${url}`);
  }
}

export async function postRequest<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.post<T>(url, body, config);
    return data;
  } catch (error) {
    throwServerError(error, `Failed to post to ${url}`);
  }
}

export async function patchRequest<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.patch<T>(url, body, config);
    return data;
  } catch (error) {
    throwServerError(error, `Failed to patch ${url}`);
  }
}

export async function putRequest<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.put<T>(url, body, config);
    return data;
  } catch (error) {
    throwServerError(error, `Failed to update ${url}`);
  }
}

export async function deleteRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.delete<T>(url, config);
    return data;
  } catch (error) {
    throwServerError(error, `Failed to delete ${url}`);
  }
}
