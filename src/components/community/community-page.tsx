"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { QueryKey } from "@/constants/query-keys";
import { getCommunityHome } from "@/services/community.service";
import { PublishPanel, PostingEligibilityDialog } from "./community-eligibility";
import {
  CommunityTabs,
  FacetPills,
  ForYou,
  PeopleLikeMe,
  ReviewList,
  RoutineList,
} from "./community-lists";
import {
  CommunitySkeleton,
  type CommunityTab,
} from "./community-shared";
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
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
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

      {/* Hero band — design system tokens only, no hard-coded palette. */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent-soft via-surface to-secondary-soft p-5 shadow-soft sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-strong">
          <UserCheck className="h-3.5 w-3.5" />
          Ranked by similarity, not popularity
        </div>
        <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          See what worked for people who share your skin, then let Ritora
          translate it.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Community reviews and routines use only privacy-safe profile facets.
          Your email, exact location, photos, medical context and private notes
          stay private.
        </p>
        <FacetPills data={data} />
      </section>

      <CommunityTabs active={tab} onChange={handleTabChange} />

      {tab === "for-you" ? (
        <ForYou data={data} onChangeTab={handleTabChange} />
      ) : null}
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
