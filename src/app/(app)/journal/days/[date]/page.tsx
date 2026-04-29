"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { AppRoute } from "@/constants/app-routes";
import {
  useDay,
  useDeleteEntry,
  useRetryAnalysis,
} from "@/hooks/use-skin-journal";
import { BackButton } from "@/components/skin-journal/back-button";
import { DayDetailPanel } from "@/components/skin-journal/day-detail";
import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";

function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function JournalDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const t = useTranslations("journal.dayDetail");
  const router = useRouter();
  const { data, isLoading } = useDay(date);
  const deleteEntry = useDeleteEntry();
  const retryAnalysis = useRetryAnalysis();

  const today = todayYmd();
  const isToday = date === today;
  const openTodayUpload = () => router.push(buildJournalUploadHref());

  return (
    <div>
      <PageHeader
        title={date}
        subtitle={
          data?.entry?.has_reaction
            ? t("reactionFlagged")
            : t("dayDetailSubtitle")
        }
        leading={<BackButton href={AppRoute.Journal} label={t("backToJournal")} />}
      />
      <div className="mt-2 max-w-3xl">
        <DayDetailPanel
          detail={data ?? null}
          isLoading={isLoading}
          isToday={isToday}
          onAddPhoto={isToday ? openTodayUpload : undefined}
          onRetryAnalysis={(entry) => retryAnalysis.mutate(entry.id)}
          onReplacePhoto={isToday ? openTodayUpload : undefined}
          onDeleteEntry={(entry) => {
            deleteEntry.mutate(entry.id, {
              onSuccess: () => router.push(AppRoute.Journal),
            });
          }}
        />
      </div>
    </div>
  );
}
