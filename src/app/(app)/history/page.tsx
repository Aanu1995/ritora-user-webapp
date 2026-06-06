"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryDayCard } from "@/components/history/history-day-card";
import { HistoryEmptyState } from "@/components/history/history-empty-state";
import { HistoryFilterBar } from "@/components/history/history-filter-bar";
import { HistoryHeaderPopovers } from "@/components/history/header-popovers";
import { HistoryListSkeleton } from "@/components/history/history-list-skeleton";
import { HistorySummaryStrip } from "@/components/history/history-summary-strip";
import { useAutoLoadMore } from "@/hooks/use-auto-load-more";
import { useSuggestionHistory } from "@/hooks/use-suggestions";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

export default function HistoryPage() {
  const t = useTranslations("history.page");
  const [query, setQuery] = useState<SuggestionHistoryListQuery>({
    range: "7d",
  });
  const history = useSuggestionHistory(query);
  const data = history.data;
  const hasItems = Boolean(data?.days.length);
  const hasLoadMoreError = Boolean(history.isFetchNextPageError);
  const canLoadMore = Boolean(history.hasNextPage);
  const loadMoreSentinelRef = useAutoLoadMore({
    enabled:
      !history.isLoading && !history.isError && hasItems && !hasLoadMoreError,
    hasNextPage: canLoadMore,
    isFetchingNextPage: history.isFetchingNextPage,
    onLoadMore: () => {
      void history.fetchNextPage();
    },
  });
  const showAutoLoadState =
    canLoadMore || history.isFetchingNextPage || hasLoadMoreError;

  const headerAction = <HistoryHeaderPopovers />;

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={headerAction}
      />

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

            {showAutoLoadState ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                {hasLoadMoreError ? (
                  <>
                    <p className="text-center text-sm text-danger" role="alert">
                      {t("loadMoreError")}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        void history.fetchNextPage();
                      }}
                    >
                      {t("retry")}
                    </Button>
                  </>
                ) : history.isFetchingNextPage ? (
                  <HistoryLoadMoreSkeleton />
                ) : null}
                <div
                  ref={loadMoreSentinelRef}
                  data-testid="history-auto-load-sentinel"
                  aria-hidden="true"
                  className="h-px w-full"
                />
              </div>
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

function HistoryLoadMoreSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full flex-col gap-2 rounded-3xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-36 rounded-full" />
          <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
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
