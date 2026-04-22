'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SlotEditorFooterProps = {
  deleteLabel: string;
  formError?: string;
  hasChanges: boolean;
  isPending: boolean;
  onDeleteRequest: () => void;
  saveDisabled: boolean;
  saveLabel: string;
  savingLabel: string;
};

export function SlotEditorFooter({
  deleteLabel,
  formError,
  hasChanges,
  isPending,
  onDeleteRequest,
  saveDisabled,
  saveLabel,
  savingLabel,
}: SlotEditorFooterProps) {
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
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-danger/40 text-danger hover:border-danger hover:bg-danger/10 hover:text-danger"
          onClick={onDeleteRequest}
          disabled={isPending}
        >
          <Trash2 className="mr-1 h-4 w-4" aria-hidden />
          {deleteLabel}
        </Button>
        <Button
          type="submit"
          className={cn('flex-1', !hasChanges && 'opacity-50')}
          disabled={saveDisabled}
        >
          {isPending ? savingLabel : saveLabel}
        </Button>
      </div>
    </footer>
  );
}
