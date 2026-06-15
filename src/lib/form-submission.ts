import type { UseMutateFunction } from '@tanstack/react-query';
import type { AnyFieldLikeMetaBase } from '@tanstack/form-core';

export type SubmissionFieldErrors<TField extends string> = Partial<
  Record<TField, string>
>;

export type SubmissionValidationResult<TField extends string> = {
  form?: string;
  fields: SubmissionFieldErrors<TField>;
};

type FieldMetaWithSubmitErrors = AnyFieldLikeMetaBase;

type FormApiWithSubmitErrors<TField extends string> = {
  setErrorMap: (errorMap: {
    onSubmit?:
      | {
          form?: string;
          fields: Partial<Record<TField, unknown>>;
        }
      | undefined;
  }) => void;
  state?: {
    errorMap: {
      onSubmit?:
        | {
            form?: unknown;
            fields?: Partial<Record<TField, unknown>>;
          }
        | undefined;
    };
    fieldMeta?: Partial<Record<TField, FieldMetaWithSubmitErrors>>;
  };
  setFieldMeta?: (
    field: TField,
    updater: (meta: FieldMetaWithSubmitErrors) => FieldMetaWithSubmitErrors,
  ) => void;
};

export type MutationExecutionResult<TData, TError> =
  | { data: TData; error: null }
  | { data: null; error: TError };

export function executeMutation<TData, TError, TVariables, TContext>(
  mutate: UseMutateFunction<TData, TError, TVariables, TContext>,
  variables: TVariables,
): Promise<MutationExecutionResult<TData, TError>> {
  return new Promise((resolve) => {
    mutate(variables, {
      onSuccess: (data) => {
        resolve({ data, error: null });
      },
      onError: (error) => {
        resolve({ data: null, error });
      },
    });
  });
}

export function clearSubmitErrors<TField extends string>(
  formApi: FormApiWithSubmitErrors<TField>,
): void {
  const submitError = formApi.state?.errorMap.onSubmit;
  const hasSubmitError =
    formApi.state === undefined ||
    (submitError !== undefined && hasSubmitErrorPayload(submitError));
  const hasFieldMetaErrors = clearFieldSubmitErrors(formApi);

  if (!hasSubmitError && !hasFieldMetaErrors) {
    return;
  }

  formApi.setErrorMap({
    onSubmit: {
      form: undefined,
      fields: {},
    },
  });
}

function hasSubmitErrorPayload(submitError: unknown): boolean {
  if (readSubmissionErrorMessage(submitError) !== undefined) {
    return true;
  }

  if (typeof submitError !== 'object' || submitError === null) {
    return Boolean(submitError);
  }

  const shapedError = submitError as {
    form?: unknown;
    fields?: Record<string, unknown>;
  };
  const hasFormError =
    readSubmissionErrorMessage(shapedError.form) !== undefined;
  const hasFieldErrors = Object.values(shapedError.fields ?? {}).some(
    (value) => readSubmissionErrorMessage(value) !== undefined,
  );

  if (hasFormError || hasFieldErrors) {
    return true;
  }

  const keys = Object.keys(submitError);
  const isEmptyKnownShape = keys.every(
    (key) => key === 'form' || key === 'fields',
  );

  return keys.length > 0 && !isEmptyKnownShape;
}

function clearFieldSubmitErrors<TField extends string>(
  formApi: FormApiWithSubmitErrors<TField>,
): boolean {
  if (!formApi.setFieldMeta || !formApi.state?.fieldMeta) {
    return false;
  }

  let cleared = false;
  const fieldMeta = formApi.state.fieldMeta;

  for (const field of Object.keys(fieldMeta) as TField[]) {
    const meta = fieldMeta[field];
    const hasSubmitError = meta?.errorMap?.onSubmit !== undefined;
    const hasBlurError = meta?.errorMap?.onBlur !== undefined;

    if (!hasSubmitError && !hasBlurError) {
      continue;
    }

    cleared = true;
    formApi.setFieldMeta(field, (previous) => ({
      ...previous,
      errorMap: {
        ...previous.errorMap,
        onSubmit: undefined,
        onBlur: undefined,
      },
      errorSourceMap: {
        ...previous.errorSourceMap,
        onSubmit: undefined,
        onBlur: undefined,
      },
    }));
  }

  return cleared;
}

export function setSubmitErrors<TField extends string>(
  formApi: FormApiWithSubmitErrors<TField>,
  result: SubmissionValidationResult<TField>,
): void {
  formApi.setErrorMap({
    onSubmit: {
      form: result.form,
      fields: result.fields,
    },
  });
}

export function readSubmissionErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') {
    return error;
  }

  if (Array.isArray(error)) {
    return error.find(
      (entry): entry is string => typeof entry === 'string' && entry.length > 0,
    );
  }

  if (typeof error === 'object' && error !== null) {
    if ('form' in error) {
      return readSubmissionErrorMessage(
        (error as { form?: unknown }).form,
      );
    }

    if ('message' in error) {
      return readSubmissionErrorMessage(
        (error as { message?: unknown }).message,
      );
    }
  }

  return undefined;
}
