"use client";

import { useTranslations } from "next-intl";
import type { CheckInValidationResult } from "./daily-check-in-validation";

interface JournalCheckInValidationAlertProps {
  validation: CheckInValidationResult;
}

export function JournalCheckInValidationAlert({
  validation,
}: JournalCheckInValidationAlertProps) {
  const t = useTranslations("journal.upload");
  const tReaction = useTranslations("journal.upload.reactionReport");
  const showReactionSymptoms = validation.missing.includes(
    "reaction_report_symptoms",
  );
  const showRequiredCheckIn = validation.missing.some(
    (field) => field !== "reaction_report_symptoms",
  );

  return (
    <div
      role="alert"
      className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm leading-relaxed text-danger"
    >
      <p className="font-semibold">{t("validationTitle")}</p>
      {showRequiredCheckIn ? (
        <p className="mt-1 text-xs text-danger/85">{t("validationBody")}</p>
      ) : null}
      {showReactionSymptoms ? (
        <p className="mt-1 text-xs text-danger/85">
          {tReaction("validationSymptoms")}
        </p>
      ) : null}
    </div>
  );
}
