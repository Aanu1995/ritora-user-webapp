import {
  buildHealthStoredItems,
  buildHormonalStoredItems,
  buildLocationStoredItems,
} from "@/components/settings/privacy-stored-items";
import type { SkinProfile } from "@/types/skin-profile";

function profile(overrides: Partial<SkinProfile> = {}): SkinProfile {
  return {
    id: "profile-1",
    dateOfBirth: null,
    sexAtBirth: null,
    skinType: null,
    skinTone: null,
    ethnicity: null,
    currentConcerns: [],
    countryCode: null,
    city: null,
    fitzpatrickPhototype: null,
    sensitivityLevel: null,
    hydrationLevel: null,
    primaryGoal: null,
    pregnancyStatus: null,
    underDermatologistCare: null,
    allowSmartPicks: false,
    budgetTier: null,
    safetyContext: {},
    reactionHistory: {},
    concernDetails: {},
    skinBehavior: {},
    activeTolerances: {},
    routinePreferences: {},
    lifestyleContext: {},
    shoppingPreferences: {},
    hormonalContext: {},
    completeness: 0,
    hasHealthContextConsent: false,
    hasLocationContextConsent: false,
    hasHormonalContextConsent: false,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z",
    ...overrides,
  };
}

const tOptions = (key: string) => `option:${key}`;
const tConsent = (key: string) => `label:${key}`;

describe("privacy stored item builders", () => {
  it("formats health consent data without exposing empty arrays as values", () => {
    const items = buildHealthStoredItems(
      profile({
        pregnancyStatus: "not_pregnant",
        underDermatologistCare: "yes",
        safetyContext: {
          conditions: ["eczema"],
          medications: [],
          recent_procedures: [
            { type: "peel", performed_at: "2026-04-01" },
            { type: "laser" },
          ],
        },
      }),
      tOptions,
      tConsent,
    );

    expect(items).toEqual([
      {
        label: "label:storedPregnancy",
        value: "option:not_pregnant",
      },
      {
        label: "label:storedConditions",
        value: "option:eczema",
      },
      {
        label: "label:storedMedications",
        value: null,
      },
      {
        label: "label:storedRecentProcedures",
        value: "option:peel (2026-04-01), option:laser",
      },
      {
        label: "label:storedDermatologistCare",
        value: "option:yes",
      },
    ]);
  });

  it("formats location consent data as nullable stored fields", () => {
    const items = buildLocationStoredItems(
      profile({ countryCode: "SE", city: "Stockholm" }),
      tConsent,
    );

    expect(items).toEqual([
      { label: "label:storedCountry", value: "SE" },
      { label: "label:storedCity", value: "Stockholm" },
    ]);
  });

  it("formats hormonal consent data with localized boolean labels", () => {
    const items = buildHormonalStoredItems(
      profile({
        hormonalContext: {
          cycle_pattern: "regular",
          breakout_pattern: "pre_period",
          cycle_related_breakouts: true,
          uses_hormonal_contraception: false,
          menopause_related_changes: undefined,
        },
      }),
      tOptions,
      tConsent,
    );

    expect(items).toEqual([
      {
        label: "label:storedCyclePattern",
        value: "option:regular",
      },
      {
        label: "label:storedBreakoutPattern",
        value: "option:pre_period",
      },
      { label: "label:storedCycleRelated", value: "label:yes" },
      { label: "label:storedHormonalContraception", value: "label:no" },
      { label: "label:storedMenopause", value: null },
    ]);
  });
});
