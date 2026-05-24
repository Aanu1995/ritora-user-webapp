"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { QueryKey } from "@/constants/query-keys";
import { getCommunityHome } from "@/services/community.service";
import {
  PublishPanel,
  PostingEligibilityDialog,
} from "./community-eligibility";
import {
  CommunityTabs,
  FacetStrip,
  ForYou,
  PeopleLikeMe,
  ReviewList,
  RoutineList,
} from "./community-lists";
import { CommunitySkeleton, type CommunityTab } from "./community-shared";
import { MySubmissions } from "./community-submissions";
import { TrustPanel } from "./community-trust-panel";

export function CommunityPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<CommunityTab>(() =>
    parseCommunityTab(searchParams.get("tab")),
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
        title="Community could not load"
        description="Ritora could not fetch community evidence right now."
        actionLabel="Try again"
        onAction={() => void query.refetch()}
        hideSupportLink
      />
    );
  }

  const data = query.data;
  const handleTabChange = (nextTab: CommunityTab) => {
    setTab(nextTab);
    if (nextTab === "publish" && !data.postingEligibility.eligible) {
      setPostingDialogOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <PageHeader
        title="Community"
        subtitle="Ranked for people like you, then adapted safely to your shelf."
        action={
          <Button variant="outline" size="sm" onClick={() => setTab("people")}>
            <SlidersHorizontal className="h-4 w-4" />
            Tune match
          </Button>
        }
      />

      {/* Compact facet strip — replaces the old hero band */}
      <FacetStrip data={data} />

      {/* Sticky tab bar — stays in view as the user scrolls */}
      <CommunityTabs active={tab} onChange={handleTabChange} />

      {/* Tab content */}
      <div className="mt-4 space-y-6">
        {tab === "for-you" ? <ForYou data={data} /> : null}
        {tab === "people" ? <PeopleLikeMe data={data} /> : null}
        {tab === "routines" ? <RoutineList routines={data.routines} /> : null}
        {tab === "reviews" ? <ReviewList reviews={data.reviews} /> : null}
        {tab === "publish" ? (
          <PublishPanel
            eligibility={data.postingEligibility}
            onExplainBlocked={() => setPostingDialogOpen(true)}
          />
        ) : null}
        {tab === "submissions" ? <MySubmissions /> : null}
        {tab === "trust" ? <TrustPanel data={data} /> : null}
      </div>

      <PostingEligibilityDialog
        eligibility={data.postingEligibility}
        open={postingDialogOpen}
        onOpenChange={setPostingDialogOpen}
      />
    </div>
  );
}

function parseCommunityTab(value: string | null): CommunityTab {
  const tabs = new Set<CommunityTab>([
    "for-you",
    "people",
    "routines",
    "reviews",
    "publish",
    "submissions",
    "trust",
  ]);
  return value && tabs.has(value as CommunityTab)
    ? (value as CommunityTab)
    : "for-you";
}
