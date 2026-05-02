import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsentCard } from "@/components/settings/privacy-consent-card";
import { renderWithProviders } from "@/test/utils";
import {
  SkinProfileAccessActorType,
  SkinProfileAccessEventType,
  SkinProfileAccessPurpose,
  SkinProfileConsentType,
  type SkinProfileAccessLog,
} from "@/types/skin-profile";

function accessLog(overrides: Partial<SkinProfileAccessLog> = {}) {
  return {
    id: "log-1",
    consentType: SkinProfileConsentType.HealthContextProcessing,
    eventType: SkinProfileAccessEventType.DataAccessed,
    actorType: SkinProfileAccessActorType.System,
    purpose: SkinProfileAccessPurpose.RecommendationAnalysis,
    createdAt: "2026-05-01T08:00:00.000Z",
    ...overrides,
  };
}

describe("ConsentCard", () => {
  const user = userEvent.setup();

  it("shows encrypted active consent details, stored data, and audit log", async () => {
    const onRevoke = jest.fn();

    renderWithProviders(
      <ConsentCard
        title="Health context"
        description="Pregnancy and medication data"
        active
        encrypted
        grantedAt="2026-05-01T08:00:00.000Z"
        lastAccessedAt="not-a-date"
        storedDataItems={[
          { label: "Medication", value: "Retinoid" },
          { label: "Condition", value: "" },
        ]}
        accessLogs={[accessLog()]}
        onRevoke={onRevoke}
      />,
    );

    expect(screen.getByText("Encrypted")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Not accessed yet")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /view what's stored/i }),
    );
    expect(screen.getByText("Medication")).toBeInTheDocument();
    expect(screen.getByText("Retinoid")).toBeInTheDocument();
    expect(screen.getByText("Condition")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /view access log/i }));
    expect(screen.getByText("Data accessed")).toBeInTheDocument();
    expect(screen.getByText("Recommendation analysis")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /revoke and delete/i }),
    );
    expect(onRevoke).toHaveBeenCalledTimes(1);
  });

  it("renders inactive consent actions for grantable and coming-soon cards", () => {
    const onGrant = jest.fn();

    const { rerender } = renderWithProviders(
      <ConsentCard
        title="Location"
        description="Country and city"
        active={false}
        onGrant={onGrant}
      />,
    );

    expect(screen.getByText("Not granted")).toBeInTheDocument();
    screen.getByRole("button", { name: /grant consent/i }).click();
    expect(onGrant).toHaveBeenCalledTimes(1);

    rerender(
      <ConsentCard
        title="Future consent"
        description="Not ready"
        active={false}
        comingSoon
      />,
    );

    expect(screen.getByRole("button", { name: /coming soon/i })).toBeDisabled();
  });
});
