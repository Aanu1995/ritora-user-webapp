import type { useTranslations } from "next-intl";

type SkinProfileTranslator = ReturnType<typeof useTranslations>;

export const compactStrings = (
  values: Array<string | null | undefined>,
): string[] => values.filter((value): value is string => Boolean(value));

export function translateOptionValue(
  t: SkinProfileTranslator,
  value: string,
): string {
  const key = `options.${value}`;

  try {
    const translated = t(key);
    return isMissingOptionLabel(translated, key)
      ? formatCustomOptionLabel(value)
      : translated;
  } catch {
    return formatCustomOptionLabel(value);
  }
}

function isMissingOptionLabel(translated: string, key: string): boolean {
  return translated === key || translated === `skinProfile.${key}`;
}

function formatCustomOptionLabel(value: string): string {
  const trimmed = value.trim();
  const readable = /\s/.test(trimmed)
    ? trimmed
    : trimmed.replace(/[_-]+/g, " ");

  if (!readable) {
    return value;
  }

  return `${readable.charAt(0).toUpperCase()}${readable.slice(1)}`;
}
