import {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/suggestions";

export type ClimateMetricTone =
  | "neutral"
  | "soft"
  | "reminder"
  | "warning";

export type ClimateTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function buildTemperatureValue(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  const values = [
    isKnownText(environment.temperatureBand)
      ? translateToken(t, "temperature", environment.temperatureBand)
      : null,
    environment.temperatureCelsius !== null
      ? `${Math.round(environment.temperatureCelsius)}°C`
      : null,
  ].filter((value): value is string => Boolean(value));

  return values.join(" · ") || null;
}

export function buildUvValue(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  const risk =
    environment.uvRisk === EnvironmentUvRisk.Unknown
      ? null
      : translateToken(t, "uvRisk", environment.uvRisk);

  if (environment.uvIndex !== null && risk) {
    return t("uvValue", { index: Math.round(environment.uvIndex), risk });
  }

  if (environment.uvIndex !== null) {
    return t("uvIndexOnly", { index: Math.round(environment.uvIndex) });
  }

  return risk;
}

export function buildHumidityValue(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  if (environment.humidity !== null) {
    const band = environment.humidityBand
      ? translateToken(t, "humidityBand", environment.humidityBand)
      : null;

    return band
      ? t("humidityValue", {
          value: Math.round(environment.humidity),
          band,
        })
      : `${Math.round(environment.humidity)}%`;
  }

  return environment.humidityBand
    ? translateToken(t, "humidityBand", environment.humidityBand)
    : null;
}

export function buildAirValue(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  const risk =
    environment.airQualityRisk === EnvironmentAirQualityRisk.Unknown
      ? null
      : translateToken(t, "airRisk", environment.airQualityRisk);

  if (environment.airQualityIndex !== null && risk) {
    return t("airQualityValue", {
      index: Math.round(environment.airQualityIndex),
      risk,
    });
  }

  if (environment.airQualityIndex !== null) {
    return t("airQualityIndexOnly", {
      index: Math.round(environment.airQualityIndex),
    });
  }

  return risk;
}

export function buildParticleValue(
  value: number,
  t: ClimateTranslate,
): string {
  return t("micrograms", { value: Math.round(value) });
}

export function buildWaterValue(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  const values: string[] = [];

  if (environment.waterHardness !== EnvironmentWaterHardness.Unknown) {
    values.push(translateToken(t, "waterHardness", environment.waterHardness));
  }

  if (environment.waterSensitivity !== EnvironmentWaterSensitivity.None) {
    values.push(
      translateToken(t, "waterSensitivity", environment.waterSensitivity),
    );
  } else if (values.length > 0) {
    values.push(
      translateToken(t, "waterSensitivity", environment.waterSensitivity),
    );
  }

  return values.join(" · ") || null;
}

export function buildClimateHeadline(
  environment: TodaysSuggestionEnvironmentSummary,
  t: ClimateTranslate,
): string | null {
  const condition = isKnownText(environment.conditionLabel)
    ? translateWeatherCondition(t, environment.conditionLabel)
    : isKnownText(environment.temperatureBand)
      ? translateToken(t, "temperature", environment.temperatureBand)
      : null;
  const temperature =
    environment.temperatureCelsius !== null
      ? `${Math.round(environment.temperatureCelsius)}°C`
      : null;

  if (condition && temperature) {
    return `${condition}, ${temperature}`;
  }
  return condition ?? temperature ?? null;
}

export function formatLastUpdated(
  value: string,
  locale: string,
): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function knownSensitivities(values: string[]): string[] {
  return values.filter(isKnownText);
}

export function translateSensitivity(
  t: ClimateTranslate,
  value: string,
): string {
  return translateToken(t, "sensitivity", value);
}

export function translateWeatherCondition(
  t: ClimateTranslate,
  value: string,
): string {
  return translateToken(t, "weatherCondition", value);
}

export function temperatureTone(
  environment: TodaysSuggestionEnvironmentSummary,
): ClimateMetricTone {
  const band = environment.temperatureBand;
  if (band === "freezing" || band === "hot") return "warning";
  if (band === "cold" || band === "warm") return "reminder";
  return "neutral";
}

export function uvTone(risk: EnvironmentUvRisk): ClimateMetricTone {
  switch (risk) {
    case EnvironmentUvRisk.Low:
      return "soft";
    case EnvironmentUvRisk.Moderate:
      return "reminder";
    case EnvironmentUvRisk.High:
    case EnvironmentUvRisk.VeryHigh:
    case EnvironmentUvRisk.Extreme:
      return "warning";
    default:
      return "neutral";
  }
}

export function humidityTone(
  band: EnvironmentHumidityBand | null,
): ClimateMetricTone {
  if (band === EnvironmentHumidityBand.Balanced) return "soft";
  if (
    band === EnvironmentHumidityBand.Dry ||
    band === EnvironmentHumidityBand.Humid
  ) {
    return "reminder";
  }
  if (
    band === EnvironmentHumidityBand.VeryDry ||
    band === EnvironmentHumidityBand.VeryHumid
  ) {
    return "warning";
  }
  return "neutral";
}

export function airTone(risk: EnvironmentAirQualityRisk): ClimateMetricTone {
  switch (risk) {
    case EnvironmentAirQualityRisk.Good:
      return "soft";
    case EnvironmentAirQualityRisk.Fair:
      return "neutral";
    case EnvironmentAirQualityRisk.Moderate:
      return "reminder";
    case EnvironmentAirQualityRisk.Poor:
    case EnvironmentAirQualityRisk.VeryPoor:
      return "warning";
    default:
      return "neutral";
  }
}

export function waterTone(
  hardness: EnvironmentWaterHardness,
  sensitivity: EnvironmentWaterSensitivity,
): ClimateMetricTone {
  if (sensitivity === EnvironmentWaterSensitivity.Confirmed) return "warning";
  if (sensitivity === EnvironmentWaterSensitivity.Suspected) return "reminder";
  if (hardness === EnvironmentWaterHardness.Hard) return "reminder";
  return "neutral";
}

export function pollenTone(value: string): ClimateMetricTone {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "very_high") return "warning";
  if (normalized === "moderate") return "reminder";
  return "neutral";
}

export function pm25Tone(value: number): ClimateMetricTone {
  if (value > 35) return "warning";
  if (value > 12) return "reminder";
  return "soft";
}

export function pm10Tone(value: number): ClimateMetricTone {
  if (value > 100) return "warning";
  if (value > 50) return "reminder";
  return "soft";
}

export function translateToken(
  t: ClimateTranslate,
  group: string,
  value: string,
): string {
  const normalizedKey = value.trim().toLowerCase().replaceAll(" ", "_");
  const tokenKey = TOKEN_KEYS[group]?.[value] ?? TOKEN_KEYS[group]?.[normalizedKey];

  return tokenKey
    ? t(tokenKey)
    : formatToken(value);
}

export function formatToken(value: string): string {
  const normalized = value.replaceAll("_", " ").replaceAll("-", " ").trim();
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : value;
}

export function isKnownText(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  return value.trim().toLowerCase() !== EnvironmentUvRisk.Unknown;
}

const TOKEN_KEYS: Record<string, Record<string, string>> = {
  weatherCondition: {
    clear: "weatherCondition.clear",
    cloudy: "weatherCondition.cloudy",
    foggy: "weatherCondition.foggy",
    rainy: "weatherCondition.rainy",
    snowy: "weatherCondition.snowy",
    showers: "weatherCondition.showers",
    stormy: "weatherCondition.stormy",
  },
  season: {
    spring: "seasons.spring",
    summer: "seasons.summer",
    autumn: "seasons.autumn",
    winter: "seasons.winter",
  },
  temperature: {
    freezing: "temperatureBand.freezing",
    cold: "temperatureBand.cold",
    mild: "temperatureBand.mild",
    warm: "temperatureBand.warm",
    hot: "temperatureBand.hot",
  },
  uvRisk: {
    [EnvironmentUvRisk.Low]: "uvRisk.low",
    [EnvironmentUvRisk.Moderate]: "uvRisk.moderate",
    [EnvironmentUvRisk.High]: "uvRisk.high",
    [EnvironmentUvRisk.VeryHigh]: "uvRisk.veryHigh",
    [EnvironmentUvRisk.Extreme]: "uvRisk.extreme",
    [EnvironmentUvRisk.Unknown]: "unknown",
  },
  humidityBand: {
    very_dry: "humidityBand.veryDry",
    dry: "humidityBand.dry",
    balanced: "humidityBand.balanced",
    humid: "humidityBand.humid",
    very_humid: "humidityBand.veryHumid",
  },
  airRisk: {
    [EnvironmentAirQualityRisk.Good]: "airRisk.good",
    [EnvironmentAirQualityRisk.Fair]: "airRisk.fair",
    [EnvironmentAirQualityRisk.Moderate]: "airRisk.moderate",
    [EnvironmentAirQualityRisk.Poor]: "airRisk.poor",
    [EnvironmentAirQualityRisk.VeryPoor]: "airRisk.veryPoor",
    [EnvironmentAirQualityRisk.Unknown]: "unknown",
  },
  waterHardness: {
    [EnvironmentWaterHardness.Unknown]: "waterHardness.unknown",
    [EnvironmentWaterHardness.Soft]: "waterHardness.soft",
    [EnvironmentWaterHardness.Moderate]: "waterHardness.moderate",
    [EnvironmentWaterHardness.Hard]: "waterHardness.hard",
  },
  waterSensitivity: {
    [EnvironmentWaterSensitivity.None]: "waterSensitivity.none",
    [EnvironmentWaterSensitivity.Suspected]: "waterSensitivity.suspected",
    [EnvironmentWaterSensitivity.Confirmed]: "waterSensitivity.confirmed",
  },
  sensitivity: {
    dry_air: "sensitivity.dryAir",
    humidity: "sensitivity.humidity",
    pollution: "sensitivity.pollution",
    cold: "sensitivity.cold",
    heat: "sensitivity.heat",
    sun: "sensitivity.sun",
    seasonal_change: "sensitivity.seasonalChange",
  },
};
