import type { TodaysSuggestionEnvironmentSummary } from "@/types/suggestions";
import {
  EnvironmentAirQualityRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
} from "@/types/suggestions";

type DetailTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export type EnvironmentReasonRow = {
  label: string;
  detail: string;
};

export function buildEnvironmentRows(
  environment: TodaysSuggestionEnvironmentSummary | null,
  t: DetailTranslate,
): EnvironmentReasonRow[] {
  if (!environment) return [];

  return [
    weatherRow(environment, t),
    uvRow(environment, t),
    humidityRow(environment, t),
    airQualityRow(environment, t),
    waterRow(environment, t),
  ].filter((row): row is EnvironmentReasonRow => row !== null);
}

function weatherRow(
  environment: TodaysSuggestionEnvironmentSummary,
  t: DetailTranslate,
): EnvironmentReasonRow | null {
  const parts = [
    environment.conditionLabel,
    environment.temperatureCelsius !== null
      ? `${Math.round(environment.temperatureCelsius)}°C`
      : null,
  ].filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;
  return { label: t("environment.weather"), detail: parts.join(" · ") };
}

function uvRow(
  environment: TodaysSuggestionEnvironmentSummary,
  t: DetailTranslate,
): EnvironmentReasonRow | null {
  if (environment.uvIndex === null) return null;
  return {
    label: t("environment.uv"),
    detail: t("environment.uvDetail", {
      index: Math.round(environment.uvIndex),
      risk: t(`environment.uvRisk.${environment.uvRisk}`),
    }),
  };
}

function humidityRow(
  environment: TodaysSuggestionEnvironmentSummary,
  t: DetailTranslate,
): EnvironmentReasonRow | null {
  if (environment.humidity === null || !environment.humidityBand) return null;
  return {
    label: t("environment.humidity"),
    detail: t("environment.humidityDetail", {
      value: Math.round(environment.humidity),
      band: t(`environment.humidityBand.${environment.humidityBand}`),
    }),
  };
}

function airQualityRow(
  environment: TodaysSuggestionEnvironmentSummary,
  t: DetailTranslate,
): EnvironmentReasonRow | null {
  if (environment.airQualityRisk === EnvironmentAirQualityRisk.Unknown) {
    return null;
  }
  return {
    label: t("environment.air"),
    detail: t(`environment.airRisk.${environment.airQualityRisk}`),
  };
}

function waterRow(
  environment: TodaysSuggestionEnvironmentSummary,
  t: DetailTranslate,
): EnvironmentReasonRow | null {
  const hasWaterConcern =
    environment.waterHardness === EnvironmentWaterHardness.Hard ||
    environment.waterSensitivity !== EnvironmentWaterSensitivity.None;

  if (!hasWaterConcern) return null;
  return {
    label: t("environment.water"),
    detail: t("environment.waterDetail", {
      hardness: t(`environment.waterHardness.${environment.waterHardness}`),
    }),
  };
}
