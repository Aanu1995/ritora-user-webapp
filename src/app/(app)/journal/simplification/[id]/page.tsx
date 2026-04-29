"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { JournalSimplificationSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import {
  useAcknowledgeSimplification,
  useSimplification,
} from "@/hooks/use-skin-journal";

export default function SimplificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("journal.simplification.detail");
  const tSimplification = useTranslations("journal.simplification");
  const tDayDetail = useTranslations("journal.dayDetail");
  const router = useRouter();
  const { data, isLoading } = useSimplification(id);
  const acknowledge = useAcknowledgeSimplification();

  if (isLoading) {
    return <JournalSimplificationSkeleton />;
  }

  const startedAt = data?.started_at?.slice(0, 10) ?? "";
  const isOngoing = !data?.ended_at;
  const triggerDate = startedAt;
  const noticedSummary = data?.reason?.trim() || t("noticedFallback");
  const hasScheduleSnapshot =
    data?.original_schedule_snapshot !== null &&
    data?.original_schedule_snapshot !== undefined;

  return (
    <div>
      <PageHeader
        title={t("title", {
          start: startedAt,
          endLabel: isOngoing ? t("ongoing") : data?.ended_at?.slice(0, 10) ?? "",
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
                      onSuccess: () => router.push(AppRoute.Journal),
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

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-sm font-semibold">{t("noticedTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {noticedSummary}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-sm font-semibold">{t("presetTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t("presetSubtitle")}
          </p>
          <div className="mt-2 space-y-2">
            <div className="rounded-xl border border-border bg-surface-muted p-3 text-xs">
              <strong>{t("presetAm")}:</strong> {t("presetAmBody")}
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-3 text-xs">
              <strong>{t("presetPm")}:</strong> {t("presetPmBody")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <p className="text-sm font-semibold">{t("pausedTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {t("pausedSubtitle", { date: triggerDate })}
        </p>
        {hasScheduleSnapshot ? (
          <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-surface-muted p-3 text-[11px] leading-relaxed text-muted">
            {JSON.stringify(data.original_schedule_snapshot, null, 2)}
          </pre>
        ) : (
          <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3 text-xs text-muted">
            {t("noSnapshot")}
          </div>
        )}
      </div>
    </div>
  );
}
