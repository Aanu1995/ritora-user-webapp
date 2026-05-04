"use client";

import {
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  CircleHelp,
  CloudSun,
  Cpu,
  Database,
  MessageSquareQuote,
  Pause,
  Package,
  RefreshCw,
  SlidersHorizontal,
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
import { useRegenerateSuggestion } from "@/hooks/use-suggestions";
import { formatIsoTime12h, formatSlotTime12h } from "@/lib/suggestion-daypart";
import type { SuggestionInstance } from "@/types/suggestions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: SuggestionInstance | null;
  onMarkApplied?: () => void;
  onCustomise?: () => void;
};

/**
 * Drawer surfaced from any slot card via "Why this routine →". Mirrors
 * mockup 10. Shows the AI rationale, per-step reasoning, what was held
 * back today, and the inputs trace (skin profile, shelf, photos, etc.).
 *
 * The "Generate alternatives" CTA hits the regenerate endpoint which
 * supersedes the current suggestion and produces a new one.
 */
export function SuggestionDetailDrawer({
  open,
  onOpenChange,
  suggestion,
  onMarkApplied,
  onCustomise,
}: Props) {
  const t = useTranslations("todaysSuggestion.detailDrawer");
  const regenerate = useRegenerateSuggestion();

  if (!suggestion) return null;

  const explanation = suggestion.explanation;

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
              {suggestion.aiModel ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
                  <Cpu className="h-2.5 w-2.5" />
                  {t("aiModel", { model: suggestion.aiModel })}
                </span>
              ) : null}
            </div>
          </div>
          <SheetDescription className="sr-only">
            {t("description")}
          </SheetDescription>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {explanation ? (
            <>
              <RationaleBlock
                icon={<MessageSquareQuote className="h-3 w-3" />}
                label={t("sections.intent")}
              >
                {explanation.body.map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </RationaleBlock>

              {explanation.perStepReasons.length > 0 ? (
                <RationaleBlock
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label={t("sections.whyEach")}
                >
                  <ul className="flex flex-col gap-2">
                    {explanation.perStepReasons.map((row) => (
                      <li
                        key={row.stepOrder}
                        className="flex items-start gap-2.5 rounded-xl bg-surface-muted px-3 py-2.5 text-[13px] leading-snug"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
                        <span>{row.reason}</span>
                      </li>
                    ))}
                  </ul>
                </RationaleBlock>
              ) : null}

              {explanation.skipped.length > 0 ? (
                <RationaleBlock
                  icon={<XCircle className="h-3 w-3" />}
                  label={t("sections.whatISkipped")}
                >
                  <ul className="flex flex-col gap-2">
                    {explanation.skipped.map((row, index) => (
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

              {explanation.inputs.length > 0 ? (
                <RationaleBlock
                  icon={<Database className="h-3 w-3" />}
                  label={t("sections.inputs")}
                >
                  <ul className="flex flex-col gap-2">
                    {explanation.inputs.map((input) => (
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
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-surface-muted px-3 py-4 text-center text-sm text-muted">
              {t("noRationale")}
            </p>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-border px-5 pb-5 pt-3.5">
          <Button onClick={onMarkApplied} className="w-full">
            <Check className="h-4 w-4" />
            {t("markApplied")}
          </Button>
          <Button
            variant="ghost"
            onClick={onCustomise}
            className="w-full font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("customise")}
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              regenerate.mutate({
                id: suggestion.id,
                payload: { reason: "user_requested" },
              })
            }
            disabled={regenerate.isPending}
            className="w-full font-medium"
          >
            {regenerate.isPending ? (
              <LoadingIndicator size="sm" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t("generateAlternatives")}
              </>
            )}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
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
