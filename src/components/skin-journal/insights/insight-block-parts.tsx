"use client";

import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SmoothImage } from "@/components/ui/smooth-image";
import { cn } from "@/lib/utils";
import { buildBackendUrl } from "@/lib/media-url";
import {
  insightMessageKey,
  resolveInsightText,
} from "@/components/skin-journal/insights/insight-text";
import type {
  InsightAction,
  InsightBlock,
  InsightEvidenceGrade,
  InsightSourceCitation,
} from "@/types/skin-journal";

export function evidenceTone(grade: InsightEvidenceGrade): string {
  if (grade === "strong") return "bg-success-soft text-success";
  if (grade === "moderate") return "bg-accent-soft text-accent-strong";
  if (grade === "limited") return "bg-warning-soft text-warning";
  return "bg-surface-muted text-muted";
}

function unitLabel(
  t: ReturnType<typeof useTranslations>,
  unit: "entries" | "rating" | undefined,
): string | null {
  return unit ? t(`metric.units.${unit}`) : null;
}

export function InsightSourceLink({
  source,
}: {
  source: InsightSourceCitation | undefined;
}) {
  const t = useTranslations("journal.insightsTab");
  if (!source) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted p-3 text-sm text-muted">
        {t("blocks.unknownSource")}
      </div>
    );
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-muted p-3 text-sm transition hover:border-accent/50"
    >
      <span>
        <span className="block font-semibold text-foreground">
          {source.organization}
        </span>
        <span className="mt-0.5 block text-muted">
          {t(insightMessageKey(source.title_key))}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {t(insightMessageKey(source.summary_key))}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {t("kb.lastVerified", { date: source.last_verified })}
        </span>
      </span>
      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
    </a>
  );
}

export function InsightMetricDelta({
  block,
}: {
  block: Extract<InsightBlock, { type: "metric_delta" }>;
}) {
  const t = useTranslations("journal.insightsTab");
  const delta = block.value - block.previous;
  const isGood =
    block.direction === "neutral" ||
    (block.direction === "down_is_good" && delta <= 0) ||
    (block.direction === "up_is_good" && delta >= 0);
  const precision = block.precision ?? 1;
  const translatedUnit = unitLabel(t, block.unit);

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">
            {block.value.toFixed(precision)}
            {translatedUnit ? (
              <span className="ml-1 text-sm text-muted">{translatedUnit}</span>
            ) : null}
          </p>
          <p className="text-xs text-muted">
            {t("metric.previous", {
              value: block.previous.toFixed(precision),
            })}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
            isGood
              ? "bg-success-soft text-success"
              : "bg-warning-soft text-warning",
          )}
        >
          {delta <= 0 ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )}
          {Math.abs(delta).toFixed(precision)}
        </span>
      </div>
    </div>
  );
}

export function InsightFactorTable({
  block,
}: {
  block: Extract<InsightBlock, { type: "factor_table" }>;
}) {
  const t = useTranslations("journal.insightsTab");
  const tConcerns = useTranslations("journal.concerns");
  const translatedUnit = unitLabel(t, block.effect_unit);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {block.rows.map((row) => (
        <div
          key={row.factor.key}
          className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0"
        >
          <span className="text-sm text-muted">
            {resolveInsightText(t, tConcerns, row.factor)}
          </span>
          <span className="text-sm font-semibold">
            {row.effect.toFixed(1)}
            {translatedUnit ? ` ${translatedUnit}` : ""}
            <span className="ml-1 text-xs text-muted">
              {t("metric.sampleCount", { count: row.n })}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function InsightEntryThumbs({
  block,
  onAction,
}: {
  block: Extract<InsightBlock, { type: "entry_thumbs" }>;
  onAction?: (action: InsightAction) => void;
}) {
  const locale = useLocale();
  const shortDate = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });
  const entries = block.entries?.slice(0, block.max ?? 6) ?? [];

  return (
    <div className="flex gap-2 overflow-x-auto">
      {entries.length > 0
        ? entries.map((entry) => (
            <button
              key={entry.entry_id}
              type="button"
              onClick={() =>
                onAction?.({
                  kind: "view_entries",
                  entry_ids: [entry.entry_id],
                })
              }
              className="group flex h-16 w-14 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-muted text-xs font-medium text-muted transition hover:border-accent"
            >
              {entry.photo_url ? (
                <SmoothImage
                  src={buildBackendUrl(entry.photo_url) ?? entry.photo_url}
                  alt={shortDate.format(new Date(`${entry.date}T00:00:00`))}
                  sizes="56px"
                  className="h-10 w-full"
                />
              ) : (
                <span className="h-10 w-full bg-background/70" />
              )}
              <span className="truncate px-1 py-1">
                {shortDate.format(new Date(`${entry.date}T00:00:00`))}
              </span>
            </button>
          ))
        : block.entry_ids.slice(0, block.max ?? 6).map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onAction?.({ kind: "view_entries", entry_ids: [id] })
              }
            >
              {id.slice(-6)}
            </Button>
          ))}
    </div>
  );
}
