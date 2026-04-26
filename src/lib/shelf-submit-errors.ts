import {
  getApiErrorMessages,
} from '@/lib/api-error';
import type { SubmissionValidationResult } from '@/lib/form-submission';
import type { ShelfFormFieldName } from '@/lib/shelf-form';

type ShelfTranslator = (key: string) => string;

const FIELD_PATTERNS: ReadonlyArray<{
  field: ShelfFormFieldName;
  pattern: RegExp;
}> = [
  { field: 'identity.brand', pattern: /\bbrand\b/i },
  { field: 'identity.name', pattern: /\bname\b|product\s*name/i },
  { field: 'identity.sizeMl', pattern: /\bsize\b|\bml\b/i },
  { field: 'userFields.pricePaid', pattern: /\bprice\b/i },
  { field: 'manufacturer.supportEmail', pattern: /\bemail\b/i },
  { field: 'manufacturer.productUrl', pattern: /\burl\b|\blink\b|\bwebsite\b/i },
  { field: 'userFields.expiresAt', pattern: /\bexpire/i },
];

function firstMatchingMessage(
  messages: string[],
  pattern: RegExp,
): string | undefined {
  return messages.find((message) => pattern.test(message));
}

export function getShelfSubmitError(
  error: unknown,
  t: ShelfTranslator,
): SubmissionValidationResult<ShelfFormFieldName> {
  const messages = getApiErrorMessages(error);

  for (const { field, pattern } of FIELD_PATTERNS) {
    const message = firstMatchingMessage(messages, pattern);

    if (message) {
      return {
        form: undefined,
        fields: {
          [field]: message,
        },
      };
    }
  }

  return {
    form: t('dialog.genericError'),
    fields: {},
  };
}
