"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { AppRoute } from "@/constants/app-routes";
import { BackButton } from "@/components/skin-journal/back-button";
import { JournalWrappedSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import { WrappedPlayer } from "@/components/skin-journal/wrapped-player";
import { useWrapped } from "@/hooks/use-skin-journal";

export default function JournalWrappedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("journal.wrapped.viewer");
  const tDayDetail = useTranslations("journal.dayDetail");
  const tPeriod = useTranslations("journal.wrapped.periodKind");
  const { data, isLoading } = useWrapped(id);

  if (isLoading) {
    return <JournalWrappedSkeleton />;
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={
          data
            ? t("subtitle", {
                kind: tPeriod(data.period_kind),
                period: data.period_start.slice(0, 7),
              })
            : t("title")
        }
        leading={
          <BackButton
            href={AppRoute.Journal}
            label={tDayDetail("backToJournal")}
          />
        }
      />
      <div className="mt-4 rounded-2xl bg-foreground/95 p-6 sm:p-10">
        {data ? (
          <WrappedPlayer wrapped={data} />
        ) : (
          <div className="grid place-items-center text-sm text-background">
            {t("notFound")}
          </div>
        )}
      </div>
    </div>
  );
}
