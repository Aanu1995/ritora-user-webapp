"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { UploadGuidanceCard } from "@/components/skin-journal/upload-guidance-card";
import { JournalPhotoUpload } from "@/components/skin-journal/journal-photo-upload";
import {
  DailyCheckInForm,
  checkInToPayload,
  type CheckInFormValue,
} from "@/components/skin-journal/daily-check-in-form";
import { resolveCanonicalTodayDate } from "@/components/skin-journal/journal-date";
import { useTodayEntry, useUpsertToday } from "@/hooks/use-skin-journal";
import type { Angle, UpsertEntryPayload } from "@/types/skin-journal";

type Step = "photo" | "checkin";

function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function JournalUploadPage() {
  const t = useTranslations("journal.upload");
  const router = useRouter();

  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoProcessingConsent, setPhotoProcessingConsent] = useState(false);
  const [angle, setAngle] = useState<Angle>("head_on");
  const [isPreRoutine, setIsPreRoutine] = useState(true);
  const [checkIn, setCheckIn] = useState<CheckInFormValue>({
    ratings: {},
  });
  const { data: todayPayload } = useTodayEntry();
  const date = resolveCanonicalTodayDate(todayPayload?.date, todayYmd());

  const upsertToday = useUpsertToday();
  const isPending = upsertToday.isPending;

  const handlePhotoChange = (nextPhoto: File | null) => {
    setPhoto(nextPhoto);
    setPhotoProcessingConsent(false);
  };

  const isPhotoProcessingBlocked = photo !== null && !photoProcessingConsent;

  const handleSave = (skipCheckIn: boolean) => {
    const baseUpload: UpsertEntryPayload = {
      angle,
      is_pre_routine: isPreRoutine,
      skip_check_in: skipCheckIn ? true : undefined,
      photo_processing_consent: photo ? photoProcessingConsent : undefined,
    };
    const payload: UpsertEntryPayload = skipCheckIn
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
        title={t("title")}
        subtitle={t("subtitle")}
        leading={<BackButton href={AppRoute.Journal} label={t("back")} />}
      />

      <div className="mx-auto mt-3 max-w-5xl space-y-4">
        {step === "photo" ? (
          <div>
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <UploadGuidanceCard layout="vertical" />
              <JournalPhotoUpload
                photo={photo}
                onPhotoChange={handlePhotoChange}
                angle={angle}
                onAngleChange={setAngle}
                isPreRoutine={isPreRoutine}
                onPreRoutineChange={setIsPreRoutine}
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
                  disabled={isPending || !photo || isPhotoProcessingBlocked}
                >
                  {isPending ? (
                    <LoadingIndicator size="sm" label={t("saving")} />
                  ) : (
                    t("savePhotoOnly")
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStep("checkin")}
                  disabled={isPending || isPhotoProcessingBlocked}
                >
                  {t("continueToCheckIn")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">{t("checkInTitle")}</p>
            <p className="mb-4 text-xs text-muted">
              {t("dateToday", { date })}
            </p>
            <DailyCheckInForm value={checkIn} onChange={setCheckIn} />

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
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={isPending || isPhotoProcessingBlocked}
                >
                  {isPending ? (
                    <LoadingIndicator size="sm" label={t("saving")} />
                  ) : (
                    t("skipCheckIn")
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={isPending || isPhotoProcessingBlocked}
                >
                  {isPending ? (
                    <LoadingIndicator size="sm" label={t("saving")} />
                  ) : (
                    t("saveEntry")
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
