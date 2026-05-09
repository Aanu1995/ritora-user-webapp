import type { SuggestionEvidenceSourceId } from "@/types/suggestions";

export enum EnvironmentStatus {
  Available = "available",
  Degraded = "degraded",
  Unavailable = "unavailable",
}

export enum EnvironmentProviderName {
  OpenMeteo = "open_meteo",
  ProfileOnly = "profile_only",
  TimeZoneOnly = "timezone_only",
}

export enum EnvironmentHumidityBand {
  VeryDry = "very_dry",
  Dry = "dry",
  Balanced = "balanced",
  Humid = "humid",
  VeryHumid = "very_humid",
}

export enum EnvironmentUvRisk {
  Low = "low",
  Moderate = "moderate",
  High = "high",
  VeryHigh = "very_high",
  Extreme = "extreme",
  Unknown = "unknown",
}

export enum EnvironmentAirQualityRisk {
  Good = "good",
  Fair = "fair",
  Moderate = "moderate",
  Poor = "poor",
  VeryPoor = "very_poor",
  Unknown = "unknown",
}

export enum EnvironmentWaterHardness {
  Unknown = "unknown",
  Soft = "soft",
  Moderate = "moderate",
  Hard = "hard",
}

export enum EnvironmentWaterSensitivity {
  None = "none",
  Suspected = "suspected",
  Confirmed = "confirmed",
}

export type TodaysSuggestionEnvironmentSummary = {
  status: EnvironmentStatus;
  provider: EnvironmentProviderName;
  generatedAt: string;
  locationPersonalized: boolean;
  season: string;
  temperatureCelsius: number | null;
  temperatureBand: string | null;
  humidity: number | null;
  humidityBand: EnvironmentHumidityBand | null;
  uvIndex: number | null;
  uvRisk: EnvironmentUvRisk;
  airQualityIndex: number | null;
  airQualityRisk: EnvironmentAirQualityRisk;
  pm25: number | null;
  pm10: number | null;
  pollenRisk: string | null;
  conditionLabel: string | null;
  waterHardness: EnvironmentWaterHardness;
  waterSensitivity: EnvironmentWaterSensitivity;
  climateSensitivities: string[];
  transitionSignals: string[];
  confidence: string;
  stale: boolean;
  sourceIds: SuggestionEvidenceSourceId[];
};

export type TodaysSuggestionEnvironmentAlert = {
  kind: string;
  severity: "info" | "warning";
  title: string;
  message: string;
  sourceIds: SuggestionEvidenceSourceId[];
};
