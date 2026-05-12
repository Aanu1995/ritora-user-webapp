"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bookmark, Leaf, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { useSmartPicksOverview } from "@/hooks/use-smart-picks";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
import type { SmartPicksGap, SmartPicksMode } from "@/types/smart-picks";
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
    recordAction.mutate({
      sourceType: "smart_pick",
      smartPickProductSuggestionId: pickId,
      action,
    });
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
            pending={recordAction.isPending}
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
  pending,
  onAction,
}: {
  overview: NonNullable<ReturnType<typeof useSmartPicksOverview>["data"]>;
  allGaps: SmartPicksGap[];
  focusKey: string;
  pending: boolean;
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
        {overview.productSuggestionsUnavailable ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {t("productUnavailable")}
          </div>
        ) : null}
        {overview.starterKit.steps.length === 0 ? (
          <SmartPicksEmptyState overview={overview} />
        ) : (
          <StarterKitSection
            overview={overview}
            pending={pending}
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
      {overview.productSuggestionsUnavailable ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {t("productUnavailable")}
        </div>
      ) : null}
      {allGaps.length === 0 ? (
        <SmartPicksEmptyState overview={overview} />
      ) : (
        <>
          <GapSection
            title={t("sections.priority")}
            gaps={overview.priorityGaps}
            focusKey={focusKey}
            pending={pending}
            onAction={onAction}
          />
          <GapSection
            title={t("sections.consider")}
            gaps={overview.considerGaps}
            focusKey={focusKey}
            pending={pending}
            onAction={onAction}
          />
        </>
      )}
      <SupportingSections overview={overview} />
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
  gaps,
  focusKey,
  pending,
  onAction,
}: {
  title: string;
  gaps: SmartPicksGap[];
  focusKey: string;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}) {
  if (gaps.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        {gaps.map((gap) => (
          <GapCard
            key={gap.normalizedKey}
            gap={gap}
            highlighted={
              focusKey === gap.normalizedKey ||
              focusKey === normalizeFocusKey(gap.ingredientOrCategory)
            }
            pending={pending}
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
