"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bookmark, CircleAlert, Leaf, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import {
  hasActiveSmartPicksProductMatching,
  useSmartPicksOverview,
} from "@/hooks/use-smart-picks";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import type {
  SmartPicksGap,
  SmartPicksMode,
  SmartPicksProductGenerationState,
} from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { CoverageMeter } from "./coverage-meter";
import { GapCard } from "./gap-card";
import { ModeSwitch } from "./mode-switch";
import { RecapRow } from "./recap-row";
import { SmartPicksEmptyState } from "./smart-picks-empty-state";
import { normalizeFocusKey } from "./smart-picks-format";
import { SmartPicksSkeleton } from "./smart-picks-skeleton";
import { SupportingSections } from "./smart-picks-supporting-sections";
import { SmartPicksTrustNotice } from "./smart-picks-trust-notice";
import { StarterKitSection } from "./starter-kit-section";

export function SmartPicksPage() {
  const t = useTranslations("smartPicks.page");
  const searchParams = useSearchParams();
  const initialMode = readMode(searchParams.get("mode"));
  const focusKey = normalizeFocusKey(searchParams.get("focus") ?? "");
  const [mode, setMode] = useState<SmartPicksMode | undefined>(initialMode);
  const capabilities = useUserCapabilities();
  const isAiDisabled = isCapabilityDisabled(capabilities.aiGeneration);
  const overview = useSmartPicksOverview(mode, { enabled: !isAiDisabled });
  const recordAction = useRecordSuggestionGapAction();
  const activeMode = mode ?? overview.data?.mode ?? "refine";
  const isPreparingPicks = hasActiveSmartPicksProductMatching(overview.data);
  const pendingPickId =
    recordAction.isPending && recordAction.variables?.sourceType === "smart_pick"
      ? (recordAction.variables.smartPickProductSuggestionId ?? null)
      : null;
  const pendingAction =
    recordAction.isPending && recordAction.variables?.sourceType === "smart_pick"
      ? recordAction.variables.action
      : null;
  const actionsDisabled =
    isAiDisabled ||
    (recordAction.isPending &&
      recordAction.variables?.sourceType === "smart_pick");
  const allGaps = useMemo(
    () => [
      ...(overview.data?.priorityGaps ?? []),
      ...(overview.data?.considerGaps ?? []),
    ],
    [overview.data?.considerGaps, overview.data?.priorityGaps],
  );

  useEffect(() => {
    if (!focusKey || allGaps.length === 0) return;
    const matchingGap = allGaps.find(
      (gap) =>
        gap.normalizedKey === focusKey ||
        normalizeFocusKey(gap.ingredientOrCategory) === focusKey,
    );
    if (!matchingGap) return;
    document
      .getElementById(`smart-pick-gap-${matchingGap.normalizedKey}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [allGaps, focusKey]);

  const handleAction = (pickId: string, action: SuggestionGapActionKind) => {
    if (isAiDisabled) {
      return;
    }

    recordAction.mutate(
      {
        sourceType: "smart_pick",
        smartPickProductSuggestionId: pickId,
        action,
      },
      {
        onSuccess: () => {
          toast.success(
            action === "saved"
              ? t("feedback.saved")
              : t("feedback.dismissed"),
          );
        },
        onError: () => {
          toast.error(t("feedback.failed"));
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={AppRoute.SmartPicksWishlist}>
              <Bookmark className="h-4 w-4" />
              {t("actions.wishlist")}
            </Link>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-4xl">
        <div
          data-testid="smart-picks-tab-bar"
          className="sticky top-[88px] z-[5] -mx-4 bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
            <ModeSwitch
              disabled={isAiDisabled}
              value={activeMode}
              onChange={setMode}
            />
            {overview.isFetching && !overview.isLoading ? (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {t("refreshing")}
              </span>
            ) : null}
          </div>
        </div>

        {!isAiDisabled ? (
          <div className="mt-3">
            {overview.isLoading ? <SmartPicksSkeleton /> : null}
            {overview.isError ? (
              <RetryPanel
                title={t("error.title")}
                description={t("error.body")}
                actionLabel={t("error.retry")}
                onAction={() => {
                  void overview.refetch();
                }}
              />
            ) : null}
          </div>
        ) : null}
        {overview.data ? (
          <SmartPicksContent
            overview={overview.data}
            allGaps={allGaps}
            focusKey={focusKey}
            pendingPickId={pendingPickId}
            pendingAction={pendingAction}
            actionsDisabled={actionsDisabled}
            isPreparingPicks={isPreparingPicks}
            onAction={handleAction}
          />
        ) : null}
      </div>
    </div>
  );
}

function SmartPicksPreparingBanner() {
  const t = useTranslations("smartPicks.page");

  return (
    <section className="rounded-lg border border-accent-soft bg-accent-soft/55 px-4 py-3 text-accent-strong">
      <div className="flex items-start gap-3">
        <RefreshCw
          className="mt-0.5 h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-bold">{t("preparing.title")}</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            {t("preparing.body")}
          </p>
        </div>
      </div>
    </section>
  );
}

function SmartPicksContent({
  overview,
  allGaps,
  focusKey,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  isPreparingPicks,
  onAction,
}: {
  overview: NonNullable<ReturnType<typeof useSmartPicksOverview>["data"]>;
  allGaps: SmartPicksGap[];
  focusKey: string;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  isPreparingPicks: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const shouldBlockSmartPicks =
    overview.skinProfileRequired || overview.consentRequired;

  if (shouldBlockSmartPicks)
    return (
      <div className="mt-3" data-testid="smart-picks-tab-content">
        <SmartPicksEmptyState overview={overview} />
      </div>
    );

  if (overview.mode === "starter") {
    return (
      <div className="mt-3 space-y-5" data-testid="smart-picks-tab-content">
        {isPreparingPicks ? <SmartPicksPreparingBanner /> : null}
        <RecapRow recap={overview.recap} />
        <CoverageMeter coverage={overview.coverage} />
        <SmartPicksTrustNotice />
        {overview.starterKit.steps.length === 0 ? (
          <SmartPicksEmptyState overview={overview} />
        ) : (
          <StarterKitSection
            overview={overview}
            pendingPickId={pendingPickId}
            pendingAction={pendingAction}
            actionsDisabled={actionsDisabled}
            productGeneration={overview.productGeneration}
            onAction={onAction}
          />
        )}
        <p className="rounded-lg border border-border bg-surface p-4 text-xs leading-5 text-muted">
          {t("starterKit.footer")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-5" data-testid="smart-picks-tab-content">
      {isPreparingPicks ? <SmartPicksPreparingBanner /> : null}
      <RecapRow recap={overview.recap} />
      <CoverageMeter coverage={overview.coverage} />
      <SmartPicksTrustNotice />
      {allGaps.length === 0 ? (
        <SmartPicksEmptyState overview={overview} />
      ) : (
        <>
          <GapSection
            title={t("sections.priority")}
            icon={
              <CircleAlert
                className="h-3.5 w-3.5 text-amber-600"
                aria-hidden="true"
              />
            }
            gaps={overview.priorityGaps}
            focusKey={focusKey}
            pendingPickId={pendingPickId}
            pendingAction={pendingAction}
            actionsDisabled={actionsDisabled}
            productGeneration={overview.productGeneration}
            onAction={onAction}
          />
        </>
      )}
      <SupportingSections overview={overview} />
      {allGaps.length > 0 ? (
        <GapSection
          title={t("sections.consider")}
          icon={
            <Lightbulb
              className="h-3.5 w-3.5 text-accent-strong"
              aria-hidden="true"
            />
          }
          iconTestId="smart-picks-consider-section-icon"
          gaps={overview.considerGaps}
          focusKey={focusKey}
          pendingPickId={pendingPickId}
          pendingAction={pendingAction}
          actionsDisabled={actionsDisabled}
          productGeneration={overview.productGeneration}
          onAction={onAction}
        />
      ) : null}
      <section className="rounded-2xl border border-border bg-surface-muted p-4 text-center sm:p-5">
        <p className="inline-flex items-center justify-center gap-1.5 font-display text-sm font-bold text-foreground">
          <Leaf className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {t("footer.title")}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted sm:text-[13px]">
          {t("footer.body")}
        </p>
      </section>
    </div>
  );
}

function GapSection({
  title,
  icon,
  iconTestId,
  gaps,
  focusKey,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  productGeneration,
  onAction,
}: {
  title: string;
  icon?: ReactNode;
  iconTestId?: string;
  gaps: SmartPicksGap[];
  focusKey: string;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  productGeneration: SmartPicksProductGenerationState;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  if (gaps.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-muted">
        {icon ? (
          <span className="inline-flex shrink-0" data-testid={iconTestId}>
            {icon}
          </span>
        ) : null}
        <span>{title}</span>
      </h2>
      <div className="flex flex-col gap-4">
        {gaps.map((gap) => (
          <GapCard
            key={gap.normalizedKey}
            gap={gap}
            highlighted={
              focusKey === gap.normalizedKey ||
              focusKey === normalizeFocusKey(gap.ingredientOrCategory)
            }
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

function readMode(value: string | null): SmartPicksMode | undefined {
  return value === "starter" || value === "refine" ? value : undefined;
}
