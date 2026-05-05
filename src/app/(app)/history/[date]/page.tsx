"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { HistoryDayDetailSkeleton } from "@/components/history/history-day-detail-skeleton";
import { HistoryDaySlotCompare } from "@/components/history/history-day-slot-compare";
import { BackButton } from "@/components/skin-journal/back-button";
import { RecordApplicationSheet } from "@/components/today-suggestion/record-application-sheet";
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useSuggestionHistoryDay } from "@/hooks/use-suggestions";
import type { ApplicationLog } from "@/types/application-tracking";
import type {
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export default function HistoryDayPage() {
  const params = useParams<{ date: string }>();
  const t = useTranslations("history.day");
  const tSummary = useTranslations("history.dayCard");
  const day = useSuggestionHistoryDay(params.date);
  const [editTarget, setEditTarget] = useState<{
    slot: TodaysSuggestionSlot;
    log: ApplicationLog;
  } | null>(null);
  const [detailTarget, setDetailTarget] = useState<SuggestionInstance | null>(
    null,
  );

  const backButton = <BackButton href="/history" label={t("backLabel")} />;

  if (day.isLoading) {
    return (
      <div>
        <PageHeader title={t("loading")} subtitle="" leading={backButton} />
        <HistoryDayDetailSkeleton />
      </div>
    );
  }

  if (day.isError || !day.data) {
    return (
      <div>
        <PageHeader title={t("errorTitle")} subtitle="" leading={backButton} />
        <RetryPanel
          title={t("errorTitle")}
          description={t("error")}
          actionLabel={t("retry")}
          onAction={() => {
            void day.refetch();
          }}
        />
      </div>
    );
  }

  const data = day.data;

  return (
    <div>
      <PageHeader
        title={formatHeaderDate(data.date)}
        subtitle={t("subtitle", {
          slots: data.slots.length,
          applied: data.slots.reduce((sum, s) => sum + s.appliedCount, 0),
          total: data.slots.reduce((sum, s) => sum + s.totalSteps, 0),
        })}
        leading={backButton}
        action={
          data.photoEntryId ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/journal/days/${data.date}`}>
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("viewPhoto")}</span>
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mx-auto w-full lg:w-[70%]">
        <ul className="mt-3 flex flex-col gap-3.5">
          {data.slots.map((slot, index) => (
            <li key={`${slot.daypart}-${slot.slotTime}-${index}`}>
              <HistoryDaySlotCompare
                slot={slot}
                date={data.date}
                tSummary={tSummary}
                onEdit={(targetSlot, log) =>
                  setEditTarget({ slot: targetSlot, log })
                }
                onShowDetail={setDetailTarget}
              />
            </li>
          ))}
        </ul>
      </div>

      <RecordApplicationSheet
        open={editTarget !== null}
        onOpenChange={(open) => (open ? null : setEditTarget(null))}
        mode={
          editTarget
            ? {
                kind: "edit",
                slot: editTarget.slot,
                existingLog: editTarget.log,
              }
            : null
        }
        onSaved={() => {
          setEditTarget(null);
          void day.refetch();
        }}
      />
      <SuggestionDetailDrawer
        open={detailTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDetailTarget(null);
        }}
        suggestion={detailTarget}
      />
    </div>
  );
}

function formatHeaderDate(date: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}
