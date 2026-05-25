"use client";

import { CloudSun, Droplets, Sun, Wind } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  EnvironmentAirQualityRisk,
  EnvironmentUvRisk,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/environment-suggestions";
import { translateWeatherCondition } from "@/components/dashboard/dashboard-climate-formatters";

type ClimatePill = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type ClimateTranslator = ReturnType<typeof useTranslations>;

type Props = {
  environment: TodaysSuggestionEnvironmentSummary | null;
};

export function SuggestionClimatePills({ environment }: Props) {
  const t = useTranslations("todaysSuggestion.climate");
  const pills = buildSuggestionClimatePills(environment, t);

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {pills.map((pill) => (
        <span
          key={pill.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted"
        >
          {pill.icon}
          {pill.label}
        </span>
      ))}
    </div>
  );
}

export function buildSuggestionClimatePills(
  environment: TodaysSuggestionEnvironmentSummary | null,
  t: ClimateTranslator,
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
  t: ClimateTranslator,
): ClimatePill | null {
  const temperature =
    environment.temperatureCelsius !== null
      ? Math.round(environment.temperatureCelsius)
      : null;

  if (environment.conditionLabel && temperature !== null) {
    return {
      key: "weather",
      label: t("weatherWithTemperature", {
        condition: translateWeatherCondition(t, environment.conditionLabel),
        temperature,
      }),
      icon: <CloudSun className="h-3 w-3" />,
    };
  }

  if (temperature !== null) {
    return {
      key: "temperature",
      label: t("temperature", { temperature }),
      icon: <CloudSun className="h-3 w-3" />,
    };
  }

  if (environment.conditionLabel) {
    return {
      key: "weather",
      label: translateWeatherCondition(t, environment.conditionLabel),
      icon: <CloudSun className="h-3 w-3" />,
    };
  }

  return null;
}

function uvPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslator,
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
    icon: <Sun className="h-3 w-3" />,
  };
}

function humidityPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslator,
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
    icon: <Droplets className="h-3 w-3" />,
  };
}

function airQualityPill(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslator,
): ClimatePill | null {
  if (!isActionableAirQuality(environment.airQualityRisk)) {
    return null;
  }

  const risk = t(`environment.air.${environment.airQualityRisk}`);

  return {
    key: "air",
    label:
      environment.airQualityIndex !== null
        ? t("airQualityWithIndex", {
            index: Math.round(environment.airQualityIndex),
            risk,
          })
        : t("airQuality", { risk }),
    icon: <Wind className="h-3 w-3" />,
  };
}

function isActionableAirQuality(risk: EnvironmentAirQualityRisk): boolean {
  const actionableRisks: readonly EnvironmentAirQualityRisk[] = [
    EnvironmentAirQualityRisk.Moderate,
    EnvironmentAirQualityRisk.Poor,
    EnvironmentAirQualityRisk.VeryPoor,
  ];

  return actionableRisks.includes(risk);
}
