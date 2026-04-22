import type { UseMutateFunction } from '@tanstack/react-query';

export type SubmissionFieldErrors<TField extends string> = Partial<
  Record<TField, string>
>;

export type SubmissionValidationResult<TField extends string> = {
  form?: string;
  fields: SubmissionFieldErrors<TField>;
};

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
  };
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
  if (submitError !== undefined) {
    const fieldValues = Object.values(submitError.fields ?? {});
    const hasFieldErrors = fieldValues.some((value) =>
      readSubmissionErrorMessage(value) !== undefined,
    );
    const hasFormError =
      readSubmissionErrorMessage(submitError.form) !== undefined;

    if (!hasFormError && !hasFieldErrors) {
      return;
    }
  }

  formApi.setErrorMap({
    onSubmit: {
      form: undefined,
      fields: {},
    },
  });
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
