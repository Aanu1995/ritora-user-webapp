"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { FaceZoneOverlay } from "@/components/skin-journal/face-zone-overlay";
import { cn } from "@/lib/utils";
import {
  insightMessageKey,
  resolveInsightText,
} from "@/components/skin-journal/insights/insight-text";
import {
  evidenceTone,
  InsightEntryThumbs,
  InsightFactorTable,
  InsightMetricDelta,
  InsightSourceLink,
} from "@/components/skin-journal/insights/insight-block-parts";
import type {
  InsightAction,
  InsightBlock,
  InsightValues,
  JournalInsight,
} from "@/types/skin-journal";

interface InsightBlockViewProps {
  block: InsightBlock;
  insight: JournalInsight;
  isActionDisabled?: (action: InsightAction) => boolean;
  onAction?: (action: InsightAction) => void;
}

function severityFromWeight(weight: number): "mild" | "moderate" | "severe" {
  if (weight >= 0.75) return "severe";
  if (weight >= 0.45) return "moderate";
  return "mild";
}

function toTranslationValues(
  values: InsightValues | undefined,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(values ?? {}).map(([key, value]) => [
      key,
      typeof value === "number" || typeof value === "string"
        ? value
        : String(value ?? ""),
    ]),
  );
}

export function InsightBlockView({
  block,
  insight,
  isActionDisabled,
  onAction,
}: InsightBlockViewProps) {
  const t = useTranslations("journal.insightsTab");
  const tConcerns = useTranslations("journal.concerns");
  const locale = useLocale();
  const shortDate = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });

  if (block.type === "text") {
    return (
      <p className="text-sm leading-relaxed text-muted">
        {resolveInsightText(t, tConcerns, block)}
      </p>
    );
  }

  if (block.type === "evidence_grade") {
    return (
      <span
        className={cn(
          "inline-flex w-fit flex-wrap rounded-full px-2.5 py-1 text-xs font-bold",
          evidenceTone(block.grade),
        )}
      >
        {t(`evidenceGrade.${block.grade}`)}
        <span className="mx-1 text-current/60">·</span>
        {resolveInsightText(t, tConcerns, block.basis)}
      </span>
    );
  }

  if (block.type === "metric_delta") {
    return <InsightMetricDelta block={block} />;
  }

  if (block.type === "sparkline" || block.type === "regression") {
    return (
      <div className="h-24 rounded-xl border border-border bg-surface-muted p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={block.series}>
            <XAxis dataKey="x" hide />
            <YAxis
              domain={block.type === "sparkline" ? block.y_domain ?? [0, 5] : [0, 5]}
              hide
            />
            <Tooltip />
            {block.type === "sparkline" && block.baseline ? (
              <ReferenceLine y={block.baseline} stroke="var(--border)" />
            ) : null}
            <Line
              type="monotone"
              dataKey="y"
              stroke="var(--accent-strong)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (block.type === "bar_strip") {
    return (
      <div className="h-24 rounded-xl border border-border bg-surface-muted p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={block.bars}>
            <XAxis dataKey="x" hide />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="y" fill="var(--accent-strong)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (block.type === "event_study") {
    const data = [
      ...block.before.map((point) => ({ ...point, phase: "before" })),
      ...block.after.map((point) => ({ ...point, phase: "after" })),
    ];
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <p className="mb-2 text-xs font-semibold text-muted">
          {resolveInsightText(t, tConcerns, block.marker.label)}
        </p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="x" hide />
              <YAxis hide domain={[0, 5]} />
              <Tooltip />
              <ReferenceLine x={block.marker.x} stroke="var(--warning)" />
              <Line
                type="monotone"
                dataKey="y"
                stroke="var(--accent-strong)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (block.type === "dot_strip") {
    return (
      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-surface-muted p-3">
        {block.dots.map((dot) => (
          <span
            key={`${dot.x}-${dot.label ?? ""}`}
            title={dot.label ?? dot.x}
            className={cn(
              "h-3 w-3 shrink-0 rounded-full",
              dot.tone === "critical"
                ? "bg-danger"
                : dot.tone === "warning"
                  ? "bg-warning"
                  : "bg-accent",
            )}
          />
        ))}
      </div>
    );
  }

  if (block.type === "face_heatmap") {
    return (
      <FaceZoneOverlay
        className="mx-auto max-w-60 border border-border"
        concerns={block.zones.map((zone) => ({
          concern: zone.concern,
          severity: severityFromWeight(zone.weight),
          locations: [zone.location],
        }))}
      />
    );
  }

  if (block.type === "factor_table") {
    return <InsightFactorTable block={block} />;
  }

  if (block.type === "entry_thumbs") {
    return <InsightEntryThumbs block={block} onAction={onAction} />;
  }

  if (block.type === "disclaimer") {
    return (
      <p
        className={cn(
          "rounded-xl px-3 py-2 text-xs leading-relaxed",
          block.tone === "critical"
            ? "bg-danger-soft text-danger"
            : block.tone === "ai"
              ? "bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]"
              : "bg-surface-muted text-muted",
        )}
      >
        {t(insightMessageKey(block.key), toTranslationValues(block.values))}
      </p>
    );
  }

  if (block.type === "cta_link") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isActionDisabled?.(block.action) ?? false}
        onClick={() => onAction?.(block.action)}
      >
        {t(insightMessageKey(block.key), toTranslationValues(block.values))}
      </Button>
    );
  }

  if (block.type === "source_link") {
    return (
      <InsightSourceLink
        source={insight.sources.find((source) => source.id === block.kb_id)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted p-3 text-sm text-muted">
      {t("blocks.unknown", {
        date: shortDate.format(
          new Date(`${insight.time_window.end}T00:00:00`),
        ),
      })}
    </div>
  );
}
