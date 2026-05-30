"use client";

import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export function useCommunityModalUnsavedChanges(hasUnsavedChanges: boolean) {
  useUnsavedChangesGuard({ hasUnsavedChanges });
}
