"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Heart, ShieldCheck, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
  SMART_PICKS_VERIFICATION_STATUS,
  type SmartPicksOverview,
  type SmartPicksProductPick,
  type SmartPicksStarterKitStep,
} from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { formatPrice } from "./smart-picks-format";

interface StarterKitSectionProps {
  overview: SmartPicksOverview;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function StarterKitSection({
  overview,
  pending,
  onAction,
}: StarterKitSectionProps) {
  const t = useTranslations("smartPicks.page");

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-accent-strong">
            {t("starterKit.eyebrow")}
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {t("starterKit.title")}
          </h2>
          {overview.starterKit.summary ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {overview.starterKit.summary}
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          {t("starterKit.stepCount", {
            count: overview.starterKit.steps.length,
          })}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {overview.starterKit.steps.map((step) => (
          <StarterKitStepCard
            key={`${step.order}-${step.role}-${step.normalizedKey}`}
            step={step}
            pending={pending}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}

function StarterKitStepCard({
  step,
  pending,
  onAction,
}: {
  step: SmartPicksStarterKitStep;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const isCovered = step.status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Covered;
  const isWait = step.status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Wait;

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
              {t("starterKit.step", { order: step.order })}
            </span>
            <StarterStatusPill status={step.status} />
          </div>
          <h3 className="mt-2 text-base font-bold text-foreground">
            {step.title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {isCovered && step.ownedProductName
              ? step.ownedProductName
              : step.ingredientOrCategory}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">{step.reason}</p>
        </div>
        {isCovered ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
        ) : null}
        {isWait ? (
          <TimerReset className="h-5 w-5 text-muted" aria-hidden />
        ) : null}
      </div>

      {step.pick ? (
        <StarterProductPick
          pick={step.pick}
          pending={pending}
          onAction={onAction}
        />
      ) : null}
    </article>
  );
}

function StarterStatusPill({
  status,
}: {
  status: SmartPicksStarterKitStep["status"];
}) {
  const t = useTranslations("smartPicks.page");
  const tone =
    status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Covered
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Wait
        ? "border-border bg-surface-muted text-muted"
        : "border-accent-soft bg-accent-soft text-accent-strong";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {t(`starterKit.status.${status}`)}
    </span>
  );
}

function StarterProductPick({
  pick,
  pending,
  onAction,
}: {
  pick: SmartPicksProductPick;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const saved = pick.userAction === "saved";
  const primaryRetailer = pick.retailers[0] ?? null;
  const primaryRetailerPrice = primaryRetailer
    ? formatPrice(primaryRetailer.priceCents, primaryRetailer.currency)
    : null;

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">{pick.brand}</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {pick.productName}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {pick.recommendationRankReason ?? t("starterKit.pickFallback")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
              {t(`availability.status.${pick.availabilityStatus}`)}
            </span>
            {primaryRetailer ? (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                {primaryRetailer.name}
                {primaryRetailerPrice ? ` · ${primaryRetailerPrice}` : ""}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={saved ? "secondary" : "outline"}
          disabled={pending || saved}
          onClick={() => onAction(pick.id, "saved")}
        >
          {pending ? (
            <LoadingIndicator size="sm" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          {saved ? t("actions.saved") : t("actions.save")}
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        {t("retailers.verify")}
      </p>
      {pick.verificationStatus ===
      SMART_PICKS_VERIFICATION_STATUS.RetailerVerified ? (
        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-emerald-700">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("verification.retailerVerified")}
        </p>
      ) : null}
      {pick.verificationStatus ===
      SMART_PICKS_VERIFICATION_STATUS.RetailerUnverified ? (
        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("verification.retailerUnverified")}
        </p>
      ) : null}
    </div>
  );
}
