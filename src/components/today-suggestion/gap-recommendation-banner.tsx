"use client";

import { useTranslations } from "next-intl";
import { Bookmark, Check, Loader2, PackagePlus, Search, X } from "lucide-react";
import type { SuggestionGapRecommendation } from "@/types/suggestions";

type Props = {
  recommendation: SuggestionGapRecommendation;
  onBrowse?: () => void;
  onSaveToWishlist?: () => void;
  onDismiss?: () => void;
  isSaving?: boolean;
  isDismissing?: boolean;
};

export function GapRecommendationBanner({
  recommendation,
  onBrowse,
  onSaveToWishlist,
  onDismiss,
  isSaving = false,
  isDismissing = false,
}: Props) {
  const t = useTranslations("todaysSuggestion.gapRecommendation");

  return (
    <aside className="rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] px-4 py-3.5">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--ai-bg)] text-[color:var(--ai-strong)]">
        <PackagePlus className="h-4 w-4" />
      </span>
      <p className="mt-2 text-sm font-semibold text-[color:var(--ai-fg)]">
        {t("title", { ingredient: recommendation.ingredientOrCategory })}
      </p>
      <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
        {recommendation.reason}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
          {onBrowse ? (
            <button
              type="button"
              onClick={onBrowse}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft/80"
            >
              <Search className="h-3 w-3" />
              {t("browse")}
            </button>
          ) : null}
          {onSaveToWishlist ? (
            <button
              type="button"
              onClick={onSaveToWishlist}
              disabled={isSaving || recommendation.userAction === "saved"}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-surface px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-accent-soft hover:text-accent-strong"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : recommendation.userAction === "saved" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
              {recommendation.userAction === "saved"
                ? t("saved")
                : t("saveToWishlist")}
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              disabled={isDismissing}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-surface px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-accent-strong"
            >
              {isDismissing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {t("dismiss")}
            </button>
          ) : null}
      </div>
    </aside>
  );
}
