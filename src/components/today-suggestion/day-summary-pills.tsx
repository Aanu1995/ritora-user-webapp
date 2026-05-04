"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Camera,
  Check,
  Lock,
  Sparkles,
  ThermometerSun,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { useAuthStore } from "@/stores/auth-store";
import type {
  TodaysSuggestionResponse,
  TodaysSuggestionWeatherSummary,
} from "@/types/suggestions";

type Props = {
  data: TodaysSuggestionResponse;
};

/**
 * The horizontal strip of pills directly under the page header. Reads at a
 * glance what state the day is in. Counts derive from the slot list.
 */
export function DaySummaryPills({ data }: Props) {
  const t = useTranslations("todaysSuggestion.summary");
  const todayEntry = useTodayEntry();
  const userTimeZone = useAuthStore((s) => s.user?.timeZone) ?? "UTC";
  const entry = todayEntry.data?.entry ?? null;
  const hasPhoto = Boolean(entry?.has_photo);

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
      <WeatherPill weather={data.weatherSummary} />
      {hasPhoto && entry ? (
        <Pill tone="success" icon={<Camera className="h-3 w-3" />}>
          {t("photoLoggedAt", {
            time: formatTime(entry.created_at, userTimeZone),
          })}
        </Pill>
      ) : (
        <Link
          href="/journal/upload"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface-muted"
        >
          <Camera className="h-3 w-3 text-muted" />
          {t("logPhoto")}
        </Link>
      )}
    </div>
  );
}

function formatTime(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-surface text-foreground",
        tone === "success" &&
          "border-[color:rgba(47,122,82,0.28)] bg-accent-soft text-accent-strong",
        tone === "ready" &&
          "border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]",
        tone === "locked" && "border-border bg-surface-muted text-muted",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function WeatherPill({
  weather,
}: {
  weather: TodaysSuggestionWeatherSummary | null;
}) {
  const t = useTranslations("todaysSuggestion.summary");
  if (!weather) return null;

  const parts: string[] = [];
  if (weather.conditionLabel) parts.push(weather.conditionLabel);
  if (weather.temperatureCelsius !== null) {
    parts.push(`${Math.round(weather.temperatureCelsius)}°C`);
  }
  if (weather.uvIndex !== null) {
    parts.push(t("uvIndex", { index: weather.uvIndex }));
  }
  if (parts.length === 0) return null;

  return (
    <Pill tone="neutral" icon={<ThermometerSun className="h-3 w-3 text-muted" />}>
      {parts.join(", ")}
    </Pill>
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
