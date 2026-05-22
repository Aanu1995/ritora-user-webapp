"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { UploadGuidanceCard } from "@/components/skin-journal/upload-guidance-card";
import { JournalPhotoUpload } from "@/components/skin-journal/journal-photo-upload";
import { JournalDeleteTodayDialog } from "@/components/skin-journal/journal-delete-today-dialog";
import { JournalUploadSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import { JournalUploadPhotoActions } from "@/components/skin-journal/journal-upload-photo-actions";
import {
  EMPTY_CHECK_IN,
  entryPhotosForUpload,
  entryToCheckIn,
  todayYmd,
} from "@/components/skin-journal/journal-upload-state";
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
import { useJournalCapabilityFlags } from "@/components/skin-journal/use-journal-capability-flags";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CYCLE_MARKER_DONT_TRACK,
  FRONT_PHOTO_ANGLE,
  PHOTO_ANGLES,
  type Angle,
  type UpsertEntryPayload,
} from "@/types/skin-journal";

type Step = "photo" | "checkin";

export default function JournalUploadPage() {
  const t = useTranslations("journal.upload");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("photo");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photos, setPhotos] = useState<Partial<Record<Angle, File>>>({});
  const [removedPhotoAngles, setRemovedPhotoAngles] = useState<Angle[]>([]);
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
  const { photoActionsDisabled } = useJournalCapabilityFlags();
  const showCycleQuestion = skinProfile?.sexAtBirth === "female";
  const entry = todayPayload?.entry ?? null;
  const date = resolveCanonicalTodayDate(todayPayload?.date, todayYmd());
  const requestedMode = searchParams.get("mode");
  const isRequestedEditMode = requestedMode === JournalUploadMode.Edit;
  const isEditEntryLoading =
    isRequestedEditMode && todayPayload === undefined;
  const isEditMode = isRequestedEditMode && entry !== null;
  const editableEntry = isRequestedEditMode ? entry : null;

  const upsertToday = useUpsertToday();
  const deleteEntry = useDeleteEntry();
  const isPending = upsertToday.isPending;
  const isDeleting = deleteEntry.isPending;

  if (isEditEntryLoading) {
    return <JournalUploadSkeleton />;
  }

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

  const existingPhotos = entryPhotosForUpload(editableEntry);
  const existingAngles = new Set(existingPhotos.map((item) => item.angle));
  const removedAngles = new Set(removedPhotoAngles);
  const hasNewPhotos = Object.values(photos).some(Boolean);
  const hasAnyPhotoChange = hasNewPhotos || removedPhotoAngles.length > 0;
  const hasFrontAfterSave =
    Boolean(photos[FRONT_PHOTO_ANGLE]) ||
    (existingAngles.has(FRONT_PHOTO_ANGLE) &&
      !removedAngles.has(FRONT_PHOTO_ANGLE));
  const hasAnyPhotoAfterSave = PHOTO_ANGLES.some(
    (angle) =>
      Boolean(photos[angle]) ||
      (existingAngles.has(angle) && !removedAngles.has(angle)),
  );
  const hasSideAfterSave = PHOTO_ANGLES.some(
    (angle) =>
      angle !== FRONT_PHOTO_ANGLE &&
      (Boolean(photos[angle]) ||
        (existingAngles.has(angle) && !removedAngles.has(angle))),
  );
  const isPhotoSetInvalid = hasAnyPhotoAfterSave && !hasFrontAfterSave;

  const handlePhotoChange = (angle: Angle, nextPhoto: File | null) => {
    setPhotos((current) => {
      const next = { ...current };
      if (nextPhoto) {
        next[angle] = nextPhoto;
      } else {
        delete next[angle];
      }
      return next;
    });
    setRemovedPhotoAngles((current) =>
      current.filter((item) => item !== angle),
    );
    setPhotoProcessingConsent(false);
  };

  const handleRemoveExistingPhoto = (angle: Angle) => {
    setPhotos((current) => {
      const next = { ...current };
      delete next[angle];
      return next;
    });
    setRemovedPhotoAngles((current) =>
      current.includes(angle) ? current : [...current, angle],
    );
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

  const isPhotoProcessingBlocked = hasNewPhotos && !photoProcessingConsent;
  const isPhotoCapabilityBlocked = hasNewPhotos && photoActionsDisabled;
  const canSavePhotoStep = isEditMode
    ? Boolean(editableEntry && (hasAnyPhotoAfterSave || hasAnyPhotoChange))
    : hasFrontAfterSave;
  const canContinueToCheckIn = isEditMode
    ? Boolean(editableEntry || hasAnyPhotoAfterSave)
    : true;

  const handleSave = (savePhotoOnly: boolean) => {
    if (savePhotoOnly && !canSavePhotoStep) {
      return;
    }
    if (isPhotoSetInvalid) {
      return;
    }
    if (isPhotoProcessingBlocked) {
      return;
    }
    if (isPhotoCapabilityBlocked) {
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
      photo_processing_consent: hasNewPhotos
        ? photoProcessingConsent
        : undefined,
      remove_photo_angles:
        removedPhotoAngles.length > 0 ? removedPhotoAngles : undefined,
    };
    const payload: UpsertEntryPayload = savePhotoOnly
      ? baseUpload
      : {
          ...baseUpload,
          ...checkInToPayload(checkIn, {
            cycleMarkerFallback: showCycleQuestion
              ? undefined
              : CYCLE_MARKER_DONT_TRACK,
          }),
        };

    const mutationInput = hasNewPhotos
      ? { payload, photos }
      : { payload };

    upsertToday.mutate(mutationInput, {
      onSuccess: () => router.push(AppRoute.Journal),
      onError: (error) => {
        toast.error(getApiErrorMessage(error) ?? t("saveFailed"));
      },
    });
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
            <div className="space-y-6">
              <UploadGuidanceCard layout="horizontal" />
              <JournalPhotoUpload
                photos={photos}
                existingPhotos={existingPhotos}
                removedPhotoAngles={removedPhotoAngles}
                existingPhotoAlt={t("currentPhotoAlt", { date })}
                onPhotoAngleChange={handlePhotoChange}
                onRemoveExistingAngle={handleRemoveExistingPhoto}
                isPreRoutine={isPreRoutine}
                onPreRoutineChange={setIsPreRoutineDraft}
                photoProcessingConsent={photoProcessingConsent}
                onPhotoProcessingConsentChange={setPhotoProcessingConsent}
                disabled={photoActionsDisabled}
              />
            </div>

            <JournalUploadPhotoActions
              canContinueToCheckIn={canContinueToCheckIn}
              canSavePhotoStep={canSavePhotoStep}
              hasSideAfterSave={hasSideAfterSave}
              isEditMode={isEditMode}
              isPending={isPending}
              isPhotoCapabilityBlocked={isPhotoCapabilityBlocked}
              isPhotoProcessingBlocked={isPhotoProcessingBlocked}
              isPhotoSetInvalid={isPhotoSetInvalid}
              onContinue={() => setStep("checkin")}
              onSavePhotoOnly={() => handleSave(true)}
            />
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
                  disabled={
                    isPending ||
                    isPhotoProcessingBlocked ||
                    isPhotoCapabilityBlocked ||
                    isPhotoSetInvalid
                  }
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

      <JournalDeleteTodayDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entry={editableEntry}
        isDeleting={isDeleting}
        onConfirm={(entryToDelete) => {
          deleteEntry.mutate(entryToDelete.id, {
            onSuccess: () => router.push(AppRoute.Journal),
          });
        }}
      />
    </div>
  );
}
