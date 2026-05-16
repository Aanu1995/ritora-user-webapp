"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { AppRoute } from "@/constants/app-routes";
import { useDay, useRetryAnalysis } from "@/hooks/use-skin-journal";
import { BackButton } from "@/components/skin-journal/back-button";
import { DayDetailPanel } from "@/components/skin-journal/day-detail";
import { formatJournalLongDate } from "@/components/skin-journal/journal-date";
import { JournalUploadMode } from "@/components/skin-journal/journal-navigation";
import { useJournalProfileGate } from "@/components/skin-journal/use-journal-profile-gate";

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
  const locale = useLocale();
  const { openTodayUpload, profileGateDialog } = useJournalProfileGate();
  const { data, isLoading } = useDay(date);
  const retryAnalysis = useRetryAnalysis();
  const formattedDate = formatJournalLongDate(date, locale);

  const today = todayYmd();
  const isToday = date === today;
  const openTodayEdit = () => openTodayUpload(JournalUploadMode.Edit);

  return (
    <div>
      <PageHeader
        title={formattedDate}
        subtitle={
          data?.entry?.has_reaction
            ? t("reactionFlagged")
            : t("dayDetailSubtitle")
        }
        leading={<BackButton href={AppRoute.Journal} label={t("backToJournal")} />}
      />
      <div className="mx-auto mt-2 w-full lg:w-[80%]">
        <DayDetailPanel
          detail={data ?? null}
          isLoading={isLoading}
          isToday={isToday}
          onAddPhoto={isToday ? openTodayUpload : undefined}
          onEditEntry={isToday ? openTodayEdit : undefined}
          onRetryAnalysis={
            isToday ? (entry) => retryAnalysis.mutate(entry.id) : undefined
          }
          onReplacePhoto={isToday ? openTodayEdit : undefined}
        />
      </div>
      {profileGateDialog}
    </div>
  );
}
