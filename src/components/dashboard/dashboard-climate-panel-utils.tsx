import {
  Droplets,
  Leaf,
  ShieldCheck,
  ThermometerSun,
  Waves,
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
  buildParticleValue,
  buildTemperatureValue,
  buildWaterValue,
  buildUvValue,
  formatToken,
  isKnownText,
  pm10Tone,
  pm25Tone,
  pollenTone,
  temperatureTone,
  translateToken,
  type ClimateMetricTone,
  type ClimateTranslate,
  humidityTone,
  uvTone,
  waterTone,
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
  const water = buildWaterValue(environment, t);

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

  if (environment.pm25 !== null) {
    metrics.push({
      key: "pm25",
      icon: <Wind className="h-4 w-4" aria-hidden />,
      label: t("pm25"),
      value: buildParticleValue(environment.pm25, t),
      tone: pm25Tone(environment.pm25),
    });
  }

  if (environment.pm10 !== null) {
    metrics.push({
      key: "pm10",
      icon: <Wind className="h-4 w-4" aria-hidden />,
      label: t("pm10"),
      value: buildParticleValue(environment.pm10, t),
      tone: pm10Tone(environment.pm10),
    });
  }

  if (isKnownText(environment.pollenRisk)) {
    metrics.push({
      key: "pollen",
      icon: <Leaf className="h-4 w-4" aria-hidden />,
      label: t("pollen"),
      value: formatToken(environment.pollenRisk),
      tone: pollenTone(environment.pollenRisk),
    });
  }

  if (water) {
    metrics.push({
      key: "water",
      icon: <Waves className="h-4 w-4" aria-hidden />,
      label: t("water"),
      value: water,
      tone: waterTone(
        environment.waterHardness,
        environment.waterSensitivity,
      ),
    });
  }

  return metrics;
}
