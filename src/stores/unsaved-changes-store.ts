'use client';

import { create } from 'zustand';

/**
 * Global store for the "unsaved changes" guard.
 *
 * Form pages set `hasUnsavedChanges` via `useUnsavedChangesGuard`. Any
 * navigation element (sidebar, mobile nav, form back-arrow, etc.) that could
 * take the user away from the current page reads `hasUnsavedChanges` and
 * delegates its onClick to `requestLeave(proceed)` when the flag is true —
 * the store stashes the pending navigation and opens the dialog. When the
 * user confirms "Discard changes", `confirmLeave()` flushes the stashed
 * callback; "Keep editing" runs `cancelLeave()`. On touch devices we also
 * suppress immediate re-entry for a short window so the same tap cannot
 * close the dialog and instantly reopen it via the underlying control.
 */

const LEAVE_REQUEST_SUPPRESSION_MS = 300;

type UnsavedChangesState = {
  hasUnsavedChanges: boolean;
  isDialogOpen: boolean;
  pendingProceed: (() => void) | null;
  suppressRequestLeaveUntil: number;
  setHasUnsavedChanges: (has: boolean) => void;
  requestLeave: (proceed: () => void) => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
  setDialogOpen: (open: boolean) => void;
};

export const useUnsavedChangesStore = create<UnsavedChangesState>(
  (set, get) => ({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
    suppressRequestLeaveUntil: 0,

    setHasUnsavedChanges: (has) => {
      set((state) => ({
        hasUnsavedChanges: has,
        suppressRequestLeaveUntil: has ? state.suppressRequestLeaveUntil : 0,
      }));
    },

    requestLeave: (proceed) => {
      if (!get().hasUnsavedChanges) {
        proceed();
        return;
      }

      if (Date.now() < get().suppressRequestLeaveUntil) {
        return;
      }

      set({
        pendingProceed: proceed,
        isDialogOpen: true,
        suppressRequestLeaveUntil: 0,
      });
    },

    confirmLeave: () => {
      const proceed = get().pendingProceed;
      set({
        pendingProceed: null,
        isDialogOpen: false,
        suppressRequestLeaveUntil: 0,
      });
      proceed?.();
    },

    cancelLeave: () => {
      set({
        pendingProceed: null,
        isDialogOpen: false,
        suppressRequestLeaveUntil:
          Date.now() + LEAVE_REQUEST_SUPPRESSION_MS,
      });
    },

    setDialogOpen: (open) => {
      if (open) {
        set({ isDialogOpen: true, suppressRequestLeaveUntil: 0 });
      } else {
        // Closing via backdrop/Escape is equivalent to Cancel
        set({
          pendingProceed: null,
          isDialogOpen: false,
          suppressRequestLeaveUntil:
            Date.now() + LEAVE_REQUEST_SUPPRESSION_MS,
        });
      }
    },
  }),
);
