"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, type LucideIcon } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import {
  listCommunityReviewResults,
  listCommunityRoutineResults,
} from "@/services/community.service";
import type {
  CommunityOutcomeSignal,
  CommunityReviewResultsResponse,
} from "@/types/community";
import {
  CommunityAutoLoadState,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import { CommunityOutcomeResultCard } from "./community-outcome-result-card";
import {
  PRIMARY_SIGNALS,
  SIGNAL_ICON_CLASS,
  SIGNAL_META,
  type PrimaryCommunityOutcomeSignal,
} from "./community-outcome-signal-meta";
import { EmptyState } from "./community-shared";

const COMMUNITY_RESULTS_PAGE_SIZE = 12;

type CommunityOutcomeResultsSheetProps = {
  contentId: string;
  contentTitle?: string;
  contentType: "routine" | "review";
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CommunityOutcomeResultsSheet({
  contentId,
  contentTitle,
  contentType,
  onOpenChange,
  open,
}: CommunityOutcomeResultsSheetProps) {
  const t = useTranslations("community.outcomeSignals");
  const [signalFilter, setSignalFilter] = useState<CommunityOutcomeSignal | "">(
    "",
  );
  const query = useInfiniteQuery({
    enabled: open,
    queryKey: [
      QueryKey.CommunityOutcomeResults,
      contentType,
      contentId,
      signalFilter,
    ],
    queryFn: ({ pageParam, signal }) =>
      contentType === "review"
        ? listCommunityReviewResults(
            contentId,
            {
              cursor: pageParam,
              limit: COMMUNITY_RESULTS_PAGE_SIZE,
              signal: signalFilter,
            },
            signal,
          )
        : listCommunityRoutineResults(
            contentId,
            {
              cursor: pageParam,
              limit: COMMUNITY_RESULTS_PAGE_SIZE,
              signal: signalFilter,
            },
            signal,
          ),
    initialPageParam: null as string | null,
    getNextPageParam: getNextResultsPageParam,
  });
  const resultItems = query.data?.pages.flatMap((page) => page.items) ?? [];
  const resultCount = resultItems.length;
  const showResultCount = Boolean(query.data);
  const isInitialError = query.isError && resultItems.length === 0;
  const paginationSentinelRef = useCommunityAutoLoad({
    compact: false,
    hasLoadMoreError: Boolean(query.isFetchNextPageError),
    hasNextPage: Boolean(query.hasNextPage),
    isError: isInitialError,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    itemCount: resultItems.length,
    onLoadMore: () => query.fetchNextPage(),
  });
  const showPaginationState =
    resultItems.length > 0 &&
    (query.hasNextPage ||
      query.isFetchingNextPage ||
      query.isFetchNextPageError);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
        <div className="space-y-3 border-b border-border py-4 pl-4 pr-12 sm:pl-6 sm:pr-14">
          <div>
            {contentTitle ? (
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-medium text-muted">
                  {t("resultsTitle")}
                </p>
                {showResultCount ? (
                  <p
                    className="text-[11px] font-medium tabular-nums text-muted"
                    aria-live="polite"
                  >
                    {t("resultsCount", { count: resultCount })}
                  </p>
                ) : null}
              </div>
            ) : null}
            <SheetTitle
              className={cn(
                "block truncate font-display font-bold leading-tight text-foreground",
                contentTitle ? "mt-0.5 text-base" : "text-lg",
              )}
              title={contentTitle}
            >
              {contentTitle ?? t("resultsTitle")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("resultsDescription")}
            </SheetDescription>
          </div>
          <FilterBar
            activeSignal={signalFilter}
            onSignalChange={setSignalFilter}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {query.isLoading ? <ResultsSkeleton /> : null}

          {isInitialError ? (
            <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {t("resultsLoadError")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void query.refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : null}

          {query.data && resultItems.length === 0 ? (
            <EmptyState
              title={t("resultsEmptyTitle")}
              body={t("resultsEmptyDescription")}
            />
          ) : null}

          {query.data && resultItems.length > 0 ? (
            <div className="grid gap-2">
              {resultItems.map((item) => (
                <CommunityOutcomeResultCard
                  key={item.id}
                  contentType={contentType}
                  item={item}
                />
              ))}
            </div>
          ) : null}
          {showPaginationState ? (
            <CommunityAutoLoadState
              hasLoadMoreError={Boolean(query.isFetchNextPageError)}
              isFetchingNextPage={query.isFetchingNextPage}
              onRetryLoadMore={() => {
                void query.fetchNextPage();
              }}
              sentinelRef={paginationSentinelRef}
              testId="community-results-load-more-sentinel"
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getNextResultsPageParam(
  lastPage: CommunityReviewResultsResponse,
  _allPages: CommunityReviewResultsResponse[],
  lastPageParam: string | null,
  allPageParams: Array<string | null>,
): string | undefined {
  const nextCursor = lastPage.nextCursor ?? null;
  if (!nextCursor) return undefined;
  if (nextCursor === lastPageParam || allPageParams.includes(nextCursor)) {
    return undefined;
  }
  return nextCursor;
}

function FilterBar({
  activeSignal,
  onSignalChange,
}: {
  activeSignal: CommunityOutcomeSignal | "";
  onSignalChange: (next: CommunityOutcomeSignal | "") => void;
}) {
  const t = useTranslations("community.outcomeSignals");
  const tShort = useTranslations("community.outcomeSignals.shortLabels");

  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={t("filterLabel")}
    >
      <FilterPill
        active={activeSignal === ""}
        label={t("filterAll")}
        onClick={() => onSignalChange("")}
      />
      {PRIMARY_SIGNALS.map((signal) => (
        <FilterPill
          key={signal}
          active={activeSignal === signal}
          icon={SIGNAL_META[signal].Icon}
          label={tShort(signal)}
          onClick={() => onSignalChange(signal)}
          tone={signal}
        />
      ))}
    </div>
  );
}

function FilterPill({
  active,
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: PrimaryCommunityOutcomeSignal;
}) {
  const activeClass = tone
    ? cn(SIGNAL_ICON_CLASS[SIGNAL_META[tone].tone], "border-transparent")
    : "border-border-strong bg-surface-muted text-foreground";
  const inactiveClass =
    "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition",
        active ? activeClass : inactiveClass,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
      {label}
    </button>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-busy className="grid gap-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-border p-3 sm:p-3.5"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8" />
            <Skeleton className="h-4 min-w-0 flex-1 rounded-md" />
            <Skeleton className="h-3 w-16 shrink-0 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-3 w-full rounded-md" />
          <Skeleton className="mt-1.5 h-3 w-2/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}
