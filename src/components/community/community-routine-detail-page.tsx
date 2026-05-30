"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Flag,
  ShieldCheck,
  Sparkles,
  Wand2,
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
import { GoalPlaybookEvidence } from "./community-goal-playbook-evidence";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { CommunityOutcomeSignals } from "./community-outcome-signals";
import {
  changeMeta,
  resolveChange,
  SafetyBanner,
  summaryLabels,
  type ChangeKind,
} from "./community-routine-detail-helpers";
import type { CommunityAdaptation } from "@/types/community";
import {
  Badge,
  Chip,
  CommunityAdaptResultSkeleton,
  CommunityDetailSkeleton,
  InlineSpinner,
  MatchBadge,
} from "./community-shared";

export function CommunityRoutineDetailPage({
  routineId,
}: {
  routineId: string;
}) {
  const t = useTranslations("community.routineDetail");
  const tToast = useTranslations("community.toasts");
  const options = useCommunityTranslatedOptions();
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
      toast.success(tToast("routineAdapted"));
    },
    onError: () => toast.error(tToast("routineAdaptFailed")),
  });
  const save = useMutation({
    mutationFn: (adaptationId: string) =>
      saveCommunityAdaptation(routineId, adaptationId),
    onSuccess: () => toast.success(tToast("adaptationSaved")),
    onError: () => toast.error(tToast("adaptationSaveFailed")),
  });
  const report = useMutation({
    mutationFn: () => reportCommunityRoutine(routineId, "unsafe_advice"),
    onSuccess: () => toast.success(tToast("reportSubmitted")),
    onError: () => toast.error(tToast("reportFailed")),
  });

  if (query.isLoading) {
    return <CommunityDetailSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <RetryPanel
        title={t("loadErrorTitle")}
        description={t("loadErrorBody")}
        actionLabel={t("tryAgain")}
        onAction={() => void query.refetch()}
        hideSupportLink
      />
    );
  }

  const routine = query.data;
  const flagged = routine.safetyFlags.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 motion-safe:animate-in motion-safe:fade-in">
      <PageHeader
        title={routine.title}
        subtitle={t("subtitle")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={AppRoute.Community}>
                <ArrowLeft className="h-4 w-4" />
                {t("backToCommunity")}
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
              {report.isPending ? t("reporting") : t("report")}
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
        <GoalPlaybookEvidence routine={routine} />
        <CommunityOutcomeSignals
          contentId={routine.id}
          contentType="routine"
          counts={routine.outcomeSignalCounts}
        />

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
              {t("safetyScanned")}
            </div>
          )}
        </div>
      </section>

      {/* Shared playbook steps */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            {t("stepsTitle")}
          </h2>
          <Badge tone="muted">{t("stepsCount", { count: routine.steps.length })}</Badge>
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
                      .join(" ") || t("categoryOnlyStep")}
                  </span>
                  <Badge tone="muted">
                    {labelFromOptions(options.productCategories, step.category) ??
                      humaniseCommunityTag(step.category)}
                  </Badge>
                  <Badge tone="muted">
                    {labelFromOptions(options.reviewRoutineSlots, step.slot) ??
                      humaniseCommunityTag(step.slot)}
                  </Badge>
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-ai-soft px-2.5 py-1 text-xs font-semibold text-ai-fg">
              <Sparkles className="h-3 w-3" />
              {t("adaptLabel")}
            </div>
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground">
              {t("adaptTitle")}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
              {t("adaptBody")}
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
              ? t("adapting")
              : adaptation
                ? t("adaptAgain")
                : t("adaptAction")}
          </Button>
        </div>

        {adapt.isPending && !adaptation ? (
          <CommunityAdaptResultSkeleton />
        ) : null}

        {adaptation ? (
          <div className="mt-5 grid gap-4">
            {/* Summary stats */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {Object.entries(adaptation.summary).map(([key, value]) => {
                const meta =
                  summaryLabels[key.toLowerCase()] ?? {
                    labelKey: "summary.kept",
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
                    <div className="mt-2 text-xs font-medium text-muted">
                      {t(meta.labelKey)}
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
                  : labelFromOptions(options.productCategories, change.category) ??
                    humaniseCommunityTag(change.category);
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
                            // `text-surface` auto-inverts per
                            // theme so the icon reads against
                            // each filled tone in both light
                            // and dark mode. `text-white` would
                            // wash out against the lighter
                            // dark-mode shades of accent/ai/
                            // warning.
                            "flex h-7 w-7 items-center justify-center rounded-lg",
                            palette.badge === "accent" &&
                              "bg-accent text-surface",
                            palette.badge === "ai" &&
                              "bg-ai text-surface",
                            palette.badge === "warning" &&
                              "bg-warning text-surface",
                            palette.badge === "muted" &&
                              "bg-surface text-muted",
                          )}
                        >
                          <palette.Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {t("changeStep", {
                            step: change.stepOrder,
                            label: t(palette.labelKey),
                          })}
                        </span>
                      </div>
                      <Badge tone={palette.badge}>{t(`changeType.${kind}`)}</Badge>
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
                {save.isPending ? t("saving") : t("saveAdaptation")}
              </Button>
              <p className="text-xs leading-5 text-muted">
                {t("saveAdaptationHint")}
              </p>
            </div>
          </div>
        ) : adapt.isError ? (
          <p
            className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {t("adaptError")}
          </p>
        ) : null}
      </section>
    </div>
  );
}
