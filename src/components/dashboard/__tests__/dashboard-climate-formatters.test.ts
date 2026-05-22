import {
  airTone,
  buildAirValue,
  buildClimateHeadline,
  buildHumidityValue,
  buildParticleValue,
  buildTemperatureValue,
  buildUvValue,
  buildWaterValue,
  formatLastUpdated,
  formatToken,
  humidityTone,
  isKnownText,
  knownSensitivities,
  pm10Tone,
  pm25Tone,
  pollenTone,
  temperatureTone,
  translateSensitivity,
  translateToken,
  uvTone,
  waterTone,
} from "../dashboard-climate-formatters";
import {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/suggestions";

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${JSON.stringify(values)}` : `t:${key}`;

function environment(
  overrides: Partial<TodaysSuggestionEnvironmentSummary> = {},
): TodaysSuggestionEnvironmentSummary {
  return {
    status: "available",
    provider: "open_meteo",
    generatedAt: "2026-05-04T10:05:00.000Z",
    locationPersonalized: true,
    season: "spring",
    temperatureCelsius: 12,
    temperatureBand: "mild",
    humidity: 44,
    humidityBand: EnvironmentHumidityBand.Balanced,
    uvIndex: 6,
    uvRisk: EnvironmentUvRisk.High,
    airQualityIndex: 61,
    airQualityRisk: EnvironmentAirQualityRisk.Poor,
    pm25: 13,
    pm10: 51,
    pollenRisk: "moderate",
    conditionLabel: "Clear",
    waterHardness: EnvironmentWaterHardness.Hard,
    waterSensitivity: EnvironmentWaterSensitivity.Suspected,
    climateSensitivities: ["dry_air"],
    transitionSignals: [],
    confidence: "provider",
    stale: false,
    sourceIds: [],
    ...overrides,
  };
}

describe("dashboard climate formatters", () => {
  it("builds values from known climate data and sensible fallbacks", () => {
    expect(buildTemperatureValue(environment(), t)).toBe(
      't:temperatureBand.mild · 12°C',
    );
    expect(buildTemperatureValue(environment({ temperatureBand: null }), t)).toBe(
      "12°C",
    );
    expect(buildTemperatureValue(environment({ temperatureCelsius: null }), t)).toBe(
      "t:temperatureBand.mild",
    );
    expect(
      buildTemperatureValue(
        environment({ temperatureBand: null, temperatureCelsius: null }),
        t,
      ),
    ).toBeNull();

    expect(buildUvValue(environment(), t)).toBe(
      'uvValue:{"index":6,"risk":"t:uvRisk.high"}',
    );
    expect(buildUvValue(environment({ uvRisk: EnvironmentUvRisk.Unknown }), t)).toBe(
      'uvIndexOnly:{"index":6}',
    );
    expect(buildUvValue(environment({ uvIndex: null }), t)).toBe("t:uvRisk.high");

    expect(buildAirValue(environment(), t)).toBe(
      'airQualityValue:{"index":61,"risk":"t:airRisk.poor"}',
    );
    expect(
      buildAirValue(
        environment({ airQualityRisk: EnvironmentAirQualityRisk.Unknown }),
        t,
      ),
    ).toBe('airQualityIndexOnly:{"index":61}');
    expect(buildAirValue(environment({ airQualityIndex: null }), t)).toBe(
      "t:airRisk.poor",
    );
  });

  it("builds humidity, water, headline, particles, and translated tokens", () => {
    expect(buildHumidityValue(environment(), t)).toBe(
      'humidityValue:{"value":44,"band":"t:humidityBand.balanced"}',
    );
    expect(buildHumidityValue(environment({ humidityBand: null }), t)).toBe(
      "44%",
    );
    expect(buildHumidityValue(environment({ humidity: null }), t)).toBe(
      "t:humidityBand.balanced",
    );
    expect(
      buildHumidityValue(environment({ humidity: null, humidityBand: null }), t),
    ).toBeNull();
    expect(buildWaterValue(environment(), t)).toBe(
      "t:waterHardness.hard · t:waterSensitivity.suspected",
    );
    expect(
      buildWaterValue(
        environment({
          waterHardness: EnvironmentWaterHardness.Unknown,
          waterSensitivity: EnvironmentWaterSensitivity.None,
        }),
        t,
      ),
    ).toBeNull();
    expect(buildClimateHeadline(environment(), t)).toBe("Clear, 12°C");
    expect(
      buildClimateHeadline(
        environment({ conditionLabel: null, temperatureCelsius: null }),
        t,
      ),
    ).toBe("t:temperatureBand.mild");
    expect(buildParticleValue(6.4, t)).toBe('micrograms:{"value":6}');
    expect(translateToken(t, "temperature", "mild")).toBe(
      "t:temperatureBand.mild",
    );
    expect(translateToken(t, "missing", "very_high")).toBe("Very high");
    expect(formatToken("  ")).toBe("  ");
    expect(translateSensitivity(t, "dry_air")).toBe("t:sensitivity.dryAir");
  });

  it("formats last updated times and known sensitivity text", () => {
    expect(formatLastUpdated("not-a-date", "en-US")).toBeNull();
    expect(formatLastUpdated("2026-05-04T10:05:00.000Z", "en-US")).toEqual(
      expect.any(String),
    );
    expect(knownSensitivities(["dry_air", "unknown", "", " heat "])).toEqual([
      "dry_air",
      " heat ",
    ]);
    expect(isKnownText(null)).toBe(false);
    expect(isKnownText(undefined)).toBe(false);
    expect(isKnownText("unknown")).toBe(false);
    expect(isKnownText("mild")).toBe(true);
  });

  it("maps metric tones across warning, reminder, soft, and neutral states", () => {
    expect(temperatureTone(environment({ temperatureBand: "freezing" }))).toBe(
      "warning",
    );
    expect(temperatureTone(environment({ temperatureBand: "warm" }))).toBe(
      "reminder",
    );
    expect(temperatureTone(environment({ temperatureBand: "mild" }))).toBe(
      "neutral",
    );
    expect(uvTone(EnvironmentUvRisk.Low)).toBe("soft");
    expect(uvTone(EnvironmentUvRisk.Moderate)).toBe("reminder");
    expect(uvTone(EnvironmentUvRisk.Extreme)).toBe("warning");
    expect(uvTone(EnvironmentUvRisk.Unknown)).toBe("neutral");
    expect(humidityTone(EnvironmentHumidityBand.Balanced)).toBe("soft");
    expect(humidityTone(EnvironmentHumidityBand.Dry)).toBe("reminder");
    expect(humidityTone(EnvironmentHumidityBand.VeryHumid)).toBe("warning");
    expect(humidityTone(null)).toBe("neutral");
    expect(airTone(EnvironmentAirQualityRisk.Good)).toBe("soft");
    expect(airTone(EnvironmentAirQualityRisk.Fair)).toBe("neutral");
    expect(airTone(EnvironmentAirQualityRisk.Moderate)).toBe("reminder");
    expect(airTone(EnvironmentAirQualityRisk.VeryPoor)).toBe("warning");
    expect(airTone(EnvironmentAirQualityRisk.Unknown)).toBe("neutral");
    expect(
      waterTone(
        EnvironmentWaterHardness.Soft,
        EnvironmentWaterSensitivity.Confirmed,
      ),
    ).toBe("warning");
    expect(
      waterTone(EnvironmentWaterHardness.Hard, EnvironmentWaterSensitivity.None),
    ).toBe("reminder");
    expect(pollenTone("VERY_HIGH")).toBe("warning");
    expect(pollenTone("moderate")).toBe("reminder");
    expect(pollenTone("low")).toBe("neutral");
    expect(pm25Tone(36)).toBe("warning");
    expect(pm25Tone(13)).toBe("reminder");
    expect(pm25Tone(12)).toBe("soft");
    expect(pm10Tone(101)).toBe("warning");
    expect(pm10Tone(51)).toBe("reminder");
    expect(pm10Tone(50)).toBe("soft");
  });
});
