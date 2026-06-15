"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { JournalSimplificationSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import { SimplificationSnapshotSummary } from "@/components/skin-journal/simplification-snapshot-summary";
import {
  useAcknowledgeSimplification,
  useSimplification,
} from "@/hooks/use-skin-journal";
import { requestAppScrollRestore } from "@/lib/app-scroll-restoration";

export default function SimplificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("journal.simplification.detail");
  const tSimplification = useTranslations("journal.simplification");
  const tDayDetail = useTranslations("journal.dayDetail");
  const tSymptoms = useTranslations("journal.upload.reactionReport.symptoms");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading } = useSimplification(id);
  const acknowledge = useAcknowledgeSimplification();

  if (isLoading) {
    return <JournalSimplificationSkeleton />;
  }

  const startedAtRaw = data?.started_at?.slice(0, 10) ?? "";
  const endedAtRaw = data?.ended_at?.slice(0, 10) ?? "";
  const startedAt = formatJournalShortDate(startedAtRaw, locale);
  const endedAt = formatJournalShortDate(endedAtRaw, locale);
  const isOngoing = !data?.ended_at;
  const triggerDate = startedAt;
  const noticedSummary = data?.reason?.trim() || t("noticedFallback");
  const recoveryPhase = data?.recovery_phase ?? "stabilize";
  const triggerSource = data?.recovery_trigger_source ?? "unknown";
  const triggerSymptoms = data?.recovery_trigger_symptoms ?? [];
  const reviewAfter = data?.recovery_review_after
    ? formatJournalShortDate(data.recovery_review_after.slice(0, 10), locale)
    : null;
  const exitEligibleAt = data?.recovery_exit_eligible_at
    ? formatJournalShortDate(data.recovery_exit_eligible_at.slice(0, 10), locale)
    : null;
  const hasScheduleSnapshot =
    data?.original_schedule_snapshot !== null &&
    data?.original_schedule_snapshot !== undefined;

  return (
    <div>
      <PageHeader
        title={t("title", {
          start: startedAt,
          endLabel: isOngoing ? t("ongoing") : endedAt,
        })}
        subtitle={t("subtitle", { date: triggerDate })}
        leading={
          <BackButton
            href={AppRoute.Journal}
            label={tDayDetail("backToJournal")}
          />
        }
        action={
          isOngoing ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={acknowledge.isPending || !data}
                onClick={() => {
                  if (data) {
                    acknowledge.mutate(data.id, {
                      onSuccess: () => {
                        requestAppScrollRestore(AppRoute.Journal);
                        router.push(AppRoute.Journal);
                      },
                    });
                  }
                }}
              >
                {acknowledge.isPending ? (
                  <LoadingIndicator
                    size="sm"
                    label={tSimplification("restoreRoutine")}
                  />
                ) : (
                  tSimplification("restoreRoutine")
                )}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="mx-auto w-full lg:w-3/4">
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">{t("noticedTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {noticedSummary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
                {t(`phase.${recoveryPhase}`)}
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted">
                {t(`source.${triggerSource}`)}
              </span>
              {data?.recovery_active_overuse ? (
                <span className="rounded-full bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger">
                  {t("activeOveruse")}
                </span>
              ) : null}
            </div>
            {triggerSymptoms.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-muted">
                  {t("symptomsTitle")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {triggerSymptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="rounded-full border border-danger/30 bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger"
                    >
                      {tSymptoms(symptom)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">{t("presetTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {t("presetSubtitle")}
            </p>
            <div className="mt-2 space-y-2">
              <div className="rounded-xl border border-border bg-surface-muted p-3 text-sm">
                <strong>{t("presetAm")}:</strong> {t("presetAmBody")}
              </div>
              <div className="rounded-xl border border-border bg-surface-muted p-3 text-sm">
                <strong>{t("presetPm")}:</strong> {t("presetPmBody")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">{t("exitTitle")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-muted/50">
              <li>{t("exitNoRedFlags")}</li>
              <li>{t("exitSymptomsSettled")}</li>
              <li>{t("exitNoNewActives")}</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              {reviewAfter ? (
                <span className="rounded-full bg-surface-muted px-2.5 py-1">
                  {t("reviewAfter", { date: reviewAfter })}
                </span>
              ) : null}
              {exitEligibleAt ? (
                <span className="rounded-full bg-surface-muted px-2.5 py-1">
                  {t("exitEligible", { date: exitEligibleAt })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold">{t("returnTitle")}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted marker:font-semibold marker:text-accent-strong">
              <li>{t("returnBarrierOnly")}</li>
              <li>{t("returnOneActive")}</li>
              <li>{t("returnBuildFrequency")}</li>
            </ol>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-sm font-semibold">{t("pausedTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("pausedSubtitle", { date: triggerDate })}
          </p>
          {hasScheduleSnapshot ? (
            <SimplificationSnapshotSummary
              snapshot={data.original_schedule_snapshot}
            />
          ) : (
            <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3 text-sm text-muted">
              {t("noSnapshot")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
