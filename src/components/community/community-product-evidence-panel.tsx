"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Ban,
  BarChart3,
  GitBranch,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { getCommunityProductEvidence } from "@/services/community.service";
import type { CommunityEvidenceCount } from "@/types/community";
import { humaniseCommunityTag } from "./community-i18n-options";

/* ===========================================================
 * Community evidence panel
 *
 * Sits beneath the product detail tabs. Surfaces aggregate
 * community data for a single product: how many people-like-you
 * have reviewed it, used it in a playbook, confirmed outcomes,
 * and which goals / avoids / outcomes tag it most.
 *
 * Layout intentionally mirrors the Tabs card above (max-w-5xl,
 * rounded-3xl, surface + shadow-soft) so the two surfaces feel
 * like one continuous product section rather than a bolted-on
 * panel.
 * ========================================================= */

type Props = {
  productId: string;
};

export function CommunityProductEvidencePanel({ productId }: Props) {
  const t = useTranslations("community.productEvidence");
  const evidence = useQuery({
    queryKey: [QueryKey.CommunityProductEvidence, productId],
    queryFn: ({ signal }) => getCommunityProductEvidence(productId, signal),
  });

  if (evidence.isLoading) {
    return <EvidencePanelSkeleton />;
  }

  if (evidence.isError) {
    return (
      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-warning/30 bg-warning-soft px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {t("loadError")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void evidence.refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            {t("retry")}
          </Button>
        </div>
      </section>
    );
  }

  const data = evidence.data;
  if (!data) return null;

  const worked =
    data.outcomeSignalCounts.worked_for_me_too +
    data.outcomeSignalCounts.worked_with_changes;
  const totalSignals = Object.values(data.outcomeSignalCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const confirmations = data.similarOutcomeConfirmationCount;
  const hasConfirmations = confirmations > 0;

  return (
    <section className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-soft motion-safe:animate-in motion-safe:fade-in">
      <div className="p-6 sm:p-8">
        {/* Header — icon avatar + title/description, confirmations chip on the right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong"
            >
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-foreground">
                {t("title")}
              </h3>
              <p className="mt-1 max-w-md text-sm leading-5 text-muted">
                {t("description")}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-semibold",
              hasConfirmations
                ? "border-accent/30 bg-accent-soft text-accent-strong"
                : "border-border bg-surface-muted text-muted",
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            {hasConfirmations
              ? t("similarConfirmations", { count: confirmations })
              : t("noConfirmations")}
          </span>
        </div>

        {/* Metric tiles */}
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            icon={Star}
            label={t("reviews")}
            value={data.reviewCount}
            tone="accent"
          />
          <MetricTile
            icon={GitBranch}
            label={t("playbooks")}
            value={data.playbookCount}
            tone="ai"
          />
          <MetricTile
            icon={TrendingUp}
            label={t("workedSignals")}
            value={`${worked}/${totalSignals}`}
            tone={worked > 0 ? "accent" : "muted"}
          />
          <MetricTile
            icon={BarChart3}
            label={t("averageEffectiveness")}
            value={data.averageEffectivenessRating ?? t("notAvailable")}
            tone={
              typeof data.averageEffectivenessRating === "number" &&
              data.averageEffectivenessRating >= 3.5
                ? "accent"
                : "muted"
            }
          />
        </dl>

        {/* Tag groups */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <TagGroup
            icon={Target}
            title={t("topGoals")}
            values={data.topGoals}
            tone="accent"
          />
          <TagGroup
            icon={Ban}
            title={t("topAvoids")}
            values={data.topAvoids}
            tone="warning"
          />
          <TagGroup
            icon={Sparkles}
            title={t("reviewOutcomes")}
            values={data.topOutcomes}
            tone="ai"
          />
        </div>
      </div>
    </section>
  );
}

/* ===========================================================
 * Metric tile — number with supporting label and a tone-coded
 * icon. The icon avatar adopts the tile's tone so a quick scan
 * picks up which metrics are healthy (accent) vs neutral
 * (muted).
 * ========================================================= */

type MetricTone = "accent" | "muted" | "ai";

const METRIC_TONE_ICON: Record<MetricTone, string> = {
  accent: "bg-accent-soft text-accent-strong",
  muted: "bg-surface-muted text-muted",
  ai: "bg-ai-bg text-ai-fg",
};

function MetricTile({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span
          aria-hidden
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            METRIC_TONE_ICON[tone],
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

/* ===========================================================
 * Tag group — title with tone-coded icon, then chips for each
 * value showing the label + a faint count badge.
 * ========================================================= */

type TagTone = "accent" | "warning" | "ai";

const TAG_TONE_ICON: Record<TagTone, string> = {
  accent: "text-accent",
  warning: "text-warning",
  ai: "text-ai-fg",
};

function TagGroup({
  icon: Icon,
  title,
  tone,
  values,
}: {
  icon: LucideIcon;
  title: string;
  tone: TagTone;
  values: CommunityEvidenceCount[];
}) {
  const t = useTranslations("community.productEvidence");
  return (
    <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", TAG_TONE_ICON[tone])} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {values.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{t("noEvidence")}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {values.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
            >
              <span className="font-medium text-foreground">
                {humaniseCommunityTag(item.value)}
              </span>
              <span className="rounded-full bg-surface-muted px-1.5 text-[10px] font-semibold tabular-nums text-muted">
                {item.count}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
 * Skeleton mirrors the real layout (header avatar + 4 metric
 * tiles + 3 tag groups) so the swap to loaded data doesn't
 * reflow the page.
 * ========================================================= */

function EvidencePanelSkeleton() {
  return (
    <section
      aria-busy
      className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-soft motion-safe:animate-in motion-safe:fade-in"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-72 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-48 rounded-full" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
