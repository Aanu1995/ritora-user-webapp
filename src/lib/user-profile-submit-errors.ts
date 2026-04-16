import {
  getApiErrorMessage,
  getApiErrorMessages,
} from "@/lib/api-error";
import type { SubmissionValidationResult } from "@/lib/form-submission";

type SettingsTranslator = (key: string) => string;

export type UserProfileFieldName = "firstName" | "lastName";

const FIRST_NAME_MESSAGE_PATTERN = /first\s*name/i;
const LAST_NAME_MESSAGE_PATTERN = /last\s*name/i;

function firstMatchingMessage(
  messages: string[],
  pattern: RegExp,
): string | undefined {
  return messages.find((message) => pattern.test(message));
}

export function getUserProfileSubmitError(
  error: unknown,
  t: SettingsTranslator,
): SubmissionValidationResult<UserProfileFieldName> {
  const messages = getApiErrorMessages(error);

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

  return {
    form: getApiErrorMessage(error) ?? t("account.nameUpdateFailed"),
    fields: {},
  };
}
