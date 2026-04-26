import {
  getApiErrorBody,
  getApiFieldError,
  getApiErrorStatus,
} from '@/lib/api-error';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import type { SubmissionValidationResult } from '@/lib/form-submission';

type AuthTranslator = (key: string) => string;

export type LoginFieldName = 'email' | 'password';
export type RegisterFieldName =
  | 'confirmPassword'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'privacyPolicyAccepted'
  | 'termsAccepted';
export type EmailFieldName = 'email';
export type ResetPasswordFieldName = 'confirmPassword' | 'newPassword';

function getFirstStructuredFieldError<FieldName extends string>(
  error: unknown,
  fields: readonly FieldName[],
): { field: FieldName; message: string } | null {
  for (const field of fields) {
    const message = getApiFieldError(error, field);

    if (message) {
      return { field, message };
    }
  }

  return null;
}

export function getLoginSubmitError(
  error: unknown,
  t: AuthTranslator,
): SubmissionValidationResult<LoginFieldName> {
  const fieldError = getFirstStructuredFieldError(error, ['email', 'password']);

  if (fieldError) {
    return {
      form: undefined,
      fields: {
        [fieldError.field]: fieldError.message,
      } as SubmissionValidationResult<LoginFieldName>['fields'],
    };
  }

  return {
    form: getAuthErrorMessage(error, t),
    fields: {},
  };
}

export function getRegisterSubmitError(
  error: unknown,
  t: AuthTranslator,
): SubmissionValidationResult<RegisterFieldName> {
  const status = getApiErrorStatus(error);
  const body = getApiErrorBody(error);
  const code = typeof body?.code === 'string' ? body.code.toUpperCase() : '';

  if (
    status === 409 ||
    code === 'EMAIL_IN_USE' ||
    code === 'EMAIL_ALREADY_EXISTS' ||
    code === 'ACCOUNT_EXISTS'
  ) {
    return {
      fields: {
        email: getAuthErrorMessage(error, t, 'errors.emailInUse'),
      },
    };
  }

  const fieldError = getFirstStructuredFieldError(error, [
    'email',
    'password',
    'firstName',
    'lastName',
    'termsAccepted',
    'privacyPolicyAccepted',
  ]);

  if (fieldError) {
    return {
      form: undefined,
      fields: {
        [fieldError.field]: fieldError.message,
      },
    } as SubmissionValidationResult<RegisterFieldName>;
  }

  if (code === 'VALIDATION_FAILED' || status === 400 || status === 422) {
    return {
      form: getAuthErrorMessage(error, t, 'errors.validationFailed'),
      fields: {},
    };
  }

  return {
    form: getAuthErrorMessage(error, t, 'errors.unknown'),
    fields: {},
  };
}

export function getEmailOnlySubmitError(
  error: unknown,
  t: AuthTranslator,
): SubmissionValidationResult<EmailFieldName> {
  const emailMessage = getApiFieldError(error, 'email');

  if (emailMessage) {
    return {
      form: undefined,
      fields: {
        email: emailMessage,
      },
    };
  }

  return {
    form: getAuthErrorMessage(error, t),
    fields: {},
  };
}

export function getResetPasswordSubmitError(
  error: unknown,
  t: AuthTranslator,
): SubmissionValidationResult<ResetPasswordFieldName> {
  const passwordMessage = getApiFieldError(error, 'newPassword');

  if (passwordMessage) {
    return {
      form: undefined,
      fields: {
        newPassword: passwordMessage,
      },
    };
  }

  const tokenMessage = getApiFieldError(error, 'token');

  if (tokenMessage) {
    return {
      form: tokenMessage,
      fields: {},
    };
  }

  return {
    form: getAuthErrorMessage(error, t, 'errors.unknown'),
    fields: {},
  };
}
