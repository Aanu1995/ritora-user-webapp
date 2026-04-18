'use client';

import { useTranslations } from 'next-intl';
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from '@/components/ui/confirm-dialog';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

/**
 * Global confirmation dialog that fires when the user attempts to leave a
 * page with unsaved changes. Mounted once at the app shell level; driven by
 * {@link useUnsavedChangesStore}. Every entry point that can navigate away
 * (sidebar links, mobile bottom nav, back arrows, browser back button) ends
 * up calling `requestLeave` on the store, which flips `isDialogOpen` to
 * true here.
 */
export function UnsavedChangesDialog() {
  const t = useTranslations('shelf.unsavedChanges');
  const isDialogOpen = useUnsavedChangesStore((state) => state.isDialogOpen);
  const confirmLeave = useUnsavedChangesStore((state) => state.confirmLeave);
  const setDialogOpen = useUnsavedChangesStore((state) => state.setDialogOpen);

  return (
    <ConfirmDialog
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
      title={t('title')}
      description={t('description')}
      confirmLabel={t('discard')}
      cancelLabel={t('keepEditing')}
      onConfirm={confirmLeave}
      tone={ConfirmDialogTone.Danger}
    />
  );
}
