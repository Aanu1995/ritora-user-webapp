import { AppRoute } from "@/constants/app-routes";
import type { UnsavedChangesGuardRelease } from "@/hooks/use-unsaved-changes-guard";
import { requestAppScrollRestore } from "@/lib/app-scroll-restoration";

export const SHELF_RETURN_TO_PARAM = "returnTo";

type SearchParamsReader = Pick<URLSearchParams, "get">;

export type SaveNavigationRouter = {
  back: () => void;
  replace: (href: string) => void;
};

type BrowserHistoryAdapter = {
  length: number;
  go: (delta: number) => void;
};

type NavigateAfterShelfSaveInput = {
  router: SaveNavigationRouter;
  releaseGuard: (options?: {
    removeHistoryEntry?: boolean;
  }) => UnsavedChangesGuardRelease;
  fallbackHref: string;
  returnToHref: string | null;
  browserHistory?: BrowserHistoryAdapter;
};

function isSafeInternalHref(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

function normalizeInternalHref(value: string): string | null {
  const trimmed = value.trim();

  if (!isSafeInternalHref(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, "https://ritora.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function isShelfFormPathname(pathname: string): boolean {
  return (
    pathname === `${AppRoute.Shelf}/new` ||
    /^\/shelf\/[^/]+\/edit$/.test(pathname)
  );
}

export function readShelfReturnTo(
  searchParams: SearchParamsReader,
  currentPathname: string,
): string | null {
  const rawReturnTo = searchParams.get(SHELF_RETURN_TO_PARAM);

  if (!rawReturnTo) {
    return null;
  }

  const normalized = normalizeInternalHref(rawReturnTo);

  if (!normalized) {
    return null;
  }

  const parsed = new URL(normalized, "https://ritora.local");

  if (
    parsed.pathname === currentPathname ||
    isShelfFormPathname(parsed.pathname)
  ) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function buildShelfReturnHref(
  href: string,
  returnToHref: string,
): string {
  const normalizedReturnTo = normalizeInternalHref(returnToHref);

  if (!normalizedReturnTo) {
    return href;
  }

  const [pathWithQuery, hash = ""] = href.split("#");
  const [pathname, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);
  params.set(SHELF_RETURN_TO_PARAM, normalizedReturnTo);
  const nextQuery = params.toString();

  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${
    hash ? `#${hash}` : ""
  }`;
}

function getBrowserHistory(): BrowserHistoryAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.history;
}

export function navigateAfterShelfSave({
  router,
  releaseGuard,
  fallbackHref,
  returnToHref,
  browserHistory = getBrowserHistory() ?? undefined,
}: NavigateAfterShelfSaveInput): void {
  const release = releaseGuard({ removeHistoryEntry: false });

  if (returnToHref) {
    requestAppScrollRestore(returnToHref);
    router.replace(returnToHref);
    return;
  }

  if (release.hadHistoryEntry) {
    if (browserHistory && browserHistory.length > 2) {
      browserHistory.go(-2);
      return;
    }

    requestAppScrollRestore(fallbackHref);
    router.replace(fallbackHref);
    return;
  }

  if (browserHistory && browserHistory.length > 1) {
    router.back();
    return;
  }

  const nextFallbackHref = fallbackHref || AppRoute.Shelf;
  requestAppScrollRestore(nextFallbackHref);
  router.replace(nextFallbackHref);
}
