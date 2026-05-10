"use client";

import {
  Camera,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CheckSquare,
  CircleHelp,
  CloudSun,
  Cpu,
  Database,
  ExternalLink,
  MessageSquareQuote,
  Pause,
  Package,
  RefreshCw,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { SuggestionModeBadge } from "@/components/today-suggestion/mode-badge";
import { SuggestionProductImageTile } from "@/components/today-suggestion/product-image-tile";
import {
  buildIntent,
  buildStepReasonRows,
  type StepReasonRow,
} from "@/components/today-suggestion/suggestion-detail-copy";
import { buildEnvironmentRows } from "@/components/today-suggestion/suggestion-detail-environment";
import { useRegenerateSuggestion } from "@/hooks/use-suggestions";
import { formatIsoTime12h, formatSlotTime12h } from "@/lib/suggestion-daypart";
import type { SuggestionInstance } from "@/types/suggestions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: SuggestionInstance | null;
  onMarkApplied?: () => void;
  allowRegeneration?: boolean;
  showEnvironment?: boolean;
};

export function SuggestionDetailDrawer({
  open,
  onOpenChange,
  suggestion,
  onMarkApplied,
  allowRegeneration = false,
  showEnvironment = true,
}: Props) {
  const t = useTranslations("todaysSuggestion.detailDrawer");
  const regenerate = useRegenerateSuggestion();

  if (!suggestion) return null;

  const explanation = suggestion.explanation;
  const intent = buildIntent(suggestion);
  const stepReasons = buildStepReasonRows(suggestion);
  const skipped = explanation?.skipped ?? [];
  const inputs = explanation?.inputs ?? [];
  const environmentRows = showEnvironment
    ? buildEnvironmentRows(suggestion.environmentSummary, t)
    : [];
  const hasRationaleContent =
    intent !== null ||
    stepReasons.length > 0 ||
    skipped.length > 0 ||
    inputs.length > 0 ||
    environmentRows.length > 0 ||
    suggestion.evidenceSources.length > 0;
  const hasActions = Boolean(onMarkApplied) || allowRegeneration;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-[480px]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 pb-3.5 pt-5">
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted">
              {t("eyebrow")}
            </p>
            <SheetTitle className="mt-1 font-display text-lg">
              {t("title", {
                daypart: t(`daypart.${suggestion.daypart}`),
                time: formatSlotTime12h(suggestion.targetTime),
              })}
            </SheetTitle>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <SuggestionModeBadge mode={suggestion.mode} />
              {suggestion.generatedAt ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
                  <Cpu className="h-2.5 w-2.5" />
                  {t("generatedAt", {
                    time: formatIsoTime12h(suggestion.generatedAt),
                  })}
                </span>
              ) : null}
            </div>
          </div>
          <SheetDescription className="sr-only">
            {t("description")}
          </SheetDescription>
        </header>

        <div
          data-testid="suggestion-detail-scroll-body"
          className="flex-1 overflow-y-auto px-5 py-4"
        >
          {hasRationaleContent ? (
            <>
              {intent ? (
                <RationaleBlock
                  icon={<MessageSquareQuote className="h-3 w-3" />}
                  label={t("sections.intent")}
                >
                  {intent.body.length > 0 ? (
                    <>
                      <p className="mb-2 last:mb-0">
                        <strong>{intent.headline}</strong> {intent.body[0]}
                      </p>
                      {intent.body.slice(1).map((paragraph, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>
                      <strong>{intent.headline}</strong>
                    </p>
                  )}
                </RationaleBlock>
              ) : null}

              {stepReasons.length > 0 ? (
                <RationaleBlock
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label={t("sections.whyEach")}
                >
                  <ul className="flex flex-col gap-2">
                    {stepReasons.map((row) => (
                      <StepReasonListItem key={row.stepOrder} row={row} />
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}

              {skipped.length > 0 ? (
                <RationaleBlock
                  icon={<XCircle className="h-3 w-3" />}
                  label={t("sections.whatISkipped")}
                >
                  <ul className="flex flex-col gap-2">
                    {skipped.map((row, index) => (
                      <li
                        key={`${row.name}-${index}`}
                        className="flex items-start gap-2.5 rounded-xl border border-dashed border-[color:var(--border-strong)] px-3 py-2.5 text-[13px] leading-snug"
                      >
                        <Pause className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                        <span>
                          <strong className="text-foreground">
                            {row.name}.
                          </strong>{" "}
                          {row.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}

              {inputs.length > 0 ? (
                <RationaleBlock
                  icon={<Database className="h-3 w-3" />}
                  label={t("sections.inputs")}
                >
                  <ul className="flex flex-col gap-2">
                    {inputs.map((input) => (
                      <li
                        key={input.label}
                        className="flex items-start gap-2.5 rounded-xl bg-surface-muted px-3 py-2.5 text-[13px] leading-snug"
                      >
                        {iconForInput(input.label)}
                        <span>
                          <strong className="text-foreground">
                            {input.label}.
                          </strong>{" "}
                          {input.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}

              {environmentRows.length > 0 ? (
                <RationaleBlock
                  icon={<CloudSun className="h-3 w-3" />}
                  label={t("sections.environment")}
                >
                  <ul className="flex flex-col gap-2">
                    {environmentRows.map((row) => (
                      <li
                        key={row.label}
                        className="rounded-xl bg-surface-muted px-3 py-2.5 text-[13px] leading-snug"
                      >
                        <strong className="text-foreground">
                          {row.label}.
                        </strong>{" "}
                        {row.detail}
                      </li>
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}

              {suggestion.evidenceSources.length > 0 ? (
                <RationaleBlock
                  icon={<BookOpenCheck className="h-3 w-3" />}
                  label={t("sections.evidence")}
                >
                  <ul className="flex flex-col gap-2">
                    {suggestion.evidenceSources.map((source) => (
                      <li
                        key={source.id}
                        className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] leading-snug"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-start gap-1.5 font-semibold text-foreground underline-offset-2 hover:underline"
                        >
                          <span>{source.title}</span>
                          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
                        </a>
                        <p className="mt-0.5 text-[12px] font-medium text-muted">
                          {source.organization} -{" "}
                          {t("evidenceReviewed", {
                            date: source.reviewedAt,
                          })}
                        </p>
                        <p className="mt-1 text-[12.5px] text-muted">
                          {source.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-surface-muted px-3 py-4 text-center text-sm text-muted">
              {t("noRationale")}
            </p>
          )}

          {hasActions ? (
            <div className="mt-5 flex flex-col gap-2 border-t border-border pb-1 pt-3.5">
              {onMarkApplied ? (
                <Button
                  onClick={onMarkApplied}
                  className="w-full border border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-none hover:bg-[color:var(--accent-strong)] hover:opacity-100"
                >
                  <Check className="h-4 w-4" />
                  {t("markApplied")}
                </Button>
              ) : null}
              {allowRegeneration ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    regenerate.mutate({
                      id: suggestion.id,
                      payload: { reason: "user_requested" },
                    })
                  }
                  disabled={regenerate.isPending}
                  className="w-full font-medium shadow-none"
                >
                  {regenerate.isPending ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {t("tryAnotherSuggestion")}
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StepReasonListItem({ row }: { row: StepReasonRow }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-surface-muted px-3 py-2.5 text-[13px] leading-snug">
      {row.imageUrl ? (
        <SuggestionProductImageTile
          imageUrl={row.imageUrl}
          label={row.name ?? ""}
          category={row.category}
          className="mt-0.5 h-9 w-8 rounded-lg"
          sizes="32px"
        />
      ) : (
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
      )}
      <span>
        {row.name ? (
          <>
            <strong className="text-foreground">{row.name}.</strong>{" "}
          </>
        ) : null}
        {row.reason}
      </span>
    </li>
  );
}

function RationaleBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 last:mb-0">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </p>
      <div className="text-[13.5px] leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}

function iconForInput(label: string): React.ReactNode {
  const lower = label.toLowerCase();
  if (lower.includes("profile")) {
    return <UserCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
  }
  if (lower.includes("shelf")) {
    return <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
  }
  if (lower.includes("photo")) {
    return <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
  }
  if (lower.includes("record")) {
    return <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
  }
  if (lower.includes("weather")) {
    return <CloudSun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
  }
  return <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />;
}
