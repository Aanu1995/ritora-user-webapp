"use client";

import type { LucideIcon } from "lucide-react";
import { Ban, CheckCircle2, Eye, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { type PhotoAnalysisConcernGuidance } from "@/types/skin-journal";
import { Chip } from "./chip";
import { safeDynamicTranslation } from "./safe-translation";
import { InlineSourceLinks } from "./analysis-source-links";
import {
  SEVERITY_VARIANT,
  translateKey,
  translateTextRef,
} from "./analysis-card-utils";

/* ===========================================================
 * Concern guidance card
 *
 * One card per detected concern. The body is split into four
 * groups that are semantically opposite (factors, try, avoid,
 * track). They used to render with identical checkmark icons
 * and muted text, which made "things to try" and "things to
 * avoid" visually indistinguishable. They now have tone-coded
 * icons so a quick scan separates the verbs at a glance:
 *
 *   - Possible cause   → Lightbulb, muted (neutral context)
 *   - Try next         → CheckCircle, accent (do)
 *   - Avoid for now    → Ban, warning (don't)
 *   - Track            → Eye, ai (watch)
 * ========================================================= */

type GuidanceTone = "factors" | "actions" | "avoid" | "track";

const TONE_STYLES: Record<
  GuidanceTone,
  { icon: LucideIcon; iconClass: string; bulletClass: string }
> = {
  factors: {
    icon: Lightbulb,
    iconClass: "bg-surface-muted text-muted",
    bulletClass: "text-muted",
  },
  actions: {
    icon: CheckCircle2,
    iconClass: "bg-accent-soft text-accent-strong",
    bulletClass: "text-accent-strong",
  },
  avoid: {
    icon: Ban,
    iconClass: "bg-warning-soft text-[color:var(--warning)]",
    bulletClass: "text-[color:var(--warning)]",
  },
  track: {
    icon: Eye,
    iconClass: "bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]",
    bulletClass: "text-[color:var(--ai-fg)]",
  },
};

function GuidanceBlock({
  tone,
  label,
  items,
}: {
  tone: GuidanceTone;
  label: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  const { icon: Icon, iconClass, bulletClass } = TONE_STYLES[tone];
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <ul className="mt-2 space-y-1.5 pl-8">
        {items.map((item) => (
          <li
            key={item}
            className="relative text-sm leading-relaxed text-foreground/85"
          >
            <span
              aria-hidden
              className={`absolute -left-3.5 top-2 inline-block h-1 w-1 rounded-full bg-current ${bulletClass}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrackBlock({
  label,
  body,
  escalation,
}: {
  label: string;
  body: string;
  escalation?: string;
}) {
  const { icon: Icon, iconClass } = TONE_STYLES.track;
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <p className="mt-2 pl-8 text-sm leading-relaxed text-foreground/85">
        {body}
      </p>
      {escalation ? (
        <p className="mt-2 pl-8 text-sm leading-relaxed text-danger">
          {escalation}
        </p>
      ) : null}
    </div>
  );
}

export function ConcernGuidanceCard({
  guidance,
  hideTrack = false,
}: {
  guidance: PhotoAnalysisConcernGuidance;
  hideTrack?: boolean;
}) {
  const t = useTranslations("journal.analysis");
  const tConcerns = useTranslations("journal.concerns");
  const tSeverity = useTranslations("journal.severity");
  const concernLabel = safeDynamicTranslation(
    tConcerns,
    guidance.concern,
    guidance.concern.replace(/_/g, " "),
  );
  const possibleCauseItems =
    guidance.possible_cause_items && guidance.possible_cause_items.length > 0
      ? guidance.possible_cause_items
      : guidance.possible_factor_keys.map((item) => translateTextRef(t, item));
  const tryNextItems =
    guidance.try_next_items && guidance.try_next_items.length > 0
      ? guidance.try_next_items
      : guidance.action_keys.map((item) => translateTextRef(t, item));
  const avoidItems =
    guidance.avoid_items && guidance.avoid_items.length > 0
      ? guidance.avoid_items
      : guidance.avoid_keys.map((item) => translateTextRef(t, item));

  return (
    <article className="rounded-2xl border border-border bg-surface-muted/50 p-4">
      {/* Concern header — guidance title up top, then a structured
          row of chips that surfaces the concern, severity, and
          locations as individual visual elements. The previous
          muted "Acne · Mild · left cheek, right cheek, jawline"
          line buried the concern name in low-contrast text; the
          new row makes each piece a chip the eye can land on, with
          the severity chip tone-coded (matching the face map) so
          the connection between "where" and "what" stays clear. */}
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h5 className="text-base font-semibold leading-tight text-foreground">
            {translateKey(t, guidance.title_key)}
          </h5>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] bg-surface px-2.5 py-1 text-xs font-bold text-foreground">
              {concernLabel}
            </span>
            <Chip
              variant={SEVERITY_VARIANT[guidance.severity]}
              selected
              className="px-2 py-0.5"
            >
              {tSeverity(guidance.severity)}
            </Chip>
            {guidance.locations.map((location, locationIndex) => (
              <span
                key={`${location}-${locationIndex}`}
                className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {location.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
        <Chip selected className="shrink-0 px-2 py-0.5">
          {translateKey(
            t,
            `journal.analysis.reading.confidenceLabels.${guidance.confidence_label}`,
          )}
        </Chip>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {translateTextRef(t, guidance.summary)}
      </p>

      {/* Four tone-coded guidance blocks in a 2-column grid on sm+,
          stacked on mobile. Each block reads as its own intent so a
          quick scan tells you "try X" vs "avoid Y" without parsing
          labels. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <GuidanceBlock
          tone="factors"
          label={translateKey(t, "journal.analysis.guidance.sections.factors")}
          items={possibleCauseItems}
        />
        <GuidanceBlock
          tone="actions"
          label={translateKey(t, "journal.analysis.guidance.sections.actions")}
          items={tryNextItems}
        />
        <GuidanceBlock
          tone="avoid"
          label={translateKey(t, "journal.analysis.guidance.sections.avoid")}
          items={avoidItems}
        />
        {hideTrack ? null : (
          <TrackBlock
            label={translateKey(t, "journal.analysis.guidance.sections.track")}
            body={translateTextRef(t, guidance.track_key)}
            escalation={
              guidance.escalation_key
                ? translateTextRef(t, guidance.escalation_key)
                : undefined
            }
          />
        )}
      </div>

      <InlineSourceLinks sources={guidance.sources} />
    </article>
  );
}
