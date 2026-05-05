"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { UploadGuidanceCard } from "@/components/skin-journal/upload-guidance-card";
import { JournalPhotoUpload } from "@/components/skin-journal/journal-photo-upload";
import {
  DailyCheckInForm,
  checkInToPayload,
  validateCheckInForSave,
  type CheckInFormValue,
} from "@/components/skin-journal/daily-check-in-form";
import { resolveCanonicalTodayDate } from "@/components/skin-journal/journal-date";
import { JournalUploadMode } from "@/components/skin-journal/journal-navigation";
import {
  useDeleteEntry,
  useTodayEntry,
  useUpsertToday,
} from "@/hooks/use-skin-journal";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import type { JournalEntry, UpsertEntryPayload } from "@/types/skin-journal";

type Step = "photo" | "checkin";

const EMPTY_CHECK_IN: CheckInFormValue = { ratings: {} };

function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function entryToCheckIn(entry: JournalEntry): CheckInFormValue {
  return {
    ratings: entry.ratings ?? {},
    overall_feel: entry.overall_feel ?? undefined,
    sleep_band: entry.sleep_band ?? undefined,
    stress_today: entry.stress_today ?? undefined,
    sun_exposure_today: entry.sun_exposure_today ?? undefined,
    sweat_exercise_today: entry.sweat_exercise_today ?? undefined,
    cycle_marker: entry.cycle_marker ?? undefined,
    recent_change: entry.recent_change ?? null,
    complaint_note: entry.complaint_note ?? null,
  };
}

export default function JournalUploadPage() {
  const t = useTranslations("journal.upload");
  const tDelete = useTranslations("journal.deleteConfirm");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("photo");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoProcessingConsent, setPhotoProcessingConsent] = useState(false);
  const [isPreRoutineDraft, setIsPreRoutineDraft] = useState<boolean | null>(
    null,
  );
  const [checkInDraft, setCheckInDraft] =
    useState<CheckInFormValue | null>(null);
  const [checkInValidationAttempted, setCheckInValidationAttempted] =
    useState(false);
  const { data: todayPayload } = useTodayEntry();
  const { data: skinProfile } = useSkinProfile();
  const showCycleQuestion = skinProfile?.sexAtBirth === "female";
  const entry = todayPayload?.entry ?? null;
  const date = resolveCanonicalTodayDate(todayPayload?.date, todayYmd());
  const requestedMode = searchParams.get("mode");
  const isRequestedEditMode = requestedMode === JournalUploadMode.Edit;
  const isEditMode =
    isRequestedEditMode && (todayPayload === undefined || entry !== null);
  const editableEntry = isRequestedEditMode ? entry : null;

  const upsertToday = useUpsertToday();
  const deleteEntry = useDeleteEntry();
  const isPending = upsertToday.isPending;
  const isDeleting = deleteEntry.isPending;
  const isPreRoutine =
    isPreRoutineDraft ?? editableEntry?.is_pre_routine ?? true;
  const checkIn =
    checkInDraft ??
    (editableEntry ? entryToCheckIn(editableEntry) : EMPTY_CHECK_IN);
  const checkInValidation = validateCheckInForSave(checkIn, {
    requireCycleMarker: showCycleQuestion,
  });
  const shouldShowCheckInValidation =
    checkInValidationAttempted && !checkInValidation.valid;

  const handlePhotoChange = (nextPhoto: File | null) => {
    setPhoto(nextPhoto);
    setPhotoProcessingConsent(false);
  };

  const handleCheckInChange = (nextCheckIn: CheckInFormValue) => {
    setCheckInDraft(nextCheckIn);
    if (
      checkInValidationAttempted &&
      validateCheckInForSave(nextCheckIn, {
        requireCycleMarker: showCycleQuestion,
      }).valid
    ) {
      setCheckInValidationAttempted(false);
    }
  };

  const isPhotoProcessingBlocked = photo !== null && !photoProcessingConsent;
  const canSavePhotoStep = isEditMode
    ? Boolean(editableEntry || photo)
    : Boolean(photo);
  const canContinueToCheckIn = isEditMode
    ? Boolean(editableEntry || photo)
    : true;

  const handleSave = (savePhotoOnly: boolean) => {
    if (savePhotoOnly && !canSavePhotoStep) {
      return;
    }
    if (isPhotoProcessingBlocked) {
      return;
    }
    if (!savePhotoOnly) {
      const nextValidation = validateCheckInForSave(checkIn, {
        requireCycleMarker: showCycleQuestion,
      });
      if (!nextValidation.valid) {
        setCheckInValidationAttempted(true);
        return;
      }
    }

    const baseUpload: UpsertEntryPayload = {
      is_pre_routine: isPreRoutine,
      skip_check_in: savePhotoOnly ? true : undefined,
      photo_processing_consent: photo ? photoProcessingConsent : undefined,
    };
    const payload: UpsertEntryPayload = savePhotoOnly
      ? baseUpload
      : { ...baseUpload, ...checkInToPayload(checkIn) };

    upsertToday.mutate(
      { payload, photo },
      { onSuccess: () => router.push(AppRoute.Journal) },
    );
  };

  return (
    <div>
      <PageHeader
        title={isEditMode ? t("editTitle") : t("title")}
        subtitle={isEditMode ? t("editSubtitle") : t("subtitle")}
        leading={<BackButton href={AppRoute.Journal} label={t("back")} />}
        action={
          editableEntry ? (
            <Button
              size="sm"
              variant="ghost"
              aria-label={t("deleteToday")}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="w-7 px-0 text-danger hover:bg-danger/5 sm:w-auto sm:px-4"
            >
              {isDeleting ? (
                <LoadingIndicator size="sm" label={t("deleting")} />
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("deleteToday")}</span>
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto mt-3 max-w-5xl space-y-4">
        {step === "photo" ? (
          <div>
            <div className="grid grid-cols-1 gap-16 lg:mx-auto lg:w-fit lg:grid-cols-[440px_420px]">
              <UploadGuidanceCard layout="vertical" />
              <JournalPhotoUpload
                photo={photo}
                existingPhotoUrl={editableEntry?.photo_url}
                existingPhotoAlt={t("currentPhotoAlt", { date })}
                onPhotoChange={handlePhotoChange}
                isPreRoutine={isPreRoutine}
                onPreRoutineChange={setIsPreRoutineDraft}
                photoProcessingConsent={photoProcessingConsent}
                onPhotoProcessingConsentChange={setPhotoProcessingConsent}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {t("nextStepHint")}
              </p>
              <div className="grid grid-cols-1 gap-2 [&>*]:w-full sm:flex sm:flex-wrap [&>*]:sm:w-auto">
                <Button size="sm" variant="ghost" onClick={() => router.back()}>
                  {t("cancel")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={
                    isPending || !canSavePhotoStep || isPhotoProcessingBlocked
                  }
                >
                  {isPending ? (
                    <LoadingIndicator size="sm" label={t("saving")} />
                  ) : (
                    t(isEditMode ? "saveChanges" : "savePhotoOnly")
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStep("checkin")}
                  disabled={
                    isPending || !canContinueToCheckIn || isPhotoProcessingBlocked
                  }
                >
                  {t("continueToCheckIn")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">
              {t(isEditMode ? "editCheckInTitle" : "checkInTitle")}
            </p>
            <p className="mb-4 text-xs text-muted">
              {t("dateToday", { date })}
            </p>
            <DailyCheckInForm
              key={editableEntry?.id ?? "new-entry"}
              value={checkIn}
              onChange={handleCheckInChange}
              showCycle={showCycleQuestion}
            />

            {shouldShowCheckInValidation ? (
              <div
                role="alert"
                className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm leading-relaxed text-danger"
              >
                <p className="font-semibold">{t("validationTitle")}</p>
                <p className="mt-1 text-xs text-danger/85">
                  {t("validationBody")}
                </p>
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl border border-border bg-surface-muted p-3 text-xs leading-[1.6] text-muted">
              <strong className="font-semibold text-foreground">
                {t("privacyLabel")}:
              </strong>{" "}
              {t("privacyBody")}{" "}
              <a
                href={t("privacyLinkHref")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent-strong underline underline-offset-2"
              >
                {t("privacyLink")}
              </a>
              .
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStep("photo")}
                className="w-full justify-center sm:w-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("back")}
              </Button>
              <div className="grid grid-cols-1 gap-2 [&>*]:w-full sm:flex sm:flex-wrap [&>*]:sm:w-auto">
                <Button
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={isPending || isPhotoProcessingBlocked}
                >
                  {isPending ? (
                    <LoadingIndicator size="sm" label={t("saving")} />
                  ) : (
                    t(isEditMode ? "saveChanges" : "saveEntry")
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div
              aria-hidden
              className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--danger-soft)] text-danger"
            >
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="mt-2 font-display text-lg font-bold">
              {tDelete("title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted">
              {tDelete("body")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tDelete("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                disabled={isDeleting || !editableEntry}
                onClick={() => {
                  if (!editableEntry) {
                    return;
                  }

                  deleteEntry.mutate(editableEntry.id, {
                    onSuccess: () => router.push(AppRoute.Journal),
                  });
                }}
                className="rounded-full bg-danger text-white shadow-soft hover:bg-danger/90 focus-visible:ring-danger/40"
              >
                {isDeleting ? (
                  <LoadingIndicator size="sm" label={t("deleting")} />
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    {tDelete("confirm")}
                  </>
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
