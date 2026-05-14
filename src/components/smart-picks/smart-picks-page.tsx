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
import { useSmartPicksOverview } from "@/hooks/use-smart-picks";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
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
  const overview = useSmartPicksOverview(mode);
  const recordAction = useRecordSuggestionGapAction();
  const activeMode = mode ?? overview.data?.mode ?? "refine";
  const pendingPickId =
    recordAction.isPending && recordAction.variables?.sourceType === "smart_pick"
      ? (recordAction.variables.smartPickProductSuggestionId ?? null)
      : null;
  const pendingAction =
    recordAction.isPending && recordAction.variables?.sourceType === "smart_pick"
      ? recordAction.variables.action
      : null;
  const actionsDisabled =
    recordAction.isPending && recordAction.variables?.sourceType === "smart_pick";
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

      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeSwitch value={activeMode} onChange={setMode} />
          {overview.isFetching && !overview.isLoading ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {t("refreshing")}
            </span>
          ) : null}
        </div>

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
        {overview.data ? (
          <SmartPicksContent
            overview={overview.data}
            allGaps={allGaps}
            focusKey={focusKey}
            pendingPickId={pendingPickId}
            pendingAction={pendingAction}
            actionsDisabled={actionsDisabled}
            onAction={handleAction}
          />
        ) : null}
      </div>
    </div>
  );
}

function SmartPicksContent({
  overview,
  allGaps,
  focusKey,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  onAction,
}: {
  overview: NonNullable<ReturnType<typeof useSmartPicksOverview>["data"]>;
  allGaps: SmartPicksGap[];
  focusKey: string;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  const t = useTranslations("smartPicks.page");
  const shouldBlockSmartPicks =
    overview.skinProfileRequired || overview.consentRequired;

  if (shouldBlockSmartPicks)
    return <SmartPicksEmptyState overview={overview} />;

  if (overview.mode === "starter") {
    return (
      <div className="space-y-5">
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
    <div className="space-y-5">
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
