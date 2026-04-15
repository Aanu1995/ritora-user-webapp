/**
 * TanStack Form + Zod produces field errors shaped like
 * `{ message?: string }` via Standard Schema. This helper extracts the first
 * error message from a field's `meta.errors` array and, when the message
 * looks like a translation key, runs it through a caller-supplied `t()`
 * function.
 *
 * Convention:
 *   - Zod schemas emit keys like `validation.emailRequired`.
 *   - Callers pass a namespace-scoped translator, e.g.
 *     `firstFieldError(field.state.meta.errors, useTranslations('auth'))`.
 *     That translator resolves `validation.emailRequired` to
 *     `auth.validation.emailRequired`.
 *   - Only key-shaped dotted strings are translated. Runtime-supplied
 *     sentences like `Email already in use. Try again.` are returned verbatim.
 */

export type FieldIssue = string | { message?: string } | undefined | null;

type Translator = (key: string) => string;

const TRANSLATION_KEY_PATTERN = /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)+$/i;

export function firstFieldError(
  errors: ReadonlyArray<FieldIssue> | null | undefined,
  translate: Translator,
): string | undefined {
  if (!errors || errors.length === 0) {
    return undefined;
  }

  const rawIssue = errors.find(
    (issue) => typeof issue === 'string' || Boolean(issue?.message),
  );
  const raw =
    typeof rawIssue === 'string' ? rawIssue : rawIssue?.message;
  if (!raw) {
    return undefined;
  }

  if (!TRANSLATION_KEY_PATTERN.test(raw)) {
    return raw;
  }

  try {
    return translate(raw);
  } catch {
    return raw;
  }
}
