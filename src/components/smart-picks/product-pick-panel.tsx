"use client";

import { useTranslations } from "next-intl";
import { Heart, Info, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { SmartPicksProductPick } from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { sellerDisplayNames } from "./seller-guidance";
import { SellerNameList } from "./seller-name-list";

interface ProductPickPanelProps {
  pick: SmartPicksProductPick;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function ProductPickPanel({
  pick,
  pendingAction,
  actionsDisabled,
  onAction,
}: ProductPickPanelProps) {
  const t = useTranslations("smartPicks.page");
  const saved = pick.userAction === "saved";
  const sellerNames = sellerDisplayNames(pick.sellerNames);
  const savePending = pendingAction === "saved";
  const dismissPending = pendingAction === "dismissed";
  const busy = savePending || dismissPending;

  return (
    <div className="mt-4 rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {pick.brand}
          </div>
          <div className="mt-1 font-display text-base font-bold leading-snug text-foreground sm:text-[17px]">
            {pick.productName}
          </div>
          {pick.reasoningChips.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pick.reasoningChips.map((chip) => (
                <span
                  key={`${chip.tone}-${chip.text}`}
                  className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted"
                >
                  {chip.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={
            saved
              ? t("actions.saved")
              : savePending
                ? t("actions.saving")
                : t("actions.save")
          }
          aria-pressed={saved}
          disabled={busy || actionsDisabled || saved}
          onClick={() => onAction(pick.id, "saved")}
          className={cn(
            "grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border transition disabled:cursor-default",
            saved || savePending
              ? "border-[color:rgba(47,122,82,0.32)] bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-muted hover:border-accent-strong hover:text-accent-strong",
          )}
        >
          {savePending ? (
            <LoadingIndicator size="sm" />
          ) : (
            <Heart
              className={cn("h-3.5 w-3.5", saved && "fill-current")}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      <SellerNameList names={sellerNames} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <Info className="h-4 w-4" />
              {t("actions.whyThis")}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
            <SheetTitle>{t("drawer.title")}</SheetTitle>
            <SheetDescription>{t("drawer.description")}</SheetDescription>
            <WhyThisContent pick={pick} />
          </SheetContent>
        </Sheet>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={
            dismissPending ? t("actions.dismissing") : t("actions.dismiss")
          }
          disabled={busy || actionsDisabled}
          onClick={() => onAction(pick.id, "dismissed")}
        >
          {dismissPending ? (
            <LoadingIndicator size="sm" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {dismissPending ? null : t("actions.dismiss")}
        </Button>
      </div>
    </div>
  );
}

function WhyThisContent({ pick }: { pick: SmartPicksProductPick }) {
  const t = useTranslations("smartPicks.page");
  const facts = Object.entries(pick.reasoningFacts);

  return (
    <div className="mt-6 space-y-6">
      <section>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4" />
          {t("drawer.facts")}
        </h4>
        <dl className="mt-3 space-y-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase text-muted">
                {label}
              </dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {pick.alternatives.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold text-foreground">
            {t("drawer.alternatives")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {pick.alternatives.map((alternative) => (
              <li key={alternative.id}>
                <span className="font-semibold text-foreground">
                  {alternative.brand} {alternative.productName}
                </span>{" "}
                {alternative.recommendationRankReason ? (
                  <span>: {alternative.recommendationRankReason}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pick.ruledOut.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold text-foreground">
            {t("drawer.ruledOut")}
          </h4>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {pick.ruledOut.map((item) => (
              <li key={`${item.brand}-${item.productName}`}>
                <span className="font-semibold text-foreground">
                  {item.brand} {item.productName}:
                </span>{" "}
                {item.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
