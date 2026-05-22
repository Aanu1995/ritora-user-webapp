"use client";

import { Sparkles, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  SlotProcessingCard,
} from "@/components/today-suggestion/slot-state-card";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { onDemandToSlot } from "./on-demand-suggestion-adapter";
import type {
  TodaysOnDemandSuggestion,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

type Props = {
  suggestions: TodaysOnDemandSuggestion[];
  onRetry: (suggestionId: string) => void;
  retryingSuggestionId?: string | null;
  retryDisabled?: boolean;
  onRecord: (slot: TodaysSuggestionSlot) => void;
  onEdit: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
  onShowDetail: (slot: TodaysSuggestionSlot) => void;
  timeZone?: string;
  nowMs: number;
};

export function OnDemandSuggestionSection({
  suggestions,
  onRetry,
  retryingSuggestionId,
  retryDisabled = false,
  onRecord,
  onEdit,
  onShowDetail,
  timeZone,
  nowMs,
}: Props) {
  const t = useTranslations("todaysSuggestion.onDemand");
  if (suggestions.length === 0) return null;

  return (
    <section className="mt-5">
      <p className="mb-2 ml-1 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">
        <Sparkles className="h-3 w-3" />
        {t("sectionTitle")}
      </p>

      <ul className="flex flex-col gap-3">
        {suggestions.map((item) => {
          const slot = onDemandToSlot(item);
          return (
            <li key={item.id}>
              <OnDemandCard
                item={item}
                slot={slot}
                isRetrying={retryingSuggestionId === item.id}
                retryDisabled={retryDisabled}
                onRetry={onRetry}
                onRecord={onRecord}
                onEdit={onEdit}
                onShowDetail={onShowDetail}
                timeZone={timeZone}
                nowMs={nowMs}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OnDemandCard({
  item,
  slot,
  onRetry,
  isRetrying,
  retryDisabled,
  onRecord,
  onEdit,
  onShowDetail,
  timeZone,
  nowMs,
}: {
  item: TodaysOnDemandSuggestion;
  slot: TodaysSuggestionSlot;
  onRetry: (suggestionId: string) => void;
  isRetrying: boolean;
  retryDisabled: boolean;
  onRecord: (slot: TodaysSuggestionSlot) => void;
  onEdit: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
  onShowDetail: (slot: TodaysSuggestionSlot) => void;
  timeZone?: string;
  nowMs: number;
}) {
  const t = useTranslations("todaysSuggestion.onDemand");
  const intent = item.suggestion.requestContext?.intent;
  const qualityWarnings = item.suggestion.productDataQuality.warnings;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-muted">
        <span className="font-semibold text-foreground">{t("label")}</span>
        {intent ? <span>{t(`intent.${intent}`)}</span> : null}
      </div>
      {item.status === "generating" || item.status === "failed" ? (
        <div className="space-y-2">
          <SlotProcessingCard slot={slot} timeZone={timeZone} />
          {item.status === "failed" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRetrying || retryDisabled}
              onClick={() => onRetry(item.id)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isRetrying ? t("retrying") : t("retry")}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          {qualityWarnings.length > 0 ? (
            <div className="flex items-start gap-3 rounded-[1.25rem] border border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)] px-4 py-3">
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgba(245,158,11,0.18)] text-[color:var(--note-warm-fg)]"
              >
                <TriangleAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--note-warm-fg)]">
                  {t("qualityTitle")}
                </p>
                <ul className="mt-1 space-y-0.5 text-xs leading-5 text-muted">
                  {qualityWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          <SuggestionSlotCard
            slot={slot}
            onRecord={onRecord}
            onEdit={onEdit}
            onShowDetail={onShowDetail}
            timeZone={timeZone}
            nowMs={nowMs}
          />
        </div>
      )}
    </div>
  );
}
