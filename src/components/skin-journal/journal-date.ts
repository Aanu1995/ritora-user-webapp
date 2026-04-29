export function resolveCanonicalTodayDate(
  backendTodayDate: string | undefined,
  fallbackTodayDate: string,
): string {
  return backendTodayDate ?? fallbackTodayDate;
}
