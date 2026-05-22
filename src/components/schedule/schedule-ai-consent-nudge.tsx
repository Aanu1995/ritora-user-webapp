"use client";

import { useState } from "react";
import { Check, Loader2, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useSuggestionAiConsent,
  useUpdateSuggestionAiConsent,
} from "@/hooks/use-suggestions";

const BENEFIT_KEYS = [
  "benefits.matchProfile",
  "benefits.adaptToShelf",
  "benefits.revokeAnytime",
] as const;

type ScheduleAiConsentNudgeProps = {
  disabled?: boolean;
};

export function ScheduleAiConsentNudge({
  disabled = false,
}: ScheduleAiConsentNudgeProps) {
  const t = useTranslations("schedule.aiConsentNudge");
  const aiConsent = useSuggestionAiConsent();
  const updateConsent = useUpdateSuggestionAiConsent();
  const [dismissed, setDismissed] = useState(false);

  if (aiConsent.isLoading || aiConsent.data?.granted || dismissed) {
    return null;
  }

  const isPending = updateConsent.isPending;

  return (
    <section
      aria-labelledby="schedule-ai-consent-title"
      className="relative mt-3 overflow-hidden rounded-3xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] p-4 sm:p-5"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,_var(--ai-bg)_0%,_transparent_70%)]"
      />

      <div className="relative">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface text-[color:var(--ai-strong)] shadow-soft">
          <Sparkles className="h-5 w-5" />
        </span>

        <h3
          id="schedule-ai-consent-title"
          className="mt-3 font-display text-base font-bold leading-tight text-foreground sm:text-[17px]"
        >
          {t("title")}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {t("body")}
        </p>

        <ul className="mt-3 flex flex-col gap-1.5">
          {BENEFIT_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-start gap-2 text-xs text-foreground"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--ai-strong)]" />
              <span className="leading-snug">{t(key)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ai-border)] bg-surface px-2.5 py-1 text-[11px] font-medium text-muted">
          <Lock className="h-3 w-3 text-[color:var(--ai-strong)]" />
          {t("privacy")}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isPending || disabled}
            onClick={() => {
              if (disabled) {
                return;
              }

              updateConsent.mutate(
                { granted: true },
                {
                  onSuccess: () => {
                    toast.success(t("saved"));
                  },
                  onError: () => {
                    toast.error(t("error"));
                  },
                },
              );
            }}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {t("action")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => setDismissed(true)}
          >
            {t("dismiss")}
          </Button>
        </div>
      </div>
    </section>
  );
}
