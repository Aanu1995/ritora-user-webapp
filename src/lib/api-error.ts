export type ApiFieldErrors = Record<string, string[]>;

export type ApiErrorBody = {
  message?: string | string[];
  code?: string;
  fieldErrors?: ApiFieldErrors;
  [key: string]: unknown;
};

type ApiErrorOptions = {
  status?: number;
  body?: ApiErrorBody;
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null;
}

function isApiFieldErrors(value: unknown): value is ApiFieldErrors {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.values(value).every(
    (entry) =>
      Array.isArray(entry) &&
      entry.every((message) => typeof message === 'string'),
  );
}

export class ApiError extends Error {
  readonly status?: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.body = options.body;
  }
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  return error instanceof ApiError ? error.body : undefined;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return getApiErrorBody(error)?.code;
}

export function getApiFieldErrors(
  error: unknown,
): ApiFieldErrors | undefined {
  const fieldErrors = getApiErrorBody(error)?.fieldErrors;
  return isApiFieldErrors(fieldErrors) ? fieldErrors : undefined;
}

export function getApiFieldError(
  error: unknown,
  field: string,
): string | undefined {
  const messages = getApiFieldErrors(error)?.[field];

  if (!Array.isArray(messages)) {
    return undefined;
  }

  return messages.find(
    (message): message is string => typeof message === 'string' && message.length > 0,
  );
}

export function getApiErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : undefined;
  }

  const message = error.body?.message;

  if (Array.isArray(message)) {
    return message[0];
  }

  return message ?? error.message;
}

export function getApiErrorMessages(error: unknown): string[] {
  const body = getApiErrorBody(error);
  const message = body?.message;

  if (Array.isArray(message)) {
    return message.filter(
      (entry): entry is string => typeof entry === 'string' && entry.length > 0,
    );
  }

  const singleMessage = getApiErrorMessage(error);
  return singleMessage ? [singleMessage] : [];
}

export function toApiErrorBody(value: unknown): ApiErrorBody | undefined {
  return isApiErrorBody(value) ? value : undefined;
}
