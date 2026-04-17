'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

/**
 * Page-side guard for unsaved-changes protection.
 *
 * The form page calls this hook with its current "is dirty" flag. The hook:
 *
 * 1. Syncs the flag into the global {@link useUnsavedChangesStore} so that
 *    nav elements anywhere in the app (sidebar, mobile nav, back arrow) can
 *    consult it when deciding whether to intercept a click.
 * 2. Attaches a `beforeunload` listener while dirty so the browser shows its
 *    native warning on tab close, reload, or URL-bar navigation.
 * 3. Pushes a sentinel history entry on first dirty mount and listens for
 *    `popstate` so the browser back button opens the in-app dialog rather
 *    than silently discarding edits. On confirm, the hook walks back past
 *    both its sentinel and the form entry so the user reaches the page they
 *    were trying to get to.
 * 4. Exposes `releaseGuard()` — callers invoke this right before a
 *    programmatic `router.push` on save so the sentinel is popped cleanly
 *    and no orphan entry is left in the history stack.
 *
 * The dialog itself is rendered once at the app shell level, driven by the
 * store; it doesn't live inside this hook's caller.
 */

type Options = { hasUnsavedChanges: boolean };

const GUARD_MARKER = '__ritoraUnsavedGuard';

type GuardState = { [GUARD_MARKER]?: true } | null;

function isGuardState(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;
  return (state as GuardState)?.[GUARD_MARKER] === true;
}

export type UnsavedChangesGuard = {
  releaseGuard: () => void;
};

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
}: Options): UnsavedChangesGuard {
  const setStoreDirty = useUnsavedChangesStore(
    (state) => state.setHasUnsavedChanges,
  );
  const cancelPendingLeave = useUnsavedChangesStore(
    (state) => state.cancelLeave,
  );
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  const isReleasingRef = useRef(false);

  // Keep a ref in sync so event-handler closures read the latest flag
  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Publish dirty flag to the global store so nav elements can consult it,
  // and clear it on unmount so a navigation away resets the guard.
  useEffect(() => {
    setStoreDirty(hasUnsavedChanges);
    return () => {
      setStoreDirty(false);
    };
  }, [hasUnsavedChanges, setStoreDirty]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      cancelPendingLeave();
    }
  }, [cancelPendingLeave, hasUnsavedChanges]);

  // beforeunload — native browser warning on tab close / reload / URL-bar change
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // returnValue is required for Chrome/Firefox to trigger the native dialog
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [hasUnsavedChanges]);

  // popstate + sentinel — intercept browser back button
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (typeof window === 'undefined') return;

    const sentinelUrl = window.location.href;

    // Push a sentinel so the next browser-back consumes this entry and fires
    // popstate without the page actually unmounting.
    window.history.pushState({ [GUARD_MARKER]: true }, '', sentinelUrl);

    const handler = () => {
      if (isReleasingRef.current) return;
      if (!hasUnsavedRef.current) return;

      // The sentinel was just consumed. Re-push it so we stay put, then ask
      // the store to open the dialog. On confirm, `history.go(-2)` skips
      // both the re-pushed sentinel and the form entry below it.
      window.history.pushState({ [GUARD_MARKER]: true }, '', sentinelUrl);
      useUnsavedChangesStore.getState().requestLeave(() => {
        isReleasingRef.current = true;
        window.history.go(-2);
        setTimeout(() => {
          isReleasingRef.current = false;
        }, 0);
      });
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
      // If the sentinel is still on top and we're still at the same URL, pop
      // it so the history stack stays tidy. Skipped when the form already
      // navigated away (e.g., after a successful save via router.push).
      if (
        window.location.href === sentinelUrl &&
        isGuardState(window.history.state)
      ) {
        isReleasingRef.current = true;
        window.history.back();
        setTimeout(() => {
          isReleasingRef.current = false;
        }, 0);
      }
    };
  }, [hasUnsavedChanges]);

  const releaseGuard = useCallback(() => {
    // Caller is about to navigate intentionally (e.g., after save). Pop the
    // sentinel now so the history stack has no orphan entry after the push.
    if (typeof window === 'undefined') return;
    if (!isGuardState(window.history.state)) return;
    isReleasingRef.current = true;
    window.history.back();
    setTimeout(() => {
      isReleasingRef.current = false;
    }, 0);
  }, []);

  return { releaseGuard };
}
