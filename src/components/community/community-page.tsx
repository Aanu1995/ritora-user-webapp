"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageSquarePlus, TrendingUp, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import {
  useCommunityBookmarks,
  useCommunityPeopleLikeMe,
  useCommunityReviews,
  useCommunityRoutines,
} from "@/hooks/use-community";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";
import { isSkinProfileReady } from "@/lib/skin-profile-readiness";
import { getCommunityHome } from "@/services/community.service";
import type { CommunityListQuery } from "@/types/community";
import { BookmarksList } from "./community-bookmarks";
import { PostingEligibilityDialog } from "./community-eligibility";
import { CommunityTabs, FacetStrip } from "./community-facet-tabs";
import {
  PeopleLikeMe,
  ReviewList,
  RoutineList,
} from "./community-lists";
import {
  ShareWhatWorkedSheet,
  WriteReviewSheet,
} from "./community-share-sheet";
import {
  emptyPlaybookFilters,
  type CommunityPlaybookFilterState,
} from "./community-playbook-filters";
import {
  emptyReviewFilters,
  type CommunityReviewFilterState,
} from "./community-review-filters";
import { CommunitySkeleton, type CommunityTab } from "./community-shared";
import { MySubmissions } from "./community-submissions";
import { TrustPanel } from "./community-trust-panel";

type CommunityComposer = "playbook" | "review" | null;

/* ===========================================================
 * Community page.
 *
 * Layout:
 *   - PageHeader runs full page width (max-w-6xl).
 *   - FacetStrip, CommunityTabs and tab content sit inside a
 *     narrower 75% reading column so cards, filters and forms
 *     don't sprawl on wide displays.
 *   - Share + Write open as right-side Sheets so the page state
 *     doesn't reflow when the composer opens or closes.
 * ========================================================= */

export function CommunityPage() {
  const t = useTranslations("community");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const [tab, setTab] = useState<CommunityTab>(() =>
    parseCommunityTab(initialTabParam),
  );
  const [composer, setComposer] = useState<CommunityComposer>(() =>
    parseCommunityComposer(initialTabParam),
  );
  const [playbookFilters, setPlaybookFilters] = useState(emptyPlaybookFilters);
  const [reviewFilters, setReviewFilters] = useState(emptyReviewFilters);
  const debouncedPlaybookSearch = useDebouncedValue(
    playbookFilters.search,
    300,
  );
  const debouncedReviewSearch = useDebouncedValue(reviewFilters.search, 300);
  const playbookQueryFilters = buildPlaybookQueryFilters(
    playbookFilters,
    debouncedPlaybookSearch,
  );
  const reviewQueryFilters = buildReviewQueryFilters(
    reviewFilters,
    debouncedReviewSearch,
  );
  const [postingDialogOpen, setPostingDialogOpen] = useState(false);
  const [profileGateDismissed, setProfileGateDismissed] = useState(false);
  const skinProfile = useSkinProfile();
  const canUseCommunity = isSkinProfileReady(skinProfile.data);
  const profileRequiredOpen =
    !skinProfile.isLoading && !canUseCommunity && !profileGateDismissed;
  const profileFetchFailed =
    skinProfile.isError && getApiErrorStatus(skinProfile.error) !== 404;
  const profileDialogDescription = profileFetchFailed
    ? t("prerequisites.profile.loadError")
    : t("prerequisites.profile.body");
  const query = useQuery({
    queryKey: [QueryKey.CommunityHome],
    queryFn: ({ signal }) => getCommunityHome(signal),
    enabled: canUseCommunity,
  });
  const routinesQuery = useCommunityRoutines(
    playbookQueryFilters,
    canUseCommunity && tab === "routines",
  );
  const reviewsQuery = useCommunityReviews(
    reviewQueryFilters,
    canUseCommunity && tab === "reviews",
  );
  const peopleQuery = useCommunityPeopleLikeMe(
    canUseCommunity && tab === "people",
  );
  const bookmarksQuery = useCommunityBookmarks(
    canUseCommunity && tab === "bookmarks",
  );
  const activeTargetReady =
    tab === "people"
      ? !peopleQuery.isPending
      : tab === "routines"
      ? !routinesQuery.isPending
      : tab === "reviews"
        ? !reviewsQuery.isPending
        : tab === "bookmarks"
          ? !bookmarksQuery.isPending
        : true;

  useEffect(() => {
    if (!query.isSuccess || !activeTargetReady || !window.location.hash) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView({ block: "center" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeTargetReady, query.isSuccess, tab]);

  const openSkinProfile = () => {
    setProfileGateDismissed(true);
    router.push(AppRoute.SkinProfile);
  };

  const profileGateDialog = (
    <ConfirmDialog
      open={profileRequiredOpen}
      onOpenChange={(open) => {
        if (!open) {
          setProfileGateDismissed(true);
        }
      }}
      title={t("prerequisites.profile.title")}
      description={profileDialogDescription}
      confirmLabel={t("prerequisites.profile.cta")}
      onConfirm={openSkinProfile}
    />
  );

  if (skinProfile.isLoading || query.isLoading) {
    return <CommunitySkeleton />;
  }

  if (!canUseCommunity) {
    return (
      <div className="mx-auto max-w-6xl pb-10 motion-safe:animate-in motion-safe:fade-in">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <div className="mx-auto mt-2 w-full max-w-[54rem]">
          <section className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
              <UserCircle className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-foreground">
              {t("prerequisites.profile.title")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted">
              {profileDialogDescription}
            </p>
            <Button type="button" className="mt-4" onClick={openSkinProfile}>
              {t("prerequisites.profile.cta")}
            </Button>
          </section>
        </div>
        {profileGateDialog}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <RetryPanel
        title={t("errors.couldNotLoadTitle")}
        description={t("errors.couldNotLoadBody")}
        actionLabel={t("errors.tryAgain")}
        onAction={() => void query.refetch()}
        hideSupportLink
      />
    );
  }

  const data = query.data;
  const composerBlocked =
    composer !== null && !data.postingEligibility.eligible;
  const activeComposer = data.postingEligibility.eligible ? composer : null;
  const handleTabChange = (nextTab: CommunityTab) => {
    setComposer(null);
    setTab(nextTab);
  };
  const openComposer = (next: Exclude<CommunityComposer, null>) => {
    if (!data.postingEligibility.eligible) {
      setPostingDialogOpen(true);
      return;
    }
    setComposer(next);
  };
  const handlePostingDialogOpenChange = (next: boolean) => {
    setPostingDialogOpen(next);
    if (!next && composerBlocked) {
      setComposer(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-10 motion-safe:animate-in motion-safe:fade-in">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {/* 75% column for chrome (facet strip + tabs) and the tab
          content below them. Everything beneath the page header lives
          at the same width. */}
      <div className="mx-auto mt-2 w-full max-w-[54rem]">
        <FacetStrip data={data} />
        <CommunityTabs active={tab} onChange={handleTabChange} />

        <div className="mt-4 space-y-6">
          {tab === "people" ? (
            <PeopleLikeMe
              items={peopleQuery.data}
              isLoading={peopleQuery.isPending}
              isError={peopleQuery.isError}
              hasNextPage={Boolean(peopleQuery.hasNextPage)}
              isFetchingNextPage={peopleQuery.isFetchingNextPage}
              hasLoadMoreError={Boolean(peopleQuery.isFetchNextPageError)}
              onLoadMore={() => peopleQuery.fetchNextPage()}
              onRetryLoadMore={() => peopleQuery.fetchNextPage()}
              onRetryInitialLoad={() => {
                void peopleQuery.refetch();
              }}
            />
          ) : null}
          {tab === "routines" ? (
            <RoutineList
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openComposer("playbook")}
                >
                  <TrendingUp className="h-4 w-4" />
                  {t("share.playbookAction")}
                </Button>
              }
              routines={routinesQuery.data}
              filters={playbookFilters}
              onFiltersChange={setPlaybookFilters}
              isLoading={routinesQuery.isPending}
              isError={routinesQuery.isError}
              hasNextPage={Boolean(routinesQuery.hasNextPage)}
              isFetchingNextPage={routinesQuery.isFetchingNextPage}
              hasLoadMoreError={Boolean(routinesQuery.isFetchNextPageError)}
              onLoadMore={() => routinesQuery.fetchNextPage()}
              onRetryLoadMore={() => routinesQuery.fetchNextPage()}
              onRetryInitialLoad={() => {
                void routinesQuery.refetch();
              }}
            />
          ) : null}
          {tab === "reviews" ? (
            <ReviewList
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openComposer("review")}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  {t("share.reviewAction")}
                </Button>
              }
              reviews={reviewsQuery.data}
              filters={reviewFilters}
              onFiltersChange={setReviewFilters}
              isLoading={reviewsQuery.isPending}
              isError={reviewsQuery.isError}
              hasNextPage={Boolean(reviewsQuery.hasNextPage)}
              isFetchingNextPage={reviewsQuery.isFetchingNextPage}
              hasLoadMoreError={Boolean(reviewsQuery.isFetchNextPageError)}
              onLoadMore={() => reviewsQuery.fetchNextPage()}
              onRetryLoadMore={() => reviewsQuery.fetchNextPage()}
              onRetryInitialLoad={() => {
                void reviewsQuery.refetch();
              }}
            />
          ) : null}
          {tab === "bookmarks" ? (
            <BookmarksList
              items={bookmarksQuery.data}
              isLoading={bookmarksQuery.isPending}
              isError={bookmarksQuery.isError}
              hasNextPage={Boolean(bookmarksQuery.hasNextPage)}
              isFetchingNextPage={bookmarksQuery.isFetchingNextPage}
              hasLoadMoreError={Boolean(bookmarksQuery.isFetchNextPageError)}
              onLoadMore={() => bookmarksQuery.fetchNextPage()}
              onRetryLoadMore={() => bookmarksQuery.fetchNextPage()}
              onRetryInitialLoad={() => {
                void bookmarksQuery.refetch();
              }}
            />
          ) : null}
          {tab === "submissions" ? <MySubmissions /> : null}
          {tab === "trust" ? <TrustPanel data={data} /> : null}
        </div>
      </div>

      <PostingEligibilityDialog
        eligibility={data.postingEligibility}
        open={postingDialogOpen || composerBlocked}
        onOpenChange={handlePostingDialogOpenChange}
      />

      <WriteReviewSheet
        eligibility={data.postingEligibility}
        onExplainBlocked={() => setPostingDialogOpen(true)}
        open={activeComposer === "review"}
        onOpenChange={(next) => setComposer(next ? "review" : null)}
      />
      <ShareWhatWorkedSheet
        eligibility={data.postingEligibility}
        onExplainBlocked={() => setPostingDialogOpen(true)}
        open={activeComposer === "playbook"}
        onOpenChange={(next) => setComposer(next ? "playbook" : null)}
      />
      {profileGateDialog}
    </div>
  );
}

function parseCommunityTab(value: string | null): CommunityTab {
  if (value === "publish" || value === "write-review") {
    return "reviews";
  }
  if (value === "share-worked") {
    return "routines";
  }

  const tabs = new Set<CommunityTab>([
    "people",
    "routines",
    "reviews",
    "bookmarks",
    "submissions",
    "trust",
  ]);
  return value && tabs.has(value as CommunityTab)
    ? (value as CommunityTab)
    : "people";
}

function parseCommunityComposer(value: string | null): CommunityComposer {
  if (value === "publish" || value === "write-review") {
    return "review";
  }
  if (value === "share-worked") {
    return "playbook";
  }
  return null;
}

function buildPlaybookQueryFilters(
  filters: CommunityPlaybookFilterState,
  search: string,
): CommunityListQuery {
  return {
    avoidTag: filters.avoidTag,
    concern: filters.concern,
    disclosureType:
      filters.disclosureType as CommunityListQuery["disclosureType"],
    goal: filters.goal,
    habitTag: filters.habitTag,
    productRole: filters.productRole,
    result: filters.result as CommunityListQuery["result"],
    search,
    sensitivity: filters.sensitivity,
    skinType: filters.skinType,
    timeframe: filters.timeframe as CommunityListQuery["timeframe"],
    warningTag: filters.warningTag,
  };
}

function buildReviewQueryFilters(
  filters: CommunityReviewFilterState,
  search: string,
): CommunityListQuery {
  const minRating = Number(filters.minRating);

  return {
    concern: filters.concern,
    contextProductCategory: filters.contextProductCategory,
    disclosureType:
      filters.disclosureType as CommunityListQuery["disclosureType"],
    minRating:
      Number.isInteger(minRating) && minRating >= 1 && minRating <= 5
        ? minRating
        : null,
    productCategory: filters.productCategory,
    resultSignal: filters.resultSignal as CommunityListQuery["resultSignal"],
    routineContextUsage:
      filters.routineContextUsage as CommunityListQuery["routineContextUsage"],
    routineSlot: filters.routineSlot as CommunityListQuery["routineSlot"],
    search,
    sensitivity: filters.sensitivity,
    skinResponse: filters.skinResponse as CommunityListQuery["skinResponse"],
    skinType: filters.skinType,
    usageDuration: filters.usageDuration,
  };
}
