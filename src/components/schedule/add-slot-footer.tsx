'use client';

import { Button } from '@/components/ui/button';

type AddSlotFooterProps = {
  canSubmit: boolean;
  duplicateNote: string;
  formError?: string;
  isPending: boolean;
  savingLabel: string;
  submitLabel: string;
};

export function AddSlotFooter({
  canSubmit,
  duplicateNote,
  formError,
  isPending,
  savingLabel,
  submitLabel,
}: AddSlotFooterProps) {
  return (
    <footer className="border-t border-border bg-surface px-5 py-4">
      {formError ? (
        <div
          className="mb-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3"
          role="alert"
        >
          <p className="text-sm text-danger">{formError}</p>
        </div>
      ) : null}
      <Button className="w-full" type="submit" disabled={!canSubmit || isPending}>
        {isPending ? savingLabel : submitLabel}
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted">{duplicateNote}</p>
    </footer>
  );
}
