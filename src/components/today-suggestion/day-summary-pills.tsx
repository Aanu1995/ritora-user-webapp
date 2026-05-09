"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Camera,
  Check,
  CloudSun,
  Droplets,
  Lock,
  Sparkles,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { cn } from "@/lib/utils";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import {
  EnvironmentAirQualityRisk,
  EnvironmentUvRisk,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/environment-suggestions";
import type {
  TodaysSuggestionResponse,
} from "@/types/suggestions";

type Props = {
  data: TodaysSuggestionResponse;
  timeZone?: string;
};

export function DaySummaryPills({ data, timeZone }: Props) {
  const t = useTranslations("todaysSuggestion.summary");
  const todayEntry = useTodayEntry();
  const entry = todayEntry.data?.entry ?? null;

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
  const climatePills = buildClimatePills(data.environmentSummary, t);

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

type SummaryTranslator = ReturnType<typeof useTranslations>;

type ClimatePill = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

function buildClimatePills(
  environment: TodaysSuggestionEnvironmentSummary | null,
  t: SummaryTranslator,
): ClimatePill[] {
  if (!environment) {
    return [];
  }

  return [
    weatherPill(environment, t),
    uvPill(environment, t),
    humidityPill(environment, t),
    airQualityPill(environment, t),
  ].filter((pill): pill is ClimatePill => pill !== null);
}

function weatherPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: SummaryTranslator,
): ClimatePill | null {
  const temperature =
    environment.temperatureCelsius !== null
      ? Math.round(environment.temperatureCelsius)
      : null;

  if (environment.conditionLabel && temperature !== null) {
    return {
      key: "weather",
      label: t("weatherWithTemperature", {
        condition: environment.conditionLabel,
        temperature,
      }),
      icon: <CloudSun className="h-3 w-3 text-muted" />,
    };
  }

  if (temperature !== null) {
    return {
      key: "temperature",
      label: t("temperature", { temperature }),
      icon: <CloudSun className="h-3 w-3 text-muted" />,
    };
  }

  if (environment.conditionLabel) {
    return {
      key: "weather",
      label: environment.conditionLabel,
      icon: <CloudSun className="h-3 w-3 text-muted" />,
    };
  }

  return null;
}

function uvPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: SummaryTranslator,
): ClimatePill | null {
  if (environment.uvIndex === null) {
    return null;
  }

  const index = Math.round(environment.uvIndex);
  const label =
    environment.uvRisk === EnvironmentUvRisk.Unknown
      ? t("uvIndex", { index })
      : t("uvRisk", {
          index,
          risk: t(`environment.uv.${environment.uvRisk}`),
        });

  return {
    key: "uv",
    label,
    icon: <Sun className="h-3 w-3 text-muted" />,
  };
}

function humidityPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: SummaryTranslator,
): ClimatePill | null {
  if (environment.humidity === null || !environment.humidityBand) {
    return null;
  }

  return {
    key: "humidity",
    label: t("humidity", {
      band: t(`environment.humidity.${environment.humidityBand}`),
      value: Math.round(environment.humidity),
    }),
    icon: <Droplets className="h-3 w-3 text-muted" />,
  };
}

function airQualityPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: SummaryTranslator,
): ClimatePill | null {
  if (
    environment.airQualityRisk !== EnvironmentAirQualityRisk.Poor &&
    environment.airQualityRisk !== EnvironmentAirQualityRisk.VeryPoor
  ) {
    return null;
  }

  return {
    key: "air",
    label: t("airQuality", {
      risk: t(`environment.air.${environment.airQualityRisk}`),
    }),
    icon: <Wind className="h-3 w-3 text-muted" />,
  };
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
