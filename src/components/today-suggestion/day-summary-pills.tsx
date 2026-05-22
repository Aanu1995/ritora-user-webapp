"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Camera,
  Check,
  Lock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { cn } from "@/lib/utils";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import { buildSuggestionClimatePills } from "@/components/today-suggestion/suggestion-climate-pills";
import type { TodaysSuggestionResponse } from "@/types/suggestions";

type Props = {
  data: TodaysSuggestionResponse;
  timeZone?: string;
};

export function DaySummaryPills({ data, timeZone }: Props) {
  const t = useTranslations("todaysSuggestion.summary");
  const tClimate = useTranslations("todaysSuggestion.climate");
  const todayEntry = useTodayEntry();
  const entry = todayEntry.data?.entry ?? null;
  const climatePills = buildSuggestionClimatePills(
    data.environmentSummary,
    tClimate,
  ).filter((pill) => pill.key !== "air");

  const counts = data.slots.reduce(
    (acc, slot) => {
      if (!slot.isVisible) {
        acc.locked += 1;
        return acc;
      }
      const status = slot.suggestion?.applicationLogId
        ? "applied"
        : slot.suggestion
          ? "ready"
          : "locked";
      if (status === "applied") acc.applied += 1;
      else if (status === "ready") acc.ready += 1;
      else acc.locked += 1;
      return acc;
    },
    { applied: 0, ready: 0, locked: 0 },
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {counts.applied > 0 ? (
        <Pill tone="success" icon={<Check className="h-3 w-3" />}>
          {t("applied", { count: counts.applied })}
        </Pill>
      ) : null}
      {counts.ready > 0 ? (
        <Pill tone="ready" icon={<Sparkles className="h-3 w-3" />}>
          {t("ready", { count: counts.ready })}
        </Pill>
      ) : null}
      {counts.locked > 0 ? (
        <Pill tone="locked" icon={<Lock className="h-3 w-3" />}>
          {t("locked", { count: counts.locked })}
        </Pill>
      ) : null}
      {entry?.has_photo ? (
        <Pill tone="neutral" icon={<Camera className="h-3 w-3 text-muted" />}>
          {t("photoLoggedAt", {
            time: formatIsoTime12h(entry.created_at, timeZone),
          })}
        </Pill>
      ) : (
        <PillLink
          href="/journal/upload"
          tone="neutral"
          icon={<Camera className="h-3 w-3 text-muted" />}
        >
          {t("logPhoto")}
        </PillLink>
      )}
      {climatePills.map((pill) => (
        <Pill key={pill.key} tone="neutral" icon={pill.icon}>
          {pill.label}
        </Pill>
      ))}
    </div>
  );
}

function pillClassName(tone: "neutral" | "success" | "ready" | "locked") {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
    tone === "neutral" && "border-border bg-surface text-foreground",
    tone === "success" &&
      "border-[color:rgba(47,122,82,0.28)] bg-accent-soft text-accent-strong",
    tone === "ready" &&
      "border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]",
    tone === "locked" && "border-border bg-surface-muted text-muted",
  );
}

function Pill({
  tone,
  icon,
  children,
}: {
  tone: "neutral" | "success" | "ready" | "locked";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className={pillClassName(tone)}>
      {icon}
      {children}
    </span>
  );
}

function PillLink({
  href,
  tone,
  icon,
  children,
}: {
  href: string;
  tone: "neutral" | "success" | "ready" | "locked";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(pillClassName(tone), "hover:bg-accent-soft")}
    >
      {icon}
      {children}
    </Link>
  );
}

export function DayAdherencePill({ percent }: { percent: number | null }) {
  const t = useTranslations("todaysSuggestion.summary");
  if (percent === null) return null;
  return (
    <Pill tone="success" icon={<TrendingUp className="h-3 w-3" />}>
      {t("adherence", { percent })}
    </Pill>
  );
}
