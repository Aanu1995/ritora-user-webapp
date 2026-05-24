"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Check,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { acceptCommunityGuidelines } from "@/services/community.service";
import type { CommunityPostingEligibility } from "@/types/community";
import {
  InlineSpinner,
  formatEligibilityDate,
  formatEligibilityReasonTitle,
} from "./community-shared";
import {
  PublishRoutineForm,
  WriteReviewForm,
} from "./community-publish-forms";

export function PublishPanel({
  eligibility,
  onExplainBlocked,
}: {
  eligibility: CommunityPostingEligibility;
  onExplainBlocked: () => void;
}) {
  return (
    <div className="space-y-4">
      <EligibilityGate
        eligibility={eligibility}
        onExplainBlocked={onExplainBlocked}
      />
      {eligibility.eligible ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <WriteReviewForm />
          <PublishRoutineForm />
        </div>
      ) : null}
    </div>
  );
}

export function PostingEligibilityDialog({
  eligibility,
  onOpenChange,
  open,
}: {
  eligibility: CommunityPostingEligibility;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const queryClient = useQueryClient();
  const needsGuidelines = eligibility.reasons.some(
    (reason) => reason.code === "community_guidelines_required",
  );
  const accept = useMutation({
    mutationFn: acceptCommunityGuidelines,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityEligibility],
      });
      toast.success("Community guidelines accepted.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? "Could not accept guidelines."),
  });
  const primaryReason = eligibility.reasons[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Community posting is not available yet</DialogTitle>
          <DialogDescription>
            You can keep browsing Community, but reviews and routines can only
            be shared after these launch safety checks pass.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid gap-2">
          {eligibility.reasons.map((reason) => (
            <div
              key={reason.code}
              className="flex gap-3 rounded-xl border border-border bg-surface-muted/60 p-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {formatEligibilityReasonTitle(reason.code)}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {reason.code === "account_too_new"
                    ? `Posting unlocks on ${formatEligibilityDate(eligibility.eligibleAt)}.`
                    : reason.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {primaryReason ? (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm leading-6 text-warning">
            {primaryReason.code === "account_too_new"
              ? `Your account is ${eligibility.accountAgeDays} day${
                  eligibility.accountAgeDays === 1 ? "" : "s"
                } old. Posting opens after ${eligibility.minimumAccountAgeDays} days.`
              : primaryReason.message}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {!eligibility.emailVerified ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.ResendVerification}>Verify email</Link>
            </Button>
          ) : null}
          {!eligibility.hasCompletedSkinProfile ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.SkinProfile}>Complete profile</Link>
            </Button>
          ) : null}
          {!eligibility.hasShelfProduct ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.Shelf}>Add shelf product</Link>
            </Button>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {needsGuidelines ? (
            <Button
              size="sm"
              type="button"
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
            >
              {accept.isPending ? (
                <InlineSpinner />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {accept.isPending ? "Accepting…" : "Accept rules"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EligibilityGate({
  eligibility,
  onExplainBlocked,
}: {
  eligibility: CommunityPostingEligibility;
  onExplainBlocked: () => void;
}) {
  const queryClient = useQueryClient();
  const needsGuidelines = eligibility.reasons.some(
    (reason) => reason.code === "community_guidelines_required",
  );
  const accept = useMutation({
    mutationFn: acceptCommunityGuidelines,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityEligibility],
      });
      toast.success("Community guidelines accepted.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? "Could not accept guidelines."),
  });

  if (eligibility.eligible) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-accent-strong">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-sm font-bold tracking-tight">
            Posting is unlocked
          </div>
          <p className="mt-1 text-sm leading-6">
            Your account meets Ritora&apos;s launch posting requirements. Share
            a review or a routine — Ritora will scan it before publishing.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground">
            <LockKeyhole className="h-5 w-5 text-accent" />
            Posting unlock requirements
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            You can browse Community now. Publishing unlocks after trust checks
            pass, including a {eligibility.minimumAccountAgeDays}-day account
            age.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsGuidelines ? (
            <Button
              type="button"
              size="sm"
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
            >
              {accept.isPending ? (
                <InlineSpinner />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {accept.isPending ? "Accepting…" : "Accept rules"}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExplainBlocked}
          >
            <AlertTriangle className="h-4 w-4" />
            Why not now?
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <EligibilityItem
          detail="Required before public posting."
          label="Verified email"
          ok={eligibility.emailVerified}
        />
        <EligibilityItem
          detail="Needed for privacy-safe matching facets."
          label="Completed skin profile"
          ok={eligibility.hasCompletedSkinProfile}
        />
        <EligibilityItem
          detail="Required for product-linked reviews and routines."
          label="Shelf product added"
          ok={eligibility.hasShelfProduct}
        />
        <EligibilityItem
          detail="Includes disclosure and safety rules."
          label="Guidelines accepted"
          ok={eligibility.hasAcceptedGuidelines}
        />
        <EligibilityItem
          detail={`Current account age: ${eligibility.accountAgeDays} day${
            eligibility.accountAgeDays === 1 ? "" : "s"
          }.`}
          label={`${eligibility.minimumAccountAgeDays}-day account age`}
          ok={eligibility.accountAgeDays >= eligibility.minimumAccountAgeDays}
        />
        <EligibilityItem
          detail="Severe recent violations temporarily pause posting."
          label="No recent moderation abuse"
          ok={
            !eligibility.reasons.some(
              (reason) => reason.code === "recent_moderation_abuse",
            )
          }
        />
      </div>
      {eligibility.reasons.length > 0 ? (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm leading-6 text-warning">
          {eligibility.reasons[0]?.code === "account_too_new"
            ? `Posting unlocks on ${formatEligibilityDate(eligibility.eligibleAt)}.`
            : eligibility.reasons[0]?.message}
        </div>
      ) : null}
    </section>
  );
}

function EligibilityItem({
  detail,
  label,
  ok,
}: {
  detail: string;
  label: string;
  ok: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-border-strong">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          ok
            ? "bg-accent text-white"
            : "bg-warning-soft text-warning",
        )}
      >
        {ok ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
      </div>
    </div>
  );
}
