type DynamicTranslation = {
  (key: string): string;
  has?: (key: string) => boolean;
};

export function safeDynamicTranslation(
  t: DynamicTranslation,
  key: string,
  fallback: string,
): string {
  if (t.has && !t.has(key)) {
    return fallback;
  }

  try {
    return t(key);
  } catch {
    return fallback;
  }
}
