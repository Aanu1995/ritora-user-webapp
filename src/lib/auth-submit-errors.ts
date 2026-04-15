import {
  getApiErrorBody,
  getApiErrorMessages,
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

const EMAIL_MESSAGE_PATTERN = /\bemail\b/i;
const PASSWORD_MESSAGE_PATTERN = /\bpassword\b/i;
const FIRST_NAME_MESSAGE_PATTERN = /first\s*name/i;
const LAST_NAME_MESSAGE_PATTERN = /last\s*name/i;
const TERMS_MESSAGE_PATTERN = /\bterms\b/i;
const PRIVACY_MESSAGE_PATTERN = /\bprivacy\b/i;

function firstMatchingMessage(
  messages: string[],
  pattern: RegExp,
): string | undefined {
  return messages.find((message) => pattern.test(message));
}

function getValidationMessages(error: unknown): string[] {
  return getApiErrorMessages(error);
}

export function getLoginSubmitError(
  error: unknown,
  t: AuthTranslator,
): SubmissionValidationResult<LoginFieldName> {
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
  const messages = getValidationMessages(error);

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

  const emailMessage = firstMatchingMessage(messages, EMAIL_MESSAGE_PATTERN);
  if (emailMessage) {
    return {
      form: undefined,
      fields: {
        email: emailMessage,
      },
    };
  }

  const passwordMessage = firstMatchingMessage(
    messages,
    PASSWORD_MESSAGE_PATTERN,
  );
  if (passwordMessage) {
    return {
      form: undefined,
      fields: {
        password: passwordMessage,
      },
    };
  }

  const firstNameMessage = firstMatchingMessage(
    messages,
    FIRST_NAME_MESSAGE_PATTERN,
  );
  if (firstNameMessage) {
    return {
      form: undefined,
      fields: {
        firstName: firstNameMessage,
      },
    };
  }

  const lastNameMessage = firstMatchingMessage(
    messages,
    LAST_NAME_MESSAGE_PATTERN,
  );
  if (lastNameMessage) {
    return {
      form: undefined,
      fields: {
        lastName: lastNameMessage,
      },
    };
  }

  const termsMessage = firstMatchingMessage(messages, TERMS_MESSAGE_PATTERN);
  if (termsMessage) {
    return {
      form: undefined,
      fields: {
        termsAccepted: termsMessage,
      },
    };
  }

  const privacyMessage = firstMatchingMessage(messages, PRIVACY_MESSAGE_PATTERN);
  if (privacyMessage) {
    return {
      form: undefined,
      fields: {
        privacyPolicyAccepted: privacyMessage,
      },
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
  const messages = getValidationMessages(error);
  const emailMessage = firstMatchingMessage(messages, EMAIL_MESSAGE_PATTERN);

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
  const messages = getValidationMessages(error);
  const passwordMessage = firstMatchingMessage(
    messages,
    PASSWORD_MESSAGE_PATTERN,
  );

  if (passwordMessage) {
    return {
      form: undefined,
      fields: {
        newPassword: passwordMessage,
      },
    };
  }

  return {
    form: getAuthErrorMessage(error, t, 'errors.unknown'),
    fields: {},
  };
}
