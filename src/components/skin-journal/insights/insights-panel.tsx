"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  CheckInRadarChart,
  ConcernTrendChart,
  ReactionFrequencyChart,
} from "@/components/skin-journal/charts";
import { Chip } from "@/components/skin-journal/chip";
import { JournalEmptyState } from "@/components/skin-journal/journal-empty-state";
import { InsightCard } from "@/components/skin-journal/insights/insight-card";
import type {
  InsightAction,
  InsightWindow,
  JournalEntry,
  JournalInsight,
  JournalInsightsMeta,
} from "@/types/skin-journal";

interface InsightsPanelProps {
  photos: JournalEntry[];
  totalPhotoCount: number;
  insights: JournalInsight[];
  insightsMeta: JournalInsightsMeta | null;
  insightsLoading: boolean;
  insightsWindow: InsightWindow;
  onInsightsWindowChange: (window: InsightWindow) => void;
  onRefreshInsights: () => void;
  isRefreshingInsights: boolean;
  onOpenUpload?: () => void;
  onOpenCompare: (fromDate?: string, toDate?: string) => void;
  onOpenExport: () => void;
  onOpenEntries: (entryIds: string[]) => void;
  onOpenProduct: (productId: string) => void;
  onOpenSettings: (tab: string) => void;
  onRecordInsightAction?: (id: string, action: InsightAction) => void;
  onDismissInsight: (id: string) => void;
}

const INSIGHT_WINDOWS: InsightWindow[] = ["all", "week", "month"];

export function InsightFeedSkeleton() {
  return (
    <div data-testid="insight-feed-skeleton" className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-2xl border border-border bg-surface-muted"
        />
      ))}
    </div>
  );
}

export function InsightsPanel({
  photos,
  totalPhotoCount,
  insights,
  insightsMeta,
  insightsLoading,
  insightsWindow,
  onInsightsWindowChange,
  onRefreshInsights,
  isRefreshingInsights,
  onOpenUpload,
  onOpenCompare,
  onOpenExport,
  onOpenEntries,
  onOpenProduct,
  onOpenSettings,
  onRecordInsightAction,
  onDismissInsight,
}: InsightsPanelProps) {
  const tInsights = useTranslations("journal.insightsTab");
  const criticalInsights = insights.filter(
    (insight) => insight.severity === "critical" || insight.kind === "referral",
  );
  const aiSummary = insights.find((insight) => insight.kind === "ai_summary");
  const feedInsights = insights.filter(
    (insight) =>
      !criticalInsights.some((critical) => critical.id === insight.id) &&
      insight.id !== aiSummary?.id,
  );

  const handleAction = (insightId: string, action: InsightAction) => {
    onRecordInsightAction?.(insightId, action);
    if (action.kind === "open_export") {
      onOpenExport();
      return;
    }
    if (action.kind === "open_today_upload") {
      onOpenUpload?.();
      return;
    }
    if (action.kind === "open_compare") {
      onOpenCompare(action.from_date, action.to_date);
      return;
    }
    if (action.kind === "view_entries") {
      onOpenEntries(action.entry_ids);
      return;
    }
    if (action.kind === "open_product") {
      onOpenProduct(action.inventory_product_id);
      return;
    }
    if (action.kind === "open_settings") {
      onOpenSettings(action.tab);
    }
  };

  if (totalPhotoCount === 0) {
    return (
      <JournalEmptyState
        icon="✨"
        title={tInsights("empty.title")}
        body={tInsights("empty.body")}
        tone="ai"
      />
    );
  }

  return (
    <div className="space-y-4">
      {insightsMeta ? (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                {tInsights("progress.title", {
                  count: insightsMeta.total_entries,
                })}
              </p>
              <p className="mt-1 text-sm text-muted">
                {["queued", "sent", "running"].includes(
                  insightsMeta.generation_status,
                )
                  ? tInsights("progress.generating")
                  : insightsMeta.entries_until_next_insight > 0
                  ? tInsights("progress.next", {
                      count: insightsMeta.entries_until_next_insight,
                    })
                  : tInsights("progress.ready")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshInsights}
              disabled={isRefreshingInsights}
            >
              {isRefreshingInsights
                ? tInsights("refreshing")
                : tInsights("refresh")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {INSIGHT_WINDOWS.map((window) => (
          <Chip
            key={window}
            asButton
            selected={insightsWindow === window}
            variant={insightsWindow === window ? "ai" : undefined}
            onClick={() => onInsightsWindowChange(window)}
          >
            {tInsights(`windows.${window}`)}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {insightsLoading ? <InsightFeedSkeleton /> : null}
        {criticalInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onAction={(action) => handleAction(insight.id, action)}
            onDismiss={() => onDismissInsight(insight.id)}
          />
        ))}
        {aiSummary ? (
          <InsightCard
            insight={aiSummary}
            onAction={(action) => handleAction(aiSummary.id, action)}
            onDismiss={() => onDismissInsight(aiSummary.id)}
          />
        ) : null}
        {feedInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onAction={(action) => handleAction(insight.id, action)}
            onDismiss={() => onDismissInsight(insight.id)}
          />
        ))}
        {!insightsLoading && insights.length === 0 ? (
          <JournalEmptyState
            icon="✨"
            title={tInsights("empty.title")}
            body={tInsights("empty.body")}
            tone="ai"
          />
        ) : null}
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-bold">
          {tInsights("trendsTitle")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ConcernTrendChart entries={photos} />
          <ReactionFrequencyChart entries={photos} />
          <CheckInRadarChart entries={photos} />
        </div>
      </div>
    </div>
  );
}
