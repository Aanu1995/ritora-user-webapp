"use client";

import Link from "next/link";
import { History as HistoryIcon, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * Empty state for the History page. Mirrors the typography contract used by
 * the Journal and Shelf empty states already shipped: a large rounded icon
 * tile in accent-soft, an `h2` in font-display + bold, a muted paragraph
 * at text-sm, and the canonical `<Button>` (default variant: bg-foreground)
 * so the call-to-action colour matches every other empty state in the app.
 */
export function HistoryEmptyState() {
  const t = useTranslations("history.empty");
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <div
        aria-hidden
        className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-accent-soft text-accent-strong"
      >
        <HistoryIcon className="h-9 w-9" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{t("body")}</p>
      <Button asChild className="mt-4">
        <Link href="/todays-suggestion">
          <Sparkles className="h-3.5 w-3.5" />
          {t("cta")}
        </Link>
      </Button>
    </div>
  );
}
