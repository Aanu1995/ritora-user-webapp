"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { type PhotoAnalysisSourceCitation } from "@/types/skin-journal";
import { translateKey } from "./analysis-card-utils";

/* ===========================================================
 * Source citation links
 *
 * `AnalysisSourceLink` is the full-detail card used in the
 * card's Sources section. Body lifted from `text-xs` (eye
 * fatigue) to `text-sm` for the summary line; the "last
 * verified" timestamp stays small because it's a footnote.
 *
 * `InlineSourceLinks` renders compact pills below per-concern
 * guidance.
 * ========================================================= */

export function AnalysisSourceLink({
  source,
}: {
  source: PhotoAnalysisSourceCitation;
}) {
  const t = useTranslations("journal.analysis");
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 transition hover:border-accent/50 hover:bg-accent-soft/30"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
          {source.organization}
        </span>
        <span className="mt-1 block text-sm font-semibold text-foreground">
          {translateKey(t, source.title_key)}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-foreground/80">
          {translateKey(t, source.summary_key)}
        </span>
        <span className="mt-2 block text-xs text-muted">
          {t("sources.lastVerified", { date: source.last_verified })}
        </span>
      </span>
      <ExternalLink
        aria-hidden
        className="mt-0.5 h-4 w-4 shrink-0 text-muted transition group-hover:text-accent-strong"
      />
    </a>
  );
}

export function InlineSourceLinks({
  sources,
}: {
  sources: PhotoAnalysisSourceCitation[];
}) {
  const t = useTranslations("journal.analysis");
  if (sources.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {sources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent/50 hover:text-accent-strong"
        >
          {translateKey(t, source.title_key)}
          <ExternalLink aria-hidden className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
}
