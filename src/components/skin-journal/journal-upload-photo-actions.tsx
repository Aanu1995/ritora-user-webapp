"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

type JournalUploadPhotoActionsProps = {
  canContinueToCheckIn: boolean;
  canSavePhotoStep: boolean;
  hasSideAfterSave: boolean;
  isEditMode: boolean;
  isPending: boolean;
  isPhotoCapabilityBlocked: boolean;
  isPhotoProcessingBlocked: boolean;
  isPhotoSetInvalid: boolean;
  onContinue: () => void;
  onSavePhotoOnly: () => void;
};

export function JournalUploadPhotoActions({
  canContinueToCheckIn,
  canSavePhotoStep,
  hasSideAfterSave,
  isEditMode,
  isPending,
  isPhotoCapabilityBlocked,
  isPhotoProcessingBlocked,
  isPhotoSetInvalid,
  onContinue,
  onSavePhotoOnly,
}: JournalUploadPhotoActionsProps) {
  const t = useTranslations("journal.upload");
  const actionsDisabled =
    isPending ||
    isPhotoProcessingBlocked ||
    isPhotoCapabilityBlocked ||
    isPhotoSetInvalid;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <p className="text-sm text-muted">
        {isPhotoSetInvalid
          ? t(hasSideAfterSave ? "frontRequiredWithSides" : "frontRequired")
          : t("nextStepHint")}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onSavePhotoOnly}
          disabled={actionsDisabled || !canSavePhotoStep}
        >
          {isPending ? (
            <LoadingIndicator size="sm" label={t("saving")} />
          ) : (
            t(isEditMode ? "saveChanges" : "savePhotoOnly")
          )}
        </Button>
        <Button
          size="sm"
          onClick={onContinue}
          disabled={actionsDisabled || !canContinueToCheckIn}
        >
          {t("continueToCheckIn")}
        </Button>
      </div>
    </div>
  );
}
