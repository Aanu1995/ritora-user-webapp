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
 * callback; "Keep editing" runs `cancelLeave()`.
 */

type UnsavedChangesState = {
  hasUnsavedChanges: boolean;
  isDialogOpen: boolean;
  pendingProceed: (() => void) | null;
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

    setHasUnsavedChanges: (has) => {
      set({ hasUnsavedChanges: has });
    },

    requestLeave: (proceed) => {
      if (!get().hasUnsavedChanges) {
        proceed();
        return;
      }
      set({ pendingProceed: proceed, isDialogOpen: true });
    },

    confirmLeave: () => {
      const proceed = get().pendingProceed;
      set({ pendingProceed: null, isDialogOpen: false });
      proceed?.();
    },

    cancelLeave: () => {
      set({ pendingProceed: null, isDialogOpen: false });
    },

    setDialogOpen: (open) => {
      if (open) {
        set({ isDialogOpen: true });
      } else {
        // Closing via backdrop/Escape is equivalent to Cancel
        set({ pendingProceed: null, isDialogOpen: false });
      }
    },
  }),
);
