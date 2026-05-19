import {
  Droplets,
  Leaf,
  ShieldCheck,
  ThermometerSun,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/suggestions";
import {
  airTone,
  buildAirValue,
  buildHumidityValue,
  buildTemperatureValue,
  buildUvValue,
  humidityTone,
  isKnownText,
  temperatureTone,
  translateToken,
  type ClimateMetricTone,
  type ClimateTranslate,
  uvTone,
} from "@/components/dashboard/dashboard-climate-formatters";
export {
  buildClimateHeadline,
  formatLastUpdated,
  knownSensitivities,
  translateSensitivity,
} from "@/components/dashboard/dashboard-climate-formatters";
export type { ClimateMetricTone } from "@/components/dashboard/dashboard-climate-formatters";

export type ClimateMetric = {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
  tone: ClimateMetricTone;
};

export function buildClimateMetrics(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): ClimateMetric[] {
  const metrics: ClimateMetric[] = [];
  const temperature = buildTemperatureValue(environment, t);
  const uv = buildUvValue(environment, t);
  const humidity = buildHumidityValue(environment, t);
  const air = buildAirValue(environment, t);

  if (isKnownText(environment.season)) {
    metrics.push({
      key: "season",
      icon: <Leaf className="h-4 w-4" aria-hidden />,
      label: t("seasonLabel"),
      value: translateToken(t, "season", environment.season),
      tone: "neutral",
    });
  }

  if (temperature) {
    metrics.push({
      key: "temperature",
      icon: <ThermometerSun className="h-4 w-4" aria-hidden />,
      label: t("temperature"),
      value: temperature,
      tone: temperatureTone(environment),
    });
  }

  if (uv) {
    metrics.push({
      key: "uv",
      icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
      label: t("uv"),
      value: uv,
      tone: uvTone(environment.uvRisk),
    });
  }

  if (humidity) {
    metrics.push({
      key: "humidity",
      icon: <Droplets className="h-4 w-4" aria-hidden />,
      label: t("humidity"),
      value: humidity,
      tone: humidityTone(environment.humidityBand),
    });
  }

  if (air) {
    metrics.push({
      key: "air",
      icon: <Wind className="h-4 w-4" aria-hidden />,
      label: t("airQuality"),
      value: air,
      tone: airTone(environment.airQualityRisk),
    });
  }

  return metrics;
}
