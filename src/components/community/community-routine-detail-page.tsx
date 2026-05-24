"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRightLeft,
  Bookmark,
  Check,
  Flag,
  Info,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import {
  adaptCommunityRoutine,
  getCommunityRoutine,
  reportCommunityRoutine,
  saveCommunityAdaptation,
} from "@/services/community.service";
import type { CommunityAdaptation } from "@/types/community";
import {
  Badge,
  Chip,
  CommunityDetailSkeleton,
  InlineSpinner,
  MatchBadge,
  SafetyChip,
} from "./community-shared";

/* ===========================================================
 * Adapt-to-shelf colour map. The change types are tone-coded
 * consistently — green for kept, indigo for swap, amber for
 * remove, muted for gap — so the diff reads at a glance.
 * ========================================================= */

type ChangeKind = "kept" | "swapped" | "removed" | "gap";

const changeMeta: Record<
  ChangeKind,
  {
    Icon: typeof Check;
    label: string;
    accent: string;
    badge: "accent" | "ai" | "warning" | "muted";
  }
> = {
  kept: {
    Icon: Check,
    label: "Kept from your shelf",
    accent: "border-accent/30 bg-accent-soft",
    badge: "accent",
  },
  swapped: {
    Icon: ArrowRightLeft,
    label: "Swapped to an equivalent",
    accent: "border-ai-border bg-ai-soft",
    badge: "ai",
  },
  removed: {
    Icon: X,
    label: "Removed for safety",
    accent: "border-warning/30 bg-warning-soft",
    badge: "warning",
  },
  gap: {
    Icon: Info,
    label: "Honest gap",
    accent: "border-border-strong bg-surface-muted/60",
    badge: "muted",
  },
};

function resolveChange(value: string): ChangeKind {
  const normalised = value.toLowerCase();
  if (normalised.includes("kept") || normalised.includes("match"))
    return "kept";
  if (normalised.includes("swap") || normalised.includes("substitut"))
    return "swapped";
  if (normalised.includes("remov") || normalised.includes("block"))
    return "removed";
  if (normalised.includes("gap") || normalised.includes("missing"))
    return "gap";
  return "kept";
}

const summaryLabels: Record<string, { label: string; kind: ChangeKind }> = {
  matched: { label: "Kept from your shelf", kind: "kept" },
  kept: { label: "Kept from your shelf", kind: "kept" },
  swapped: { label: "Swapped to alternative", kind: "swapped" },
  substituted: { label: "Swapped to alternative", kind: "swapped" },
  removed: { label: "Removed for safety", kind: "removed" },
  blocked: { label: "Removed for safety", kind: "removed" },
  gaps: { label: "Honest gaps", kind: "gap" },
  gap: { label: "Honest gaps", kind: "gap" },
};

export function CommunityRoutineDetailPage({
  routineId,
}: {
  routineId: string;
}) {
  const [adaptation, setAdaptation] = useState<CommunityAdaptation | null>(
    null,
  );
  const query = useQuery({
    queryKey: [QueryKey.CommunityRoutine, routineId],
    queryFn: ({ signal }) => getCommunityRoutine(routineId, signal),
  });
  const adapt = useMutation({
    mutationFn: () => adaptCommunityRoutine(routineId),
    onSuccess: (result) => {
      setAdaptation(result);
      toast.success("Routine adapted to your shelf.");
    },
    onError: () => toast.error("Routine could not be adapted right now."),
  });
  const save = useMutation({
    mutationFn: (adaptationId: string) =>
      saveCommunityAdaptation(routineId, adaptationId),
    onSuccess: () => toast.success("Adaptation saved."),
    onError: () => toast.error("Could not save adaptation."),
  });
  const report = useMutation({
    mutationFn: () => reportCommunityRoutine(routineId, "unsafe_advice"),
    onSuccess: () => toast.success("Report submitted for moderation."),
    onError: () => toast.error("Could not submit report."),
  });

  if (query.isLoading) {
    return <CommunityDetailSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <RetryPanel
        title="Routine could not load"
        description="This community routine may be unavailable or under moderation."
        actionLabel="Try again"
        onAction={() => void query.refetch()}
        hideSupportLink
      />
    );
  }

  const routine = query.data;
  const flagged = routine.safetyFlags.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <PageHeader
        title={routine.title}
        subtitle="Community routine — adapt it safely to your shelf"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={AppRoute.Community}>
                <ArrowLeft className="h-4 w-4" />
                Community
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => report.mutate()}
              disabled={report.isPending}
            >
              {report.isPending ? (
                <InlineSpinner />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              {report.isPending ? "Reporting…" : "Report"}
            </Button>
          </div>
        }
      />

      {/* Match block */}
      <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft via-surface to-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <MatchBadge score={routine.matchScore} />
          {routine.relevanceReasons.slice(0, 3).map((reason) => (
            <Chip key={reason}>
              <Check className="h-3 w-3 text-accent-strong" />
              {reason}
            </Chip>
          ))}
        </div>
        {routine.summary ? (
          <p className="mt-4 text-sm leading-6 text-foreground">
            {routine.summary}
          </p>
        ) : null}

        {/* Safety strip */}
        <div className="mt-4">
          {flagged ? (
            <div className="grid gap-2">
              {routine.safetyFlags.map((flag) => (
                <SafetyBanner key={flag.code} severity={flag.severity}>
                  {flag.message}
                </SafetyBanner>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-medium text-accent-strong">
              <ShieldCheck className="h-4 w-4" />
              Safety scanned — no high-risk flags detected.
            </div>
          )}
        </div>
      </section>

      {/* Shared routine steps */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Shared routine
          </h2>
          <Badge tone="muted">{routine.steps.length} steps</Badge>
        </div>
        <div className="grid gap-2">
          {routine.steps.map((step) => (
            <div
              key={`${routine.id}-${step.stepOrder}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted font-display text-sm font-bold text-foreground">
                {step.stepOrder}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {[step.productBrand, step.productName]
                      .filter(Boolean)
                      .join(" ") || "Category-only step"}
                  </span>
                  <Badge tone="muted">{step.category}</Badge>
                  <Badge tone="muted">{step.slot}</Badge>
                </div>
                {step.notes ? (
                  <p className="mt-2 text-sm leading-5 text-muted">
                    {step.notes}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adapt to my shelf hero */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ai-border bg-ai-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ai-fg">
              <Sparkles className="h-3 w-3" />
              Hero · Adapt to my shelf
            </div>
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground">
              Translate this routine to what you already own
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
              Ritora keeps exact matches, swaps in safe alternatives from your
              shelf, removes unsafe steps and surfaces honest gaps as
              categories — never as forced purchases.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => adapt.mutate()}
            disabled={adapt.isPending}
          >
            {adapt.isPending ? (
              <InlineSpinner />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {adapt.isPending
              ? "Adapting…"
              : adaptation
                ? "Adapt again"
                : "Adapt to my shelf"}
          </Button>
        </div>

        {adapt.isPending && !adaptation ? (
          <div className="mt-5 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-surface-muted"
                />
              ))}
            </div>
            <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
          </div>
        ) : null}

        {adaptation ? (
          <div className="mt-5 grid gap-4">
            {/* Summary stats */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {Object.entries(adaptation.summary).map(([key, value]) => {
                const meta =
                  summaryLabels[key.toLowerCase()] ?? {
                    label: key,
                    kind: "kept" as ChangeKind,
                  };
                const palette = changeMeta[meta.kind];
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-2xl border p-4 text-center",
                      palette.accent,
                    )}
                  >
                    <div className="font-display text-3xl font-bold leading-none text-foreground">
                      {value}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {meta.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Change rows */}
            <div className="grid gap-2">
              {adaptation.changes.map((change) => {
                const kind = resolveChange(change.changeType);
                const palette = changeMeta[kind];
                const productLabel = change.targetProductName
                  ? `${change.targetProductBrand ?? ""} ${change.targetProductName}`.trim()
                  : change.category;
                return (
                  <article
                    key={`${change.stepOrder}-${change.changeType}`}
                    className={cn(
                      "rounded-2xl border p-4",
                      palette.accent,
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg",
                            palette.badge === "accent" &&
                              "bg-accent text-white",
                            palette.badge === "ai" &&
                              "bg-ai text-white",
                            palette.badge === "warning" &&
                              "bg-warning text-white",
                            palette.badge === "muted" &&
                              "bg-surface text-muted",
                          )}
                        >
                          <palette.Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          Step {change.stepOrder} · {palette.label}
                        </span>
                      </div>
                      <Badge tone={palette.badge}>{change.changeType}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {productLabel}
                    </p>
                    {change.reason ? (
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {change.reason}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Button
                size="sm"
                onClick={() => save.mutate(adaptation.id)}
                disabled={save.isPending}
              >
                {save.isPending ? (
                  <InlineSpinner />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {save.isPending ? "Saving…" : "Save adaptation"}
              </Button>
              <p className="text-xs leading-5 text-muted">
                Saving keeps the adapted version on your account. Your routine
                isn&apos;t replaced unless you choose to do it.
              </p>
            </div>
          </div>
        ) : adapt.isError ? (
          <p
            className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            role="alert"
          >
            Something went wrong adapting this routine. Try again, or report it
            if the problem keeps happening.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function SafetyBanner({
  children,
  severity,
}: {
  children: React.ReactNode;
  severity: "info" | "low" | "medium" | "high";
}) {
  const high = severity === "high";
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm leading-5",
        high
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-warning/30 bg-warning-soft text-warning",
      )}
      role="alert"
    >
      <SafetyChip severity={severity}>
        {high ? "High" : severity === "info" ? "Note" : "Watch"}
      </SafetyChip>
      <span className="flex-1 text-foreground">{children}</span>
    </div>
  );
}
