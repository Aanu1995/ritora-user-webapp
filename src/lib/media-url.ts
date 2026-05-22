import { API_BASE_URL } from "@/lib/api";

/**
 * Build a fully qualified URL for a relative path served by the backend.
 * The API base URL ends in /api/v1, but some signed media paths already
 * include that prefix while product media paths live at the host root.
 */
export function buildBackendUrl(pathOrAbsolute: string | null): string | null {
  if (!pathOrAbsolute) return null;
  if (/^https?:\/\//i.test(pathOrAbsolute)) return pathOrAbsolute;
  try {
    const root = API_BASE_URL.replace(/\/api\/v\d+\/?$/i, "");
    const base = root.endsWith("/") ? root : `${root}/`;
    return new URL(
      pathOrAbsolute.startsWith("/") ? pathOrAbsolute.slice(1) : pathOrAbsolute,
      base,
    ).toString();
  } catch {
    return pathOrAbsolute;
  }
}
