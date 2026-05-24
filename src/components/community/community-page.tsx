"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageSquarePlus, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { QueryKey } from "@/constants/query-keys";
import { getCommunityHome } from "@/services/community.service";
import { PostingEligibilityDialog } from "./community-eligibility";
import { CommunityTabs, FacetStrip } from "./community-facet-tabs";
import {
  ForYou,
  PeopleLikeMe,
  ReviewList,
  RoutineList,
} from "./community-lists";
import {
  ShareWhatWorkedSheet,
  WriteReviewSheet,
} from "./community-share-sheet";
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
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const [tab, setTab] = useState<CommunityTab>(() =>
    parseCommunityTab(initialTabParam),
  );
  const [composer, setComposer] = useState<CommunityComposer>(() =>
    parseCommunityComposer(initialTabParam),
  );
  const [postingDialogOpen, setPostingDialogOpen] = useState(false);
  const query = useQuery({
    queryKey: [QueryKey.CommunityHome],
    queryFn: ({ signal }) => getCommunityHome(signal),
  });

  if (query.isLoading) {
    return <CommunitySkeleton />;
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
      {/* Full-width page header — only this stays at the outer width. */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setComposer(null);
              setTab("people");
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("topMatches")}
          </Button>
        }
      />

      {/* 75% column for chrome (facet strip + tabs) and the tab
          content below them. Everything beneath the page header lives
          at the same width. */}
      <div className="mx-auto mt-2 w-full max-w-[54rem]">
        <FacetStrip data={data} />
        <CommunityTabs active={tab} onChange={handleTabChange} />

        <div className="mt-4 space-y-6">
          {tab === "for-you" ? <ForYou data={data} /> : null}
          {tab === "people" ? <PeopleLikeMe data={data} /> : null}
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
              routines={data.routines}
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
              reviews={data.reviews}
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
    "for-you",
    "people",
    "routines",
    "reviews",
    "submissions",
    "trust",
  ]);
  return value && tabs.has(value as CommunityTab)
    ? (value as CommunityTab)
    : "for-you";
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
