import {
  DEFAULT_SKIN_PROFILE_VALUES,
  MAX_BIRTH_AGE_YEARS,
  MIN_BIRTH_AGE_YEARS,
  buildSkinProfilePayload,
  getSkinProfileFormValues,
  hasLocationData,
  isValidBirthDate,
  skinProfileSchema,
  validateLocationStep,
  type SkinProfileFormValues,
} from "../skin-profile-form.constants";
import { dayjs } from "@/lib/dayjs";
import { createReadySkinProfile } from "@/test/skin-profile";

const dateYearsAgo = (years: number, daysOffset = 0) =>
  dayjs
    .utc()
    .startOf("day")
    .subtract(years, "year")
    .add(daysOffset, "day")
    .format("YYYY-MM-DD");

const validValues: SkinProfileFormValues = {
  ...DEFAULT_SKIN_PROFILE_VALUES,
  skinType: "oily",
  skinTone: "medium",
  fitzpatrickPhototype: "IV",
  dateOfBirth: "1992-04-15",
  sexAtBirth: "female",
  ethnicity: "black",
  currentConcerns: ["acne", "dark_marks"],
  primaryGoal: "acne",
  concernSeverities: {
    acne: "moderate",
    dark_marks: "mild",
  },
  pihTendency: "often",
  melasmaTendency: "never",
  keloidTendency: "never",
  sunscreenHabit: "most_days",
  sunscreenTolerance: "fine",
  routinePace: "cautious",
  fragranceFree: "yes",
  nonComedogenic: "yes",
  sunscreenFilter: "hybrid",
  sunscreenFinish: "natural",
  budgetTier: "mid",
  allowSmartPicks: true,
};

describe("skinProfileSchema", () => {
  it("rejects empty essential values", () => {
    const result = skinProfileSchema.safeParse(DEFAULT_SKIN_PROFILE_VALUES);

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toEqual(
        expect.arrayContaining([
          "skinType",
          "dateOfBirth",
          "sexAtBirth",
          "currentConcerns",
          "primaryGoal",
          "allowSmartPicks",
        ]),
      );
    }
  });

  it("requires a severity for every selected concern", () => {
    const result = skinProfileSchema.safeParse({
      ...validValues,
      concernSeverities: {
        acne: "moderate",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.map((issue) => issue.path.join(".")),
      ).toContain("concernSeverities.dark_marks");
    }
  });

  it("rejects invalid birth dates and birth dates outside the 5 to 80 age range", () => {
    const invalidCalendarDate = skinProfileSchema.safeParse({
      ...validValues,
      dateOfBirth: "1992-02-31",
    });
    const tooYoungDate = skinProfileSchema.safeParse({
      ...validValues,
      dateOfBirth: dateYearsAgo(MIN_BIRTH_AGE_YEARS, 1),
    });
    const tooOldDate = skinProfileSchema.safeParse({
      ...validValues,
      dateOfBirth: dateYearsAgo(MAX_BIRTH_AGE_YEARS, -1),
    });

    expect(invalidCalendarDate.success).toBe(false);
    expect(tooYoungDate.success).toBe(false);
    expect(tooOldDate.success).toBe(false);
  });

  it("accepts birth dates on the 5 and 80 year age boundaries", () => {
    const youngestAllowed = skinProfileSchema.safeParse({
      ...validValues,
      dateOfBirth: dateYearsAgo(MIN_BIRTH_AGE_YEARS),
    });
    const oldestAllowed = skinProfileSchema.safeParse({
      ...validValues,
      dateOfBirth: dateYearsAgo(MAX_BIRTH_AGE_YEARS),
    });

    expect(youngestAllowed.success).toBe(true);
    expect(oldestAllowed.success).toBe(true);
  });

  it("exposes small validation helpers used by the stepper", () => {
    expect(isValidBirthDate(dateYearsAgo(30))).toBe(true);
    expect(isValidBirthDate("")).toBe(false);
    expect(hasLocationData("", "")).toBe(false);
    expect(hasLocationData("SE", "")).toBe(true);
    expect(hasLocationData("", "Stockholm")).toBe(true);
    expect(
      validateLocationStep({
        countryCode: "SWE",
        city: "",
        locationConsent: false,
      }),
    ).toBe("country");
    expect(
      validateLocationStep({
        countryCode: "SE",
        city: "Stockholm",
        locationConsent: false,
      }),
    ).toBe("consent");
    expect(
      validateLocationStep({
        countryCode: "SE",
        city: "Stockholm",
        locationConsent: true,
      }),
    ).toBeNull();
  });

  it("builds a complete essential payload", () => {
    expect(buildSkinProfilePayload(validValues, null, false)).toMatchObject({
      dateOfBirth: "1992-04-15",
      sexAtBirth: "female",
      skinType: "oily",
      skinTone: "medium",
      fitzpatrickPhototype: "IV",
      ethnicity: "black",
      currentConcerns: ["acne", "dark_marks"],
      primaryGoal: "acne",
      concernDetails: {
        per_concern: [
          { concern: "acne", severity: "moderate", priority: 1 },
          { concern: "dark_marks", severity: "mild", priority: 2 },
        ],
      },
      skinBehavior: {
        pih_tendency: "often",
        melasma_tendency: "never",
        keloid_tendency: "never",
        sunscreen_habit: "most_days",
        sunscreen_tolerance: "fine",
      },
      routinePreferences: {
        pace: "cautious",
        fragrance_free: true,
        non_comedogenic: true,
        sunscreen_filter: "hybrid",
        sunscreen_finish: "natural",
      },
      budgetTier: "mid",
      allowSmartPicks: true,
    });
  });

  it("does not infer location consent from saved city and country", () => {
    const values = getSkinProfileFormValues(
      createReadySkinProfile({
        countryCode: "SE",
        city: "Stockholm",
        hasLocationContextConsent: false,
      }),
    );

    expect(values.locationConsent).toBe(false);
  });

  it("builds edit payloads that intentionally clear removed profile values", () => {
    const existingProfile = createReadySkinProfile({
      dateOfBirth: "1992-04-15",
      countryCode: "SE",
      city: "Stockholm",
    });

    expect(
      buildSkinProfilePayload(
        {
          ...validValues,
          dateOfBirth: "",
          sexAtBirth: "",
          skinType: "",
          skinTone: "",
          fitzpatrickPhototype: "",
          ethnicity: "",
          primaryGoal: "",
          budgetTier: "",
          currentConcerns: [],
          countryCode: "",
          city: "",
          pihTendency: "",
          melasmaTendency: "",
          keloidTendency: "",
          sunscreenHabit: "",
          sunscreenTolerance: "",
          routinePace: "",
          fragranceFree: "",
          nonComedogenic: "no",
          sunscreenFilter: "",
          sunscreenFinish: "",
          waterReactionNotes: "",
          allowSmartPicks: null,
        },
        existingProfile,
        true,
      ),
    ).toMatchObject({
      dateOfBirth: null,
      sexAtBirth: null,
      skinType: null,
      skinTone: null,
      fitzpatrickPhototype: null,
      ethnicity: null,
      primaryGoal: null,
      budgetTier: null,
      currentConcerns: [],
      countryCode: null,
      city: null,
      concernDetails: { per_concern: [] },
      skinBehavior: {},
      routinePreferences: { non_comedogenic: false },
      lifestyleContext: {
        water_hardness: validValues.waterHardness,
        water_sensitivity: validValues.waterSensitivity,
      },
    });
  });

  it("preserves optional lifestyle data when the mandatory water context is edited", () => {
    const existingProfile = createReadySkinProfile({
      lifestyleContext: {
        sleep: "low",
        stress: "high",
        water_intake: "moderate",
        water_hardness: "hard",
        water_sensitivity: "suspected",
        water_reaction_notes: "Tight after showering",
        diet_flags: ["vegan"],
        smoking: "none",
        alcohol: "low",
        mask_wearing: true,
        shaving: false,
        climate_sensitivities: ["dry_air"],
      },
    });

    expect(
      buildSkinProfilePayload(
        {
          ...validValues,
          waterHardness: "soft",
          waterSensitivity: "none",
          waterReactionNotes: "",
        },
        existingProfile,
        true,
      ).lifestyleContext,
    ).toEqual({
      sleep: "low",
      stress: "high",
      water_intake: "moderate",
      water_hardness: "soft",
      water_sensitivity: "none",
      water_reaction_notes: null,
      diet_flags: ["vegan"],
      smoking: "none",
      alcohol: "low",
      mask_wearing: true,
      shaving: false,
      climate_sensitivities: ["dry_air"],
    });
  });
});
