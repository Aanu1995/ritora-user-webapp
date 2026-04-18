import type { UseMutateFunction } from "@tanstack/react-query";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
  setSubmitErrors,
} from "@/lib/form-submission";

describe("form-submission", () => {
  it("resolves successful mutations", async () => {
    const mutate = jest.fn(
      (_variables: { email: string }, options?: { onSuccess?: (...args: unknown[]) => void }) => {
        options?.onSuccess?.({ ok: true });
      },
    ) as unknown as UseMutateFunction<
      { ok: boolean },
      unknown,
      { email: string },
      unknown
    >;

    await expect(
      executeMutation(mutate, { email: "ada@example.com" }),
    ).resolves.toEqual({
      data: { ok: true },
      error: null,
    });
  });

  it("resolves failed mutations without throwing", async () => {
    const error = new Error("Boom");
    const mutate = jest.fn(
      (_variables: { email: string }, options?: { onError?: (...args: unknown[]) => void }) => {
        options?.onError?.(error);
      },
    ) as unknown as UseMutateFunction<
      unknown,
      Error,
      { email: string },
      unknown
    >;

    await expect(
      executeMutation(mutate, { email: "ada@example.com" }),
    ).resolves.toEqual({
      data: null,
      error,
    });
  });

  it("clears submit errors from the form", () => {
    const setErrorMap = jest.fn();

    clearSubmitErrors({ setErrorMap });

    expect(setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: undefined,
        fields: {},
      },
    });
  });

  it("sets submit errors on the form", () => {
    const setErrorMap = jest.fn();

    setSubmitErrors(
      { setErrorMap },
      {
        form: "Try again",
        fields: {
          email: "Email is invalid",
        },
      },
    );

    expect(setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: "Try again",
        fields: {
          email: "Email is invalid",
        },
      },
    });
  });

  it("extracts submission messages from different error shapes", () => {
    expect(readSubmissionErrorMessage("Simple")).toBe("Simple");
    expect(readSubmissionErrorMessage(["First", "Second"])).toBe("First");
    expect(
      readSubmissionErrorMessage({
        form: { message: "Nested message" },
      }),
    ).toBe("Nested message");
    expect(readSubmissionErrorMessage(undefined)).toBeUndefined();
  });
});
