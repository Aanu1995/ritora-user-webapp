"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { readSubmissionErrorMessage } from "@/lib/form-submission";
import { InlineSpinner } from "./community-shared";

type SubmitControlsProps = {
  busy: boolean;
  canSubmit: boolean;
  confirmBody: string;
  confirmLabel: string;
  confirmOpen: boolean;
  confirmTitle: string;
  cancelLabel: string;
  needsConfirm: boolean;
  onConfirm: () => void;
  onConfirmOpenChange: (open: boolean) => void;
  submitLabel: string;
  submittingLabel: string;
};

export function CommunityPlaybookSubmitControls({
  busy,
  canSubmit,
  cancelLabel,
  confirmBody,
  confirmLabel,
  confirmOpen,
  confirmTitle,
  needsConfirm,
  onConfirm,
  onConfirmOpenChange,
  submitLabel,
  submittingLabel,
}: SubmitControlsProps) {
  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" type="submit" disabled={!canSubmit || busy}>
          {busy ? <InlineSpinner /> : <ShieldCheck className="h-4 w-4" />}
          {busy ? submittingLabel : submitLabel}
        </Button>
      </div>
      {needsConfirm ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={onConfirmOpenChange}
          title={confirmTitle}
          description={confirmBody}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          onConfirm={onConfirm}
          isPending={busy}
          tone={ConfirmDialogTone.Warning}
        />
      ) : null}
    </>
  );
}

export function CommunityPlaybookSubmitError({
  submitError,
}: {
  submitError: unknown;
}) {
  const message = readSubmissionErrorMessage(submitError);

  return message ? (
    <p
      className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
      role="alert"
    >
      {message}
    </p>
  ) : null;
}
