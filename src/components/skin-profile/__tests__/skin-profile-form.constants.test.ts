import {
  DEFAULT_SKIN_PROFILE_VALUES,
  MAX_BIRTH_AGE_YEARS,
  MIN_BIRTH_AGE_YEARS,
  buildSkinProfilePayload,
  skinProfileSchema,
  type SkinProfileFormValues,
} from "../skin-profile-form.constants";
import { dayjs } from "@/lib/dayjs";

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
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain(
        "concernSeverities.dark_marks",
      );
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
});
