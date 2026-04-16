"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepActionsProps {
  step: number;
  totalSteps: number;
  canContinue: boolean;
  isSubmitting: boolean;
  isOptionalStep?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  onCancel?: () => void;
}

export function StepActions({
  step,
  totalSteps,
  canContinue,
  isSubmitting,
  isOptionalStep = false,
  onBack,
  onContinue,
  onSkip,
  onCancel,
}: StepActionsProps) {
  const t = useTranslations("skinProfile");
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;
  const isEditMode = Boolean(onCancel);
  const showSaveLabel = isEditMode || isLastStep;

  return (
    <div className="flex items-center justify-between pt-8">
      <div className="flex items-center gap-2">
        {isEditMode ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t("steps.cancel")}
          </Button>
        ) : !isFirstStep ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("steps.back")}
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {isOptionalStep && onSkip && !isEditMode ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            {t("steps.skip")}
          </Button>
        ) : null}

        <Button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {showSaveLabel
            ? isSubmitting
              ? t("steps.saving")
              : t("steps.save")
            : t("steps.continue")}
          {!showSaveLabel && !isSubmitting ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}
