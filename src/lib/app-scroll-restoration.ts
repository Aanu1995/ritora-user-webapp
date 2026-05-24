"use client";

export const APP_SCROLL_ROOT_SELECTOR = "[data-app-scroll-root]";

const SCROLL_POSITION_PREFIX = "ritora:app-scroll:";
const EXPLICIT_SCROLL_POSITION_PREFIX = "ritora:app-scroll-explicit:";
const RESTORE_REQUEST_KEY = "ritora:app-scroll:restore-next";

function normalizePathname(value: string): string {
  if (typeof window === "undefined") {
    return value.split(/[?#]/, 1)[0] ?? value;
  }

  try {
    return new URL(value, window.location.origin).pathname;
  } catch {
    return value.split(/[?#]/, 1)[0] ?? value;
  }
}

export function getAppScrollRoot(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>(APP_SCROLL_ROOT_SELECTOR);
}

export function getAppScrollPosition(pathname: string): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const explicitValue = window.sessionStorage.getItem(
      `${EXPLICIT_SCROLL_POSITION_PREFIX}${normalizePathname(pathname)}`,
    );
    const parsedExplicitValue =
      explicitValue === null ? Number.NaN : Number(explicitValue);

    if (Number.isFinite(parsedExplicitValue)) {
      return parsedExplicitValue;
    }

    const rawValue = window.sessionStorage.getItem(
      `${SCROLL_POSITION_PREFIX}${normalizePathname(pathname)}`,
    );
    const parsedValue = rawValue === null ? Number.NaN : Number(rawValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  } catch {
    return 0;
  }
}

export function clearExplicitAppScrollPosition(pathname: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      `${EXPLICIT_SCROLL_POSITION_PREFIX}${normalizePathname(pathname)}`,
    );
  } catch {
    // Scroll restoration is a progressive enhancement.
  }
}

export function saveAppScrollPosition(pathname: string, scrollTop: number) {
  if (typeof window === "undefined" || pathname.length === 0) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${SCROLL_POSITION_PREFIX}${normalizePathname(pathname)}`,
      String(Math.max(0, Math.round(scrollTop))),
    );
  } catch {
    // Scroll restoration is a progressive enhancement.
  }
}

export function saveCurrentAppScrollPosition(pathname: string) {
  const scrollRoot = getAppScrollRoot();
  if (!scrollRoot) {
    return;
  }

  const scrollTop = scrollRoot.scrollTop;
  saveAppScrollPosition(pathname, scrollRoot.scrollTop);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${EXPLICIT_SCROLL_POSITION_PREFIX}${normalizePathname(pathname)}`,
      String(Math.max(0, Math.round(scrollTop))),
    );
  } catch {
    // Scroll restoration is a progressive enhancement.
  }
}

export function requestAppScrollRestore(pathname: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      RESTORE_REQUEST_KEY,
      normalizePathname(pathname),
    );
  } catch {
    // Scroll restoration is a progressive enhancement.
  }
}

export function consumeAppScrollRestoreRequest(pathname: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const requestedPathname =
      window.sessionStorage.getItem(RESTORE_REQUEST_KEY);
    if (requestedPathname === null) {
      return false;
    }

    window.sessionStorage.removeItem(RESTORE_REQUEST_KEY);
    return requestedPathname === normalizePathname(pathname);
  } catch {
    return false;
  }
}

type RestoreAppScrollPositionOptions = {
  maxAttempts?: number;
  retryDelayMs?: number;
};

export function restoreAppScrollPosition(
  scrollTop: number,
  options: RestoreAppScrollPositionOptions = {},
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const targetScrollTop = Math.max(0, Math.round(scrollTop));
  const maxAttempts = options.maxAttempts ?? 80;
  const retryDelayMs = options.retryDelayMs ?? 50;
  let retryCount = 0;
  let timeoutId = 0;
  let animationFrameId = 0;
  let isCanceled = false;

  const restore = () => {
    if (isCanceled) {
      return;
    }

    const scrollRoot = getAppScrollRoot();
    if (!scrollRoot) {
      return;
    }

    scrollRoot.scrollTo({
      top: targetScrollTop,
      left: 0,
      behavior: "auto",
    });

    const hasReachedTarget =
      Math.abs(scrollRoot.scrollTop - targetScrollTop) <= 2;
    const canReachTarget =
      scrollRoot.scrollHeight - scrollRoot.clientHeight >= targetScrollTop - 2;

    if (
      targetScrollTop === 0 ||
      hasReachedTarget ||
      retryCount >= maxAttempts
    ) {
      return;
    }

    retryCount += 1;
    timeoutId = window.setTimeout(
      () => {
        animationFrameId = window.requestAnimationFrame(restore);
      },
      canReachTarget ? 16 : retryDelayMs,
    );
  };

  animationFrameId = window.requestAnimationFrame(restore);

  return () => {
    isCanceled = true;
    window.cancelAnimationFrame(animationFrameId);

    if (timeoutId !== 0) {
      window.clearTimeout(timeoutId);
    }
  };
}
