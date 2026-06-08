"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type AnalysisFeedbackReason,
  type AnalysisFeedbackVote,
  type AnalysisObservations,
  type PhotoAnalysisInterpretation,
  PhotoAnalysisInterpretationVersion,
  PhotoAnalysisReadingLabel,
} from "@/types/skin-journal";
import { Chip } from "./chip";
import { ConcernGuidanceCard } from "./analysis-guidance-card";
import { AnalysisFeedbackPanel } from "./analysis-feedback-panel";
import { AnalysisQualitySection } from "./analysis-quality-section";
import { AnalysisSourceLink } from "./analysis-source-links";
import {
  dedupeRepeatedGuidanceItems,
  fallbackSummaryKey,
  translateKey,
  translateTextRef,
} from "./analysis-card-utils";

/* ===========================================================
 * Photo analysis card
 *
 * Renders the result of a single skin-photo AI analysis. The
 * card carries a lot of information (summary, guidance per
 * concern, image-quality breakdown, sources, feedback,
 * disclaimer) so the layout splits into clear sections
 * separated by hairline dividers, each with a sentence-case
 * heading.
 *
 * Hierarchy choices that keep this readable:
 *   - Summary copy is `text-foreground`, not muted, so the
 *     first thing a tired eye lands on actually reads as the
 *     headline.
 *   - The AI tint is confined to a slim top band behind the
 *     header. The body sits on a neutral `bg-surface` so the
 *     dense text below isn't washed by a gradient.
 *   - Per-concern guidance (factors / try / avoid / track) is
 *     tone-coded inside `ConcernGuidanceCard` so a quick scan
 *     differentiates "do this" from "avoid this" without
 *     parsing labels.
 *   - Sections are separated by `Divider`, not gradients or
 *     extra cards, so the eye can rest between groups.
 * ========================================================= */

interface AnalysisCardProps {
  observations: AnalysisObservations;
  interpretation?: PhotoAnalysisInterpretation | null;
  feedbackVote?: AnalysisFeedbackVote | null;
  feedbackReason?: AnalysisFeedbackReason | null;
  feedbackNote?: string | null;
  feedbackDisabled?: boolean;
  onFeedback?: (feedback: {
    vote: AnalysisFeedbackVote;
    reason?: AnalysisFeedbackReason | null;
    note?: string | null;
  }) => void;
  reinterpretDisabled?: boolean;
  onReinterpret?: () => void;
}

export function AnalysisCard({
  observations,
  interpretation,
  feedbackVote = null,
  feedbackReason = null,
  feedbackNote = null,
  feedbackDisabled = false,
  onFeedback,
  reinterpretDisabled = false,
  onReinterpret,
}: AnalysisCardProps) {
  const t = useTranslations("journal.analysis");
  const tSafetyReasons = useTranslations("journal.analysis.safetyReasons");
  const needsRetake =
    observations.image_quality.needs_retake === true ||
    observations.image_quality.face_detected === false;
  const safetyReasons = observations.safety_flags?.reasons ?? [];
  const hasSafetyEscalation =
    observations.should_flag_for_doctor ||
    observations.safety_flags?.urgent_review_recommended === true ||
    observations.safety_flags?.doctor_follow_up_recommended === true ||
    safetyReasons.length > 0;
  const summary = interpretation
    ? translateKey(t, interpretation.summary_key, interpretation.summary_values)
    : translateKey(
        t,
        fallbackSummaryKey(observations, needsRetake, hasSafetyEscalation),
      );
  const readingLabel =
    interpretation?.reading_quality?.visual_label ??
    (needsRetake
      ? PhotoAnalysisReadingLabel.NeedsRetake
      : observations.image_quality.quality_score !== undefined &&
          observations.image_quality.quality_score < 0.65
        ? PhotoAnalysisReadingLabel.Limited
        : PhotoAnalysisReadingLabel.Useful);
  const concernGuidance = dedupeRepeatedGuidanceItems(
    interpretation?.concern_guidance ?? [],
  );
  const canReinterpret =
    interpretation?.version === PhotoAnalysisInterpretationVersion.V1_0 &&
    typeof onReinterpret === "function";
  const guidanceParagraphs = interpretation?.guidance_keys ?? [];
  const readingReasons = interpretation?.reading_quality?.reason_keys ?? [];
  // Drop the `notDiagnosis` caveat — the disclaimer card at the
  // bottom of the analysis card already covers this point in
  // stronger language, so rendering it as a caveat above is just
  // duplicate copy that adds visual noise.
  const caveats = (interpretation?.caveat_keys ?? []).filter(
    (key) => key !== "journal.analysis.interpretation.caveats.notDiagnosis",
  );
  const sources = interpretation?.sources ?? [];
  const disclaimerSentences = splitFirstSentence(t("disclaimer"));

  return (
    <article className="overflow-hidden rounded-2xl border border-[color:var(--ai-border)] bg-surface shadow-[var(--shadow-soft)]">
      {/* Header band — slim AI-tinted strip so the brand cue is
          present without washing the dense body below. */}
      <header className="flex flex-col gap-3 border-b border-border/60 bg-[color:var(--ai-soft)]/60 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]"
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {t("title")}
            </h3>
          </div>
        </div>
        <Chip variant="accent" selected className="self-start sm:self-auto">
          {translateKey(t, "journal.analysis.reading.photoRead", {
            label: translateKey(
              t,
              `journal.analysis.reading.labels.${readingLabel}`,
            ),
          })}
        </Chip>
      </header>

      <div className="p-4 sm:p-5">
        {/* Summary — the most-read part. Lifts to `text-foreground`
            so it reads as a headline, not a sidebar caption. */}
        <section className="space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          {guidanceParagraphs.map((key) => (
            <p
              key={key}
              className="text-sm leading-relaxed text-foreground/85"
            >
              {translateKey(t, key)}
            </p>
          ))}
          {readingReasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {readingReasons.map((reason, index) => (
                <Chip key={`${reason.key}-${index}`}>
                  {translateTextRef(t, reason)}
                </Chip>
              ))}
            </div>
          ) : null}
        </section>

        {canReinterpret ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-bg)]/40 p-3">
            <Sparkles
              aria-hidden
              className="h-4 w-4 shrink-0 text-[color:var(--ai-fg)]"
            />
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
              {t("reinterpret.body")}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={reinterpretDisabled}
              onClick={onReinterpret}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("reinterpret.cta")}
            </Button>
          </div>
        ) : null}

        {needsRetake ? (
          <Notice
            tone="warning"
            title={t("retakeTitle")}
            body={t("retakeBody")}
          />
        ) : null}

        {hasSafetyEscalation ? (
          <Notice
            tone="danger"
            title={t("safetyTitle")}
            body={t("safetyBody")}
            extra={
              safetyReasons.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {safetyReasons.map((reason) => (
                    <Chip key={reason} variant="danger" selected>
                      {tSafetyReasons(reason)}
                    </Chip>
                  ))}
                </div>
              ) : null
            }
          />
        ) : null}

        {/* Face map + photo quality sits ABOVE the per-concern
            deep dive: the user sees the overall picture (what
            was found, where, and whether the photo was usable)
            before diving into the guidance for each individual
            concern. */}
        <Section>
          <AnalysisQualitySection observations={observations} />
        </Section>

        {concernGuidance.length > 0 ? (
          <Section title={t("title")} hideTitleOnHeader>
            <div className="space-y-3">
              {concernGuidance.map((guidance, index) => (
                <ConcernGuidanceCard
                  key={`${guidance.concern}-${guidance.locations.join("-")}-${index}`}
                  guidance={guidance}
                  hideTrack={guidance.hide_repeated_track === true}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {sources.length > 0 ? (
          <Section title={t("sources.label")}>
            <div className="space-y-2">
              {sources.map((source) => (
                <AnalysisSourceLink key={source.id} source={source} />
              ))}
            </div>
          </Section>
        ) : null}

        {onFeedback && feedbackVote === null ? (
          <Section noBorder>
            <AnalysisFeedbackPanel
              feedbackDisabled={feedbackDisabled}
              feedbackNote={feedbackNote}
              feedbackReason={feedbackReason}
              feedbackVote={feedbackVote}
              onFeedback={onFeedback}
            />
          </Section>
        ) : null}

        {caveats.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {caveats.map((key) => (
              <li
                key={key}
                className="text-xs leading-relaxed text-muted"
              >
                {translateKey(t, key)}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-4 rounded-xl bg-surface-muted/60 p-3 text-xs leading-relaxed text-muted">
          <strong className="text-foreground">{disclaimerSentences.lead}</strong>
          {disclaimerSentences.rest ? ` ${disclaimerSentences.rest}` : null}
        </p>
      </div>
    </article>
  );
}

/* ===========================================================
 * Local helpers — kept inline so the card stays one file but
 * the JSX above reads as structure rather than markup.
 * ========================================================= */

function Section({
  title,
  hideTitleOnHeader,
  noBorder,
  children,
}: {
  title?: string;
  hideTitleOnHeader?: boolean;
  noBorder?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={
        noBorder
          ? "mt-5"
          : "mt-5 border-t border-border/60 pt-5"
      }
    >
      {title && !hideTitleOnHeader ? (
        <h4 className="mb-3 text-xs font-semibold text-muted">{title}</h4>
      ) : null}
      {children}
    </section>
  );
}

function Notice({
  tone,
  title,
  body,
  extra,
}: {
  tone: "warning" | "danger";
  title: string;
  body: string;
  extra?: ReactNode;
}) {
  const cls =
    tone === "danger"
      ? "border-danger/30 bg-danger/10"
      : "border-[color:var(--warning-border)] bg-warning-soft";
  const iconColor =
    tone === "danger" ? "text-danger" : "text-[color:var(--warning)]";
  const titleColor =
    tone === "danger" ? "text-danger" : "text-foreground";

  return (
    <div className={`mt-4 rounded-2xl border p-3 ${cls}`}>
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          aria-hidden
          className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">
            {body}
          </p>
          {extra}
        </div>
      </div>
    </div>
  );
}

/**
 * Split the disclaimer into "first sentence + rest" so the lead
 * can render bold without resorting to `String.split(".")[0]` in
 * the JSX (which silently mangles abbreviations and is fragile).
 */
function splitFirstSentence(text: string): { lead: string; rest: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^([^.!?]+[.!?])\s*([\s\S]*)$/);
  if (!match) return { lead: trimmed, rest: "" };
  return { lead: match[1], rest: match[2] };
}
