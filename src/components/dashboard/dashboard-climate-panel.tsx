"use client";

import { CloudSun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  buildClimateHeadline,
  buildClimateMetrics,
  type ClimateMetricTone,
  formatLastUpdated,
  knownSensitivities,
  translateSensitivity,
} from "@/components/dashboard/dashboard-climate-panel-utils";
import { cn } from "@/lib/utils";
import type { TodaysSuggestionEnvironmentSummary } from "@/types/suggestions";

type DashboardClimatePanelProps = {
  environment: TodaysSuggestionEnvironmentSummary | null;
};

export function DashboardClimatePanel({
  environment,
}: DashboardClimatePanelProps) {
  const t = useTranslations("currentContext");
  const locale = useLocale();

  if (!environment) {
    return null;
  }

  const metrics = buildClimateMetrics(environment, t);
  const headline = buildClimateHeadline(environment, t);
  const sensitivities = knownSensitivities(environment.climateSensitivities);
  const source = environment.locationPersonalized
    ? t("cityLevelClimate")
    : t("profileOnlyClimate");
  const lastUpdated = formatLastUpdated(environment.generatedAt, locale);

  if (!headline && metrics.length === 0 && sensitivities.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t("climateData")}
      className="rounded-2xl border border-border/60 bg-surface p-5"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong ring-1 ring-inset ring-accent-strong/10">
          <CloudSun className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-strong">
            {t("climateData")}
          </p>
          {headline ? (
            <h2 className="mt-1 text-[17px] font-semibold leading-snug tracking-tight text-foreground tabular-nums sm:text-lg">
              {headline}
            </h2>
          ) : null}
          <p className="mt-1 text-xs text-muted">
            {source}
            {lastUpdated
              ? ` · ${t("lastUpdated", { time: lastUpdated })}`
              : null}
          </p>
        </div>
      </div>

      {metrics.length > 0 ? (
        <dl className="mt-5 grid gap-x-4 gap-y-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <div key={metric.key} className="flex min-w-0 items-start gap-2.5">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                  CHIP_TONES[metric.tone],
                )}
              >
                {metric.icon}
              </span>
              <div className="min-w-0 pt-0.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted">
                  {metric.label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
                  {metric.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      ) : null}

      {sensitivities.length > 0 ? (
        <p className="mt-5 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            {t("sensitivities")}
          </span>{" "}
          {sensitivities
            .map((value) => translateSensitivity(t, value))
            .join(", ")}
        </p>
      ) : null}
    </section>
  );
}

const CHIP_TONES: Record<ClimateMetricTone, string> = {
  neutral: "bg-surface-muted text-muted",
  soft: "bg-accent-soft text-accent-strong",
  reminder:
    "bg-[#fdf2e0] text-[#8a3e08] dark:bg-[rgba(242,178,103,0.18)] dark:text-[#f2b267]",
  warning:
    "bg-[#f6e0c4] text-[#7a3608] dark:bg-[rgba(242,178,103,0.26)] dark:text-[#f2b267]",
};
