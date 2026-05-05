"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { HistoryDayCard } from "@/components/history/history-day-card";
import { HistoryEmptyState } from "@/components/history/history-empty-state";
import { HistoryExportButton } from "@/components/history/history-export-button";
import { HistoryFilterBar } from "@/components/history/history-filter-bar";
import { HistoryHeaderPopovers } from "@/components/history/header-popovers";
import { HistoryListSkeleton } from "@/components/history/history-list-skeleton";
import { HistorySummaryStrip } from "@/components/history/history-summary-strip";
import { useSuggestionHistory } from "@/hooks/use-suggestions";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

export default function HistoryPage() {
  const t = useTranslations("history.page");
  const [query, setQuery] = useState<SuggestionHistoryListQuery>({
    range: "7d",
  });
  const history = useSuggestionHistory(query);
  const data = history.data;

  const headerAction = (
    <div className="flex shrink-0 gap-1.5">
      <HistoryExportButton
        query={query}
        disabled={!data || data.days.length === 0}
      />
      <HistoryHeaderPopovers />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={headerAction}
      />

      {/*
        Content under the header is constrained to 70% of the available width
        on desktop so the day cards stay tight and readable. The header itself
        keeps its full width because it lives in the parent shell.
        Filter bar sits sticky just below the header so it stays visible while
        the day cards scroll.
      */}
      <div className="mx-auto w-full lg:w-[70%]">
        <div className="sticky top-[88px] z-[5] -mx-4 bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <HistoryFilterBar value={query} onChange={setQuery} />
        </div>

        {history.isLoading ? (
          <HistoryListSkeleton />
        ) : history.isError ? (
          <RetryPanel
            title={t("errorTitle")}
            description={t("error")}
            actionLabel={t("retry")}
            onAction={() => {
              void history.refetch();
            }}
          />
        ) : !data || data.days.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <>
            <HistorySummaryStrip
              applied={data.totalApplied}
              edited={data.totalEdited}
              total={data.totalSlots}
              adherencePercent={data.adherencePercent}
            />

            <div className="mt-3">
              {data.days.map((day) => (
                <HistoryDayCard key={day.date} day={day} />
              ))}
            </div>

            {history.hasNextPage || history.isFetchingNextPage ? (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={history.isFetchingNextPage}
                  onClick={() => {
                    void history.fetchNextPage();
                  }}
                >
                  {history.isFetchingNextPage
                    ? t("loadingMore")
                    : t("loadMore")}
                </Button>
              </div>
            ) : null}

            {history.isFetchNextPageError ? (
              <p className="mt-2 text-center text-sm text-danger" role="alert">
                {t("loadMoreError")}
              </p>
            ) : null}

            {data.adherencePercent !== null ? (
              <PatternNoticeCard percent={data.adherencePercent} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function PatternNoticeCard({ percent }: { percent: number }) {
  const t = useTranslations("history.patternNotice");
  return (
    <aside className="mt-4 flex items-start gap-3 rounded-3xl border border-[color:rgba(47,122,82,0.22)] bg-accent-soft px-4 py-3.5">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{t("title")}</p>
        <p className="mt-1 text-sm leading-snug text-muted">
          {t("body", { percent })}
        </p>
      </div>
    </aside>
  );
}
