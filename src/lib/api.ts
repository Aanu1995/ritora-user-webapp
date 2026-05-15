import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type RawAxiosHeaders,
} from "axios";
import { ApiPath } from "@/constants/api-paths";
import { getPreferredLocale } from "@/i18n/config";
import { ApiError, toApiErrorBody } from "@/lib/api-error";
import { getBrowserTimeZone } from "@/lib/time-zone";
import type { RefreshResponse } from "@/types/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const ABSOLUTE_HTTP_URL_PATTERN = /^https?:\/\//i;
const CREDENTIALLED_AUTH_PATHS = new Set<string>([
  ApiPath.AuthLogin,
  ApiPath.AuthGoogle,
  ApiPath.AuthRegister,
  ApiPath.AuthRefresh,
  ApiPath.AuthLogout,
  ApiPath.AuthLogoutAll,
  ApiPath.AuthAccount,
  ApiPath.UsersMeLanguage,
]);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let refreshPromise: Promise<string> | null = null;
let hasWarnedAboutDevApiTarget = false;

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

function isLoopbackHttpUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (parsedUrl.protocol !== "http:") {
      return false;
    }

    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]"
    );
  } catch {
    return false;
  }
}

function getAllowedApiOrigin(baseURL?: string): string | null {
  const effectiveBaseURL = baseURL ?? API_BASE_URL;

  if (ABSOLUTE_HTTP_URL_PATTERN.test(effectiveBaseURL)) {
    try {
      return new URL(effectiveBaseURL).origin;
    } catch {
      return null;
    }
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return null;
}

function resolveConfiguredRequestUrl(
  url: string | undefined,
  baseURL?: string,
): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const effectiveBaseURL = baseURL ?? API_BASE_URL;

    if (ABSOLUTE_HTTP_URL_PATTERN.test(effectiveBaseURL)) {
      return new URL(url, effectiveBaseURL).toString();
    }

    if (typeof window !== "undefined") {
      return new URL(url, window.location.origin).toString();
    }

    return url;
  } catch {
    return url;
  }
}

function normalizeRequestPath(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const pathname = new URL(url, API_BASE_URL).pathname;
    return pathname.startsWith("/api/v1")
      ? pathname.slice("/api/v1".length)
      : pathname;
  } catch {
    return url;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function isDevSelfReferentialApiBase(currentOrigin?: string): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  if (!ABSOLUTE_HTTP_URL_PATTERN.test(API_BASE_URL)) {
    return false;
  }

  const browserOrigin =
    currentOrigin ??
    (typeof window !== "undefined" ? window.location.origin : undefined);

  if (!browserOrigin) {
    return false;
  }

  try {
    return new URL(API_BASE_URL).origin === browserOrigin;
  } catch {
    return false;
  }
}

export function warnIfDevApiTargetsFrontend(): void {
  if (hasWarnedAboutDevApiTarget || !isDevSelfReferentialApiBase()) {
    return;
  }

  hasWarnedAboutDevApiTarget = true;

  console.warn(
    `[Ritora] NEXT_PUBLIC_API_URL (${API_BASE_URL}) matches the frontend dev origin. ` +
      "This usually means the Next dev server switched onto the backend port and is calling itself. " +
      "Free port 3000 or update NEXT_PUBLIC_API_URL to the backend origin before retrying auth requests.",
  );
}

export function isAllowedApiRequestUrl(
  url: string | undefined,
  baseURL?: string,
): boolean {
  const resolvedUrl = resolveConfiguredRequestUrl(url, baseURL);

  if (!resolvedUrl || !ABSOLUTE_HTTP_URL_PATTERN.test(resolvedUrl)) {
    return true;
  }

  const allowedOrigin = getAllowedApiOrigin(baseURL);

  if (!allowedOrigin) {
    return false;
  }

  try {
    return new URL(resolvedUrl).origin === allowedOrigin;
  } catch {
    return false;
  }
}

export function isSecureApiRequestUrl(
  url: string | undefined,
  baseURL?: string,
): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const resolvedUrl = resolveConfiguredRequestUrl(url, baseURL);

  if (!resolvedUrl || !ABSOLUTE_HTTP_URL_PATTERN.test(resolvedUrl)) {
    return true;
  }

  if (isLoopbackHttpUrl(resolvedUrl)) {
    return true;
  }

  try {
    return new URL(resolvedUrl).protocol === "https:";
  } catch {
    return false;
  }
}

export function shouldSendCredentialCookies(
  url: string | undefined,
  baseURL?: string,
): boolean {
  const requestPath = normalizeRequestPath(
    resolveConfiguredRequestUrl(url, baseURL),
  );

  return requestPath ? CREDENTIALLED_AUTH_PATHS.has(requestPath) : false;
}

export function applyRequestContext(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (!isAllowedApiRequestUrl(config.url, config.baseURL)) {
    throw new ApiError("Blocked request to unexpected API origin");
  }

  if (!isSecureApiRequestUrl(config.url, config.baseURL)) {
    throw new ApiError("Blocked insecure API transport in production");
  }

  config.headers = config.headers ?? {};
  config.headers["Accept-Language"] = getPreferredLocale();
  const browserTimeZone = getBrowserTimeZone();
  if (browserTimeZone) {
    config.headers["x-timezone"] = browserTimeZone;
    config.headers["x-time-zone"] = browserTimeZone;
  }
  config.withCredentials = shouldSendCredentialCookies(
    config.url,
    config.baseURL,
  );

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

apiClient.interceptors.request.use((config) => applyRequestContext(config));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AuthRequestConfig | undefined;

    const unauthenticatedPaths = new Set<string>([
      ApiPath.AuthLogin,
      ApiPath.AuthGoogle,
      ApiPath.AuthRegister,
      ApiPath.AuthRefresh,
      ApiPath.AuthForgotPassword,
      ApiPath.AuthResetPassword,
      ApiPath.AuthVerifyEmail,
      ApiPath.AuthResendVerification,
      ApiPath.AuthAccountDeletionConfirm,
      ApiPath.AuthAccountDeletionCancel,
    ]);
    const requestPath = normalizeRequestPath(originalRequest?.url);

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      (requestPath !== undefined && unauthenticatedPaths.has(requestPath))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        const refreshConfig: AxiosRequestConfig & { _skipAuthRefresh: true } = {
          _skipAuthRefresh: true,
        };

        refreshPromise = apiClient
          .post<RefreshResponse>(ApiPath.AuthRefresh, undefined, refreshConfig)
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
    const body = toApiErrorBody(error.response?.data);
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;

    throw new ApiError(message ?? fallbackMessage, {
      status: error.response?.status,
      body,
    });
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

export async function postMultipartRequest<T>(
  url: string,
  body: FormData,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await apiClient.post<T>(
      url,
      body,
      buildMultipartRequestConfig(config),
    );
    return data;
  } catch (error) {
    throwServerError(error, `Failed to post multipart data to ${url}`);
  }
}

export function buildMultipartRequestConfig(
  config?: AxiosRequestConfig,
): AxiosRequestConfig {
  const headers = AxiosHeaders.from(
    (config?.headers ?? {}) as RawAxiosHeaders | AxiosHeaders,
  );

  headers.set("Content-Type", false);

  return {
    ...config,
    headers,
  };
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
