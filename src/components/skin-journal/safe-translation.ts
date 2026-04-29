type DynamicTranslation = (key: string) => string;

export function safeDynamicTranslation(
  t: DynamicTranslation,
  key: string,
  fallback: string,
): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}
