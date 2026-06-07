"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Heart, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
  SMART_PICKS_PRODUCT_GENERATION_STATUS,
  type SmartPicksOverview,
  type SmartPicksProductPick,
  type SmartPicksProductGenerationState,
  type SmartPicksStarterKitStep,
} from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { sellerDisplayNames } from "./seller-guidance";
import { SellerNameList } from "./seller-name-list";
import { translateSmartPicksProfileValue } from "./smart-picks-format";

interface StarterKitSectionProps {
  overview: SmartPicksOverview;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  productGeneration: SmartPicksProductGenerationState;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function StarterKitSection({
  overview,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  productGeneration,
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
            pendingPickId={pendingPickId}
            pendingAction={pendingAction}
            actionsDisabled={actionsDisabled}
            productGeneration={productGeneration}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}

function StarterKitStepCard({
  step,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  productGeneration,
  onAction,
}: {
  step: SmartPicksStarterKitStep;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  productGeneration: SmartPicksProductGenerationState;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const tProfile = useTranslations("skinProfile");
  const isCovered = step.status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Covered;
  const isWait = step.status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Wait;
  const displayTitle = translateSmartPicksProfileValue(tProfile, step.title);
  const displayCategory = translateSmartPicksProfileValue(
    tProfile,
    step.ingredientOrCategory,
  );

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
            {displayTitle}
          </h3>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {isCovered && step.ownedProductName
              ? step.ownedProductName
              : displayCategory}
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
          pendingAction={pendingPickId === step.pick.id ? pendingAction : null}
          actionsDisabled={actionsDisabled}
          onAction={onAction}
        />
      ) : !isCovered && !isWait ? (
        <StarterPendingPick productGeneration={productGeneration} />
      ) : null}
    </article>
  );
}

function StarterPendingPick({
  productGeneration,
}: {
  productGeneration: SmartPicksProductGenerationState;
}) {
  const t = useTranslations("smartPicks.page");
  const failed =
    productGeneration.status === SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed ||
    productGeneration.status === SMART_PICKS_PRODUCT_GENERATION_STATUS.Skipped;

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted p-3">
      <div className="flex items-start gap-2 text-sm text-muted">
        <TimerReset className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">
            {t(
              failed
                ? "starterKit.noPickFailedTitle"
                : "starterKit.noPickTitle",
            )}
          </p>
          <p className="mt-1 leading-6">
            {t(failed ? "starterKit.noPickFailed" : "starterKit.noPick")}
          </p>
        </div>
      </div>
    </div>
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
  pendingAction,
  actionsDisabled,
  onAction,
}: {
  pick: SmartPicksProductPick;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const saved = pick.userAction === "saved";
  const sellerNames = sellerDisplayNames(pick.sellerNames);
  const saving = pendingAction === "saved";

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">{pick.brand}</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {pick.productName}
          </p>
          <SellerNameList names={sellerNames} className="mt-3" />
        </div>
        <Button
          type="button"
          size="sm"
          variant={saved ? "secondary" : "outline"}
          aria-label={
            saved
              ? t("actions.saved")
              : saving
                ? t("actions.saving")
                : t("actions.save")
          }
          disabled={saving || actionsDisabled || saved}
          onClick={() => onAction(pick.id, "saved")}
        >
          {saving ? (
            <LoadingIndicator size="sm" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          {saved
            ? t("actions.saved")
            : saving
              ? null
              : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
