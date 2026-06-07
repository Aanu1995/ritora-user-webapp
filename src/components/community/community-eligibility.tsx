"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, LockKeyhole } from "lucide-react";
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
import { InlineSpinner, formatEligibilityDate } from "./community-shared";
import { PublishRoutineForm, WriteReviewForm } from "./community-publish-forms";

export function WriteReviewPanel({
  eligibility,
  onExplainBlocked,
  onSaved,
  onDirtyChange,
}: {
  eligibility: CommunityPostingEligibility;
  onExplainBlocked: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
}) {
  return (
    <PostingPanel eligibility={eligibility} onExplainBlocked={onExplainBlocked}>
      <WriteReviewForm onDirtyChange={onDirtyChange} onSaved={onSaved} />
    </PostingPanel>
  );
}

export function ShareWhatWorkedPanel({
  eligibility,
  onDirtyChange,
  onExplainBlocked,
  onSaved,
}: {
  eligibility: CommunityPostingEligibility;
  onDirtyChange?: (dirty: boolean) => void;
  onExplainBlocked: () => void;
  onSaved?: () => void;
}) {
  return (
    <PostingPanel eligibility={eligibility} onExplainBlocked={onExplainBlocked}>
      <PublishRoutineForm onDirtyChange={onDirtyChange} onSaved={onSaved} />
    </PostingPanel>
  );
}

function PostingPanel({
  children,
  eligibility,
  onExplainBlocked,
}: {
  children: ReactNode;
  eligibility: CommunityPostingEligibility;
  onExplainBlocked: () => void;
}) {
  return (
    <div className="space-y-4">
      <EligibilityGate
        eligibility={eligibility}
        onExplainBlocked={onExplainBlocked}
      />
      {eligibility.eligible ? children : null}
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
  const t = useTranslations("community.eligibility");
  const tReason = useTranslations("community.eligibility.reasonTitles");
  const tToast = useTranslations("community.toasts");
  const queryClient = useQueryClient();
  const needsGuidelines = eligibility.reasons.some(
    (reason) => reason.code === "community_guidelines_required",
  );
  const accept = useMutation({
    mutationFn: acceptCommunityGuidelines,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityEligibility],
      });
      toast.success(tToast("guidelinesAccepted"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("guidelinesFailed")),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        {/* Each blocking reason renders as its own pending-state
            card. Previously a duplicate "primary reason" banner
            was rendered below the list, repeating one of the
            cards above. Removed — the cards themselves are the
            single source of truth for what's blocking. */}
        <div className="mt-5 grid gap-2">
          {eligibility.reasons.map((reason) => (
            <div
              key={reason.code}
              className="flex gap-3 rounded-xl border border-warning/30 bg-warning-soft/40 p-3"
            >
              <div
                aria-hidden
                // `text-surface` auto-inverts for theme so the
                // icon stays readable against `--warning` in
                // both modes (dark amber in light, light amber
                // in dark).
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning text-surface"
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {tReason(reason.code)}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {reason.code === "account_too_new"
                    ? t("unlockDate", {
                        date: formatEligibilityDate(eligibility.eligibleAt),
                      })
                    : reason.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!eligibility.emailVerified ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.ResendVerification}>{t("verifyEmail")}</Link>
            </Button>
          ) : null}
          {!eligibility.hasCompletedSkinProfile ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.SkinProfile}>{t("completeProfile")}</Link>
            </Button>
          ) : null}
          {!eligibility.hasShelfProduct ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AppRoute.Shelf}>{t("addShelfProduct")}</Link>
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
            {t("close")}
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
              {accept.isPending ? t("accepting") : t("acceptRules")}
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
  const t = useTranslations("community.eligibility");
  const tItems = useTranslations("community.eligibility.items");
  const tToast = useTranslations("community.toasts");
  const queryClient = useQueryClient();
  const needsGuidelines = eligibility.reasons.some(
    (reason) => reason.code === "community_guidelines_required",
  );
  const accept = useMutation({
    mutationFn: acceptCommunityGuidelines,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityEligibility],
      });
      toast.success(tToast("guidelinesAccepted"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("guidelinesFailed")),
  });

  if (eligibility.eligible) {
    // No banner — the user can already see the publish forms below.
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground">
            <LockKeyhole className="h-5 w-5 text-accent" />
            {t("gateTitle")}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {t("gateIntro", { days: eligibility.minimumAccountAgeDays })}
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
              {accept.isPending ? t("accepting") : t("acceptRules")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExplainBlocked}
          >
            <AlertTriangle className="h-4 w-4" />
            {t("whyNotNow")}
          </Button>
        </div>
      </div>
      {/* Eligibility checklist. Pending items render in full
          contrast (foreground text, warning-soft icon) so the
          eye lands on them first. Satisfied items dim to muted
          so they read as "done, move on" — the user can scan
          the grid and tell what's still required without
          reading every label.
          The bottom "primary reason" warning banner that used
          to live below this grid was duplicating one of the
          items above. Removed in favor of a single source of
          truth: the pending item card itself surfaces the
          reason. */}
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <EligibilityItem
          detail={tItems("emailDetail")}
          label={tItems("emailLabel")}
          ok={eligibility.emailVerified}
        />
        <EligibilityItem
          detail={tItems("profileDetail")}
          label={tItems("profileLabel")}
          ok={eligibility.hasCompletedSkinProfile}
        />
        <EligibilityItem
          detail={tItems("shelfDetail")}
          label={tItems("shelfLabel")}
          ok={eligibility.hasShelfProduct}
        />
        <EligibilityItem
          detail={tItems("guidelinesDetail")}
          label={tItems("guidelinesLabel")}
          ok={eligibility.hasAcceptedGuidelines}
        />
        <EligibilityItem
          detail={
            eligibility.accountAgeDays >= eligibility.minimumAccountAgeDays
              ? tItems("ageDetail", { days: eligibility.accountAgeDays })
              : t("unlockDate", {
                  date: formatEligibilityDate(eligibility.eligibleAt),
                })
          }
          label={tItems("ageLabel", {
            days: eligibility.minimumAccountAgeDays,
          })}
          ok={eligibility.accountAgeDays >= eligibility.minimumAccountAgeDays}
        />
        <EligibilityItem
          detail={tItems("abuseDetail")}
          label={tItems("abuseLabel")}
          ok={
            !eligibility.reasons.some(
              (reason) => reason.code === "recent_moderation_abuse",
            )
          }
        />
      </div>
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
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3 transition",
        ok
          ? "border-border bg-surface-muted/40"
          : "border-warning/30 bg-warning-soft/40 hover:border-warning/50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          ok ? "bg-accent-soft text-accent-strong" : "bg-warning text-surface",
        )}
      >
        {ok ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            ok ? "text-muted" : "text-foreground",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-xs leading-5",
            ok ? "text-muted/80" : "text-muted",
          )}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}
