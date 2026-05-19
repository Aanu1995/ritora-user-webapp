import { screen } from "@testing-library/react";
import { DashboardClimatePanel } from "@/components/dashboard/dashboard-climate-panel";
import {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentProviderName,
  EnvironmentStatus,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/suggestions";
import { renderWithProviders } from "@/test/utils";

describe("DashboardClimatePanel", () => {
  it("renders the dashboard climate template", () => {
    renderWithProviders(
      <DashboardClimatePanel environment={environmentSummary()} />,
    );

    expect(
      screen.getByRole("region", { name: "Climate data" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Clear, 12°C")).toBeInTheDocument();
    expect(screen.getByText(/City-level/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
    expect(screen.getByText("Season")).toBeInTheDocument();
    expect(screen.getByText("Spring")).toBeInTheDocument();
    expect(screen.getByText("Humidity")).toBeInTheDocument();
    expect(screen.getByText("Balanced · 44%")).toBeInTheDocument();
    expect(screen.getByText("Air")).toBeInTheDocument();
    expect(screen.getByText("Good · AQI 22")).toBeInTheDocument();
    // Second-row metrics (PM2.5, PM10, pollen, water) are intentionally
    // omitted from the dashboard climate panel.
    expect(screen.queryByText("PM2.5")).not.toBeInTheDocument();
    expect(screen.queryByText("PM10")).not.toBeInTheDocument();
    expect(screen.queryByText("Pollen")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Moderate water · No sensitivity"),
    ).not.toBeInTheDocument();
    // Sensitivities footer still renders.
    expect(screen.getByText("dry air, pollution")).toBeInTheDocument();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
  });

  it("hides climate fields that are not known", () => {
    renderWithProviders(
      <DashboardClimatePanel
        environment={{
          ...environmentSummary(),
          season: "unknown",
          temperatureCelsius: null,
          temperatureBand: null,
          humidity: null,
          humidityBand: null,
          uvIndex: 5,
          uvRisk: EnvironmentUvRisk.Unknown,
          airQualityIndex: 32,
          airQualityRisk: EnvironmentAirQualityRisk.Unknown,
          pm25: null,
          pm10: null,
          pollenRisk: null,
          conditionLabel: null,
          waterHardness: EnvironmentWaterHardness.Unknown,
          waterSensitivity: EnvironmentWaterSensitivity.None,
          climateSensitivities: [],
        }}
      />,
    );

    expect(screen.getAllByText("UV 5").length).toBeGreaterThan(0);
    expect(screen.getByText("AQI 32")).toBeInTheDocument();
    expect(screen.queryByText("Season")).not.toBeInTheDocument();
    expect(screen.queryByText("Temp")).not.toBeInTheDocument();
    expect(screen.queryByText("Humidity")).not.toBeInTheDocument();
    expect(screen.queryByText("PM2.5")).not.toBeInTheDocument();
    expect(screen.queryByText("PM10")).not.toBeInTheDocument();
    expect(screen.queryByText("Pollen")).not.toBeInTheDocument();
    expect(screen.queryByText("Water")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
  });

  it("renders nothing when no climate context is available", () => {
    const { container } = renderWithProviders(
      <DashboardClimatePanel environment={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

function environmentSummary(): TodaysSuggestionEnvironmentSummary {
  return {
    status: EnvironmentStatus.Available,
    provider: EnvironmentProviderName.OpenMeteo,
    generatedAt: "2026-05-08T20:00:00.000Z",
    locationPersonalized: true,
    season: "spring",
    temperatureCelsius: 12,
    temperatureBand: "mild",
    humidity: 44,
    humidityBand: EnvironmentHumidityBand.Balanced,
    uvIndex: 5,
    uvRisk: EnvironmentUvRisk.Moderate,
    airQualityIndex: 22,
    airQualityRisk: EnvironmentAirQualityRisk.Good,
    pm25: 6,
    pm10: 12,
    pollenRisk: "moderate",
    conditionLabel: "Clear",
    waterHardness: EnvironmentWaterHardness.Moderate,
    waterSensitivity: EnvironmentWaterSensitivity.None,
    climateSensitivities: ["dry_air", "pollution"],
    transitionSignals: [],
    confidence: "provider",
    stale: false,
    sourceIds: [],
  };
}
