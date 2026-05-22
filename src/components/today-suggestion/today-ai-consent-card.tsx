"use client";

import { useState } from "react";
import { Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const BENEFIT_KEYS = [
  "benefits.matchProfile",
  "benefits.adaptToShelf",
  "benefits.revokeAnytime",
] as const;

type Props = {
  disabled?: boolean;
  visible: boolean;
  pending: boolean;
  onGrant: () => void;
};

export function TodayAiConsentCard({
  disabled = false,
  visible,
  pending,
  onGrant,
}: Props) {
  const t = useTranslations("todaysSuggestion.aiConsentCard");
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) {
    return null;
  }

  return (
    <section className="mb-3 rounded-3xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface text-[color:var(--ai-strong)]">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <p className="mt-3 font-display text-base font-bold text-foreground">
        {t("title")}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t("body")}</p>

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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[color:var(--ai-border)] bg-surface px-2.5 py-1 text-[11px] font-medium text-muted">
          <Lock className="h-3 w-3 text-[color:var(--ai-strong)]" />
          {t("privacy")}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            onClick={onGrant}
            disabled={pending || disabled}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("grant")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => setDismissed(true)}
          >
            {t("dismiss")}
          </Button>
        </div>
      </div>
    </section>
  );
}
