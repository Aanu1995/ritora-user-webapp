/**
 * Maps server errors (as shaped by our axios interceptor in `src/lib/api.ts`)
 * into user-facing translation keys under the `auth.errors.*` namespace.
 *
 * The axios interceptor normalises errors to:
 *   {
 *     message: string,         // server-supplied or fallback
 *     status?: number,         // HTTP status (undefined on network errors)
 *     body?: { message?: string; code?: string; ... }
 *   }
 *
 * Call this helper from form pages:
 *   const text = getAuthErrorMessage(login.error, t);
 *   // t is the result of useTranslations('auth')
 */

import { getApiErrorBody, getApiErrorStatus } from './api-error';

type AuthTranslator = (key: string) => string;
type LooseErrorShape = {
  status?: unknown;
  body?: unknown;
  message?: unknown;
};

function firstStringMessage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find(
      (entry): entry is string => typeof entry === 'string' && entry.length > 0,
    );
  }

  return undefined;
}

const CODE_TO_KEY: Record<string, string> = {
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  BAD_CREDENTIALS: 'errors.invalidCredentials',
  WRONG_PASSWORD: 'errors.invalidCredentials',
  EMAIL_IN_USE: 'errors.emailInUse',
  EMAIL_ALREADY_EXISTS: 'errors.emailInUse',
  ACCOUNT_EXISTS: 'errors.emailInUse',
  USER_NOT_FOUND: 'errors.userNotFound',
  EMAIL_NOT_FOUND: 'errors.userNotFound',
  EMAIL_NOT_VERIFIED: 'errors.emailNotVerified',
  TOKEN_EXPIRED: 'errors.tokenExpired',
  EXPIRED_TOKEN: 'errors.tokenExpired',
  RESET_TOKEN_EXPIRED: 'errors.tokenExpired',
  VERIFICATION_TOKEN_EXPIRED: 'errors.tokenExpired',
  TOKEN_INVALID: 'errors.tokenInvalid',
  INVALID_TOKEN: 'errors.tokenInvalid',
  RESET_TOKEN_INVALID: 'errors.tokenInvalid',
  VERIFICATION_TOKEN_INVALID: 'errors.tokenInvalid',
  ACCOUNT_LOCKED: 'errors.accountLocked',
  RATE_LIMIT: 'errors.rateLimit',
  TOO_MANY_REQUESTS: 'errors.rateLimit',
  VALIDATION_ERROR: 'errors.validationFailed',
  VALIDATION_FAILED: 'errors.validationFailed',
  FORBIDDEN: 'errors.forbidden',
};

const STATUS_TO_KEY: Record<number, string> = {
  400: 'errors.validationFailed',
  401: 'errors.invalidCredentials',
  403: 'errors.forbidden',
  404: 'errors.userNotFound',
  409: 'errors.emailInUse',
  410: 'errors.tokenExpired',
  422: 'errors.validationFailed',
  423: 'errors.accountLocked',
  429: 'errors.rateLimit',
  500: 'errors.serverError',
  502: 'errors.serverError',
  503: 'errors.serverError',
  504: 'errors.serverError',
};

export function getAuthErrorMessage(
  error: unknown,
  t: AuthTranslator,
  fallbackKey = 'errors.unknown',
): string {
  if (!error) {
    return t(fallbackKey);
  }

  // No status → network error (axios interceptor only sets status on real responses).
  const rawError =
    typeof error === 'object' && error !== null ? (error as LooseErrorShape) : null;
  const status =
    getApiErrorStatus(error) ??
    (typeof rawError?.status === 'number' ? rawError.status : undefined);
  if (status === undefined || status === 0) {
    return t('errors.networkError');
  }

  // Server-provided code is the most reliable mapping.
  const body =
    getApiErrorBody(error) ??
    (typeof rawError?.body === 'object' && rawError.body !== null
      ? (rawError.body as { message?: string; code?: string })
      : undefined);
  const code = body?.code;
  if (typeof code === 'string' && code.toUpperCase() in CODE_TO_KEY) {
    return t(CODE_TO_KEY[code.toUpperCase()]);
  }

  // Fallback to HTTP status.
  if (status in STATUS_TO_KEY) {
    return t(STATUS_TO_KEY[status]);
  }

  // Use the server-supplied message if it looks human-friendly.
  const raw =
    firstStringMessage(body?.message) ??
    (error instanceof Error
      ? error.message
      : typeof rawError?.message === 'string'
        ? rawError.message
        : undefined);
  if (typeof raw === 'string' && raw && raw.length < 200 && !raw.includes('\n')) {
    return raw;
  }

  return t(fallbackKey);
}
