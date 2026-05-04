"use client";

import { useState } from "react";
import { Download, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { HistoryDayCard } from "@/components/history/history-day-card";
import { HistoryEmptyState } from "@/components/history/history-empty-state";
import { HistoryFilterBar } from "@/components/history/history-filter-bar";
import { HistoryHeaderPopovers } from "@/components/history/header-popovers";
import { HistoryListSkeleton } from "@/components/history/history-list-skeleton";
import { useSuggestionHistory } from "@/hooks/use-suggestions";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

export default function HistoryPage() {
  const t = useTranslations("history.page");
  const tSummary = useTranslations("history.summary");
  const [query, setQuery] = useState<SuggestionHistoryListQuery>({
    range: "7d",
  });
  const history = useSuggestionHistory(query);
  const data = history.data;

  const headerAction = (
    <div className="flex shrink-0 gap-1.5">
      <Button variant="outline" size="sm" aria-label={t("export")}>
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("export")}</span>
      </Button>
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
            <SummaryStrip
              applied={data.totalApplied}
              total={data.totalSlots}
              adherencePercent={data.adherencePercent}
              tSummary={tSummary}
            />

            <div className="mt-3">
              {data.days.map((day) => (
                <HistoryDayCard key={day.date} day={day} />
              ))}
            </div>

            {data.adherencePercent !== null ? (
              <PatternNoticeCard percent={data.adherencePercent} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryStrip({
  applied,
  total,
  adherencePercent,
  tSummary,
}: {
  applied: number;
  total: number;
  adherencePercent: number | null;
  tSummary: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:rgba(47,122,82,0.28)] bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
        {tSummary("appliedOf", { applied, total })}
      </span>
      {adherencePercent !== null ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
          {tSummary("adherence", { percent: adherencePercent })}
        </span>
      ) : null}
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
