import { isEssentialStepComplete } from "../essential-step-validation";
import {
  DEFAULT_SKIN_PROFILE_VALUES,
  type SkinProfileFormValues,
} from "../skin-profile-form.constants";
import { TriStateBooleanValue } from "../skin-profile-domain-values";

function values(
  overrides: Partial<SkinProfileFormValues> = {},
): SkinProfileFormValues {
  return {
    ...DEFAULT_SKIN_PROFILE_VALUES,
    skinType: "oily",
    skinTone: "deep",
    fitzpatrickPhototype: "V",
    dateOfBirth: "1992-04-15",
    sexAtBirth: "female",
    ethnicity: "Yoruba",
    currentConcerns: ["dark_marks", "acne"],
    primaryGoal: "dark_marks",
    concernSeverities: { dark_marks: "moderate", acne: "mild" },
    pihTendency: "often",
    melasmaTendency: "sometimes",
    keloidTendency: "never",
    sunscreenHabit: "most_days",
    sunscreenTolerance: "fine",
    routinePace: "cautious",
    fragranceFree: TriStateBooleanValue.Yes,
    nonComedogenic: TriStateBooleanValue.Yes,
    sunscreenFilter: "hybrid",
    sunscreenFinish: "natural",
    budgetTier: "mid",
    allowSmartPicks: true,
    ...overrides,
  };
}

describe("isEssentialStepComplete", () => {
  it.each([1, 2, 3, 4, 5, 6] as const)(
    "accepts a complete step %s",
    (step) => {
      expect(isEssentialStepComplete(step, values())).toBe(true);
    },
  );

  it("requires identity fields and a valid birth date on step 1", () => {
    expect(isEssentialStepComplete(1, values({ skinType: "" }))).toBe(false);
    expect(isEssentialStepComplete(1, values({ skinTone: "" }))).toBe(false);
    expect(isEssentialStepComplete(1, values({ sexAtBirth: "" }))).toBe(false);
    expect(isEssentialStepComplete(1, values({ ethnicity: "" }))).toBe(false);
    expect(isEssentialStepComplete(1, values({ dateOfBirth: "2026-02-31" }))).toBe(
      false,
    );
  });

  it("requires concerns, a primary goal, and severities on step 2", () => {
    expect(isEssentialStepComplete(2, values({ currentConcerns: [] }))).toBe(
      false,
    );
    expect(isEssentialStepComplete(2, values({ primaryGoal: "" }))).toBe(false);
    expect(
      isEssentialStepComplete(
        2,
        values({ concernSeverities: { dark_marks: "moderate" } }),
      ),
    ).toBe(false);
  });

  it("requires skin behavior, pace, consent, and budget preferences", () => {
    expect(isEssentialStepComplete(3, values({ pihTendency: "" }))).toBe(false);
    expect(isEssentialStepComplete(4, values({ routinePace: "" }))).toBe(false);
    expect(
      isEssentialStepComplete(
        5,
        values({ countryCode: "SWE", city: "", locationConsent: true }),
      ),
    ).toBe(false);
    expect(
      isEssentialStepComplete(
        5,
        values({ countryCode: "SE", city: "Stockholm", locationConsent: false }),
      ),
    ).toBe(false);
    expect(isEssentialStepComplete(6, values({ fragranceFree: "" }))).toBe(
      false,
    );
    expect(isEssentialStepComplete(6, values({ allowSmartPicks: null }))).toBe(
      false,
    );
  });

  it("treats unknown future steps as complete", () => {
    expect(isEssentialStepComplete(99, values())).toBe(true);
  });
});
