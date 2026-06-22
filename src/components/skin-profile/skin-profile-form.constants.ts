import { z } from "@/lib/zod";
import type {
  ConcernDetails,
  SkinBehavior,
  SkinProfile,
  SkinProfileInput,
} from "@/types/skin-profile";
import {
  SkinProfileWaterHardness,
  SkinProfileWaterSensitivity,
} from "@/types/skin-profile";
import { dayjs } from "@/lib/dayjs";
import { TriStateBooleanValue } from "./skin-profile-domain-values";

export const TOTAL_SKIN_PROFILE_STEPS = 6;
export const countryCodePattern = /^[A-Za-z]{2}$/;
export const MIN_BIRTH_AGE_YEARS = 5;
export const MAX_BIRTH_AGE_YEARS = 80;
const ISO_DATE_FORMAT = "YYYY-MM-DD";
const WATER_REACTION_NOTES_MAX_LENGTH = 180;

const required = (key: string) => z.string().trim().min(1, key);

export function isValidBirthDate(value: string): boolean {
  const parsed = z.iso.date().safeParse(value.trim());

  if (!parsed.success) {
    return false;
  }

  const birthDate = dayjs.utc(parsed.data, ISO_DATE_FORMAT, true);
  const today = dayjs.utc().startOf("day");
  const oldestAllowedBirthDate = today.subtract(MAX_BIRTH_AGE_YEARS, "year");
  const youngestAllowedBirthDate = today.subtract(MIN_BIRTH_AGE_YEARS, "year");

  return (
    birthDate.isSame(oldestAllowedBirthDate) ||
    birthDate.isSame(youngestAllowedBirthDate) ||
    (birthDate.isAfter(oldestAllowedBirthDate) &&
      birthDate.isBefore(youngestAllowedBirthDate))
  );
}

export const skinProfileSchema = z
  .object({
    skinType: required("validation.skinTypeRequired"),
    skinTone: required("validation.skinToneRequired"),
    fitzpatrickPhototype: required("validation.phototypeRequired"),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "validation.dateOfBirthRequired")
      .refine((value) => value.length === ISO_DATE_FORMAT.length, {
        message: "validation.invalidDate",
      })
      .refine((value) => z.iso.date().safeParse(value.trim()).success, {
        message: "validation.invalidDate",
      })
      .refine(isValidBirthDate, {
        message: "validation.birthDateOutOfRange",
      }),
    sexAtBirth: required("validation.sexAtBirthRequired"),
    ethnicity: required("validation.ethnicityRequired"),
    countryCode: z
      .string()
      .max(2)
      .refine((value) => !value || countryCodePattern.test(value), {
        message: "validation.invalidCountryCode",
      }),
    city: z.string().max(100, "validation.cityTooLong"),
    locationConsent: z.boolean(),
    waterHardness: z
      .string()
      .refine(
        (value) =>
          Object.values(SkinProfileWaterHardness).includes(
            value as SkinProfileWaterHardness,
          ),
        { message: "validation.waterHardnessRequired" },
      ),
    waterSensitivity: z
      .string()
      .refine(
        (value) =>
          Object.values(SkinProfileWaterSensitivity).includes(
            value as SkinProfileWaterSensitivity,
          ),
        { message: "validation.waterSensitivityRequired" },
      ),
    waterReactionNotes: z
      .string()
      .trim()
      .max(WATER_REACTION_NOTES_MAX_LENGTH, "validation.waterNotesTooLong"),

    currentConcerns: z.array(z.string()).min(1, "validation.concernsRequired"),
    primaryGoal: required("validation.primaryGoalRequired"),
    concernSeverities: z.record(z.string(), z.string()),

    pihTendency: required("validation.tendencyRequired"),
    melasmaTendency: required("validation.tendencyRequired"),
    keloidTendency: required("validation.tendencyRequired"),
    sunscreenHabit: required("validation.sunscreenHabitRequired"),
    sunscreenTolerance: required("validation.sunscreenToleranceRequired"),

    routinePace: required("validation.routinePaceRequired"),

    fragranceFree: required("validation.fragranceFreeRequired"),
    nonComedogenic: required("validation.nonComedogenicRequired"),
    sunscreenFilter: required("validation.sunscreenFilterRequired"),
    sunscreenFinish: required("validation.sunscreenFinishRequired"),
    budgetTier: required("validation.budgetTierRequired"),
    allowSmartPicks: z.boolean().nullable(),
  })
  .superRefine((value, ctx) => {
    if (
      hasLocationData(value.countryCode, value.city) &&
      !value.locationConsent
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locationConsent"],
        message: "validation.locationConsentRequired",
      });
    }

    value.currentConcerns.forEach((concern) => {
      if (!value.concernSeverities[concern]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["concernSeverities", concern],
          message: "validation.severityRequired",
        });
      }
    });

    if (value.allowSmartPicks === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowSmartPicks"],
        message: "validation.allowSmartPicksRequired",
      });
    }
  });

export type SkinProfileFormValues = z.infer<typeof skinProfileSchema>;

export const DEFAULT_SKIN_PROFILE_VALUES: SkinProfileFormValues = {
  skinType: "",
  skinTone: "",
  fitzpatrickPhototype: "",
  dateOfBirth: "",
  sexAtBirth: "",
  ethnicity: "",
  countryCode: "",
  city: "",
  locationConsent: false,
  waterHardness: SkinProfileWaterHardness.Unknown,
  waterSensitivity: SkinProfileWaterSensitivity.None,
  waterReactionNotes: "",

  currentConcerns: [],
  primaryGoal: "",
  concernSeverities: {},

  pihTendency: "",
  melasmaTendency: "",
  keloidTendency: "",
  sunscreenHabit: "",
  sunscreenTolerance: "",

  routinePace: "",

  fragranceFree: "",
  nonComedogenic: "",
  sunscreenFilter: "",
  sunscreenFinish: "",
  budgetTier: "",
  allowSmartPicks: null,
};

export function hasLocationData(countryCode: string, city: string): boolean {
  return Boolean(countryCode.trim() || city.trim());
}

const boolToTri = (value: boolean | undefined | null): string => {
  if (value === true) return TriStateBooleanValue.Yes;
  if (value === false) return TriStateBooleanValue.No;
  return "";
};

const triToBool = (value: string): boolean | undefined => {
  if (value === TriStateBooleanValue.Yes) return true;
  if (value === TriStateBooleanValue.No) return false;
  return undefined;
};

export function getSkinProfileFormValues(
  profile?: SkinProfile | null,
): SkinProfileFormValues {
  if (!profile) {
    return { ...DEFAULT_SKIN_PROFILE_VALUES };
  }

  const behavior = profile.skinBehavior ?? {};
  const lifestyle = profile.lifestyleContext ?? {};
  const routine = profile.routinePreferences ?? {};

  return {
    skinType: profile.skinType ?? "",
    skinTone: profile.skinTone ?? "",
    fitzpatrickPhototype: profile.fitzpatrickPhototype ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    sexAtBirth: profile.sexAtBirth ?? "",
    ethnicity: profile.ethnicity ?? "",
    countryCode: profile.countryCode ?? "",
    city: profile.city ?? "",
    locationConsent: profile.hasLocationContextConsent,
    waterHardness: lifestyle.water_hardness ?? SkinProfileWaterHardness.Unknown,
    waterSensitivity:
      lifestyle.water_sensitivity ?? SkinProfileWaterSensitivity.None,
    waterReactionNotes: lifestyle.water_reaction_notes ?? "",
    currentConcerns: [...profile.currentConcerns],
    primaryGoal: profile.primaryGoal ?? "",
    concernSeverities: Object.fromEntries(
      (profile.concernDetails?.per_concern ?? [])
        .filter((entry) => entry.concern && entry.severity)
        .map((entry) => [entry.concern, entry.severity ?? ""]),
    ),
    pihTendency: behavior.pih_tendency ?? "",
    melasmaTendency: behavior.melasma_tendency ?? "",
    keloidTendency: behavior.keloid_tendency ?? "",
    sunscreenHabit: behavior.sunscreen_habit ?? "",
    sunscreenTolerance: behavior.sunscreen_tolerance ?? "",
    routinePace: routine.pace ?? "",
    fragranceFree: boolToTri(routine.fragrance_free),
    nonComedogenic: boolToTri(routine.non_comedogenic),
    sunscreenFilter: routine.sunscreen_filter ?? "",
    sunscreenFinish: routine.sunscreen_finish ?? "",
    budgetTier: profile.budgetTier ?? "",
    allowSmartPicks: profile.allowSmartPicks ?? null,
  };
}

export function buildSkinProfilePayload(
  values: SkinProfileFormValues,
  existingProfile: SkinProfile | null | undefined,
  isEdit: boolean,
): SkinProfileInput {
  const toNullableSelect = (
    raw: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    if (raw) return raw;
    if (previous !== null && previous !== undefined) return null;
    return undefined;
  };

  const toNullableString = (
    raw: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    const trimmed = raw.trim();
    if (trimmed) return trimmed;
    if (previous !== null && previous !== undefined) return null;
    return undefined;
  };

  const skinBehavior: SkinBehavior = {};
  if (values.pihTendency) skinBehavior.pih_tendency = values.pihTendency;
  if (values.melasmaTendency)
    skinBehavior.melasma_tendency = values.melasmaTendency;
  if (values.keloidTendency)
    skinBehavior.keloid_tendency = values.keloidTendency;
  if (values.sunscreenHabit)
    skinBehavior.sunscreen_habit = values.sunscreenHabit;
  if (values.sunscreenTolerance)
    skinBehavior.sunscreen_tolerance = values.sunscreenTolerance;

  const lifestyleContext: SkinProfileInput["lifestyleContext"] =
    isEdit && existingProfile?.lifestyleContext
      ? { ...existingProfile.lifestyleContext }
      : {};
  lifestyleContext.water_hardness = values.waterHardness;
  lifestyleContext.water_sensitivity = values.waterSensitivity;
  const waterReactionNotes = values.waterReactionNotes.trim();
  if (waterReactionNotes) {
    lifestyleContext.water_reaction_notes = waterReactionNotes;
  } else if (isEdit && existingProfile?.lifestyleContext.water_reaction_notes) {
    lifestyleContext.water_reaction_notes = null;
  }

  const routinePreferences: SkinProfileInput["routinePreferences"] = {};
  if (values.routinePace) routinePreferences.pace = values.routinePace;
  const fragrance = triToBool(values.fragranceFree);
  if (fragrance !== undefined) routinePreferences.fragrance_free = fragrance;
  const nonComedo = triToBool(values.nonComedogenic);
  if (nonComedo !== undefined) routinePreferences.non_comedogenic = nonComedo;
  if (values.sunscreenFilter)
    routinePreferences.sunscreen_filter = values.sunscreenFilter;
  if (values.sunscreenFinish)
    routinePreferences.sunscreen_finish = values.sunscreenFinish;

  const concernDetails: ConcernDetails = {
    per_concern: values.currentConcerns.map((concern) => {
      const nonPrimaryIndex = values.currentConcerns
        .filter((entry) => entry !== values.primaryGoal)
        .indexOf(concern);

      return {
        concern,
        severity: values.concernSeverities[concern],
        priority: concern === values.primaryGoal ? 1 : nonPrimaryIndex + 2,
      };
    }),
  };

  const payload: SkinProfileInput = {
    dateOfBirth: toNullableString(
      values.dateOfBirth,
      existingProfile?.dateOfBirth,
    ),
    sexAtBirth: toNullableSelect(
      values.sexAtBirth,
      existingProfile?.sexAtBirth,
    ),
    skinType: toNullableSelect(values.skinType, existingProfile?.skinType),
    skinTone: toNullableSelect(values.skinTone, existingProfile?.skinTone),
    fitzpatrickPhototype: toNullableSelect(
      values.fitzpatrickPhototype,
      existingProfile?.fitzpatrickPhototype,
    ),
    ethnicity: toNullableSelect(values.ethnicity, existingProfile?.ethnicity),
    primaryGoal: toNullableSelect(
      values.primaryGoal,
      existingProfile?.primaryGoal,
    ),
    budgetTier: toNullableSelect(
      values.budgetTier,
      existingProfile?.budgetTier,
    ),
    allowSmartPicks: values.allowSmartPicks ?? undefined,
    currentConcerns:
      isEdit || values.currentConcerns.length > 0
        ? values.currentConcerns
        : undefined,
    countryCode: toNullableString(
      values.countryCode.toUpperCase(),
      existingProfile?.countryCode,
    ),
    city: toNullableString(values.city, existingProfile?.city),
  };

  if ((concernDetails.per_concern?.length ?? 0) > 0 || isEdit) {
    payload.concernDetails = concernDetails;
  }

  if (Object.keys(skinBehavior).length > 0 || isEdit) {
    payload.skinBehavior = skinBehavior;
  }

  if (Object.keys(routinePreferences).length > 0 || isEdit) {
    payload.routinePreferences = routinePreferences;
  }

  if (Object.keys(lifestyleContext).length > 0 || isEdit) {
    payload.lifestyleContext = lifestyleContext;
  }

  if (hasLocationData(payload.countryCode ?? "", payload.city ?? "")) {
    payload.locationConsent = values.locationConsent;
  }

  return payload;
}

export function validateLocationStep(
  values: Pick<
    SkinProfileFormValues,
    "countryCode" | "city" | "locationConsent"
  >,
): null | "country" | "consent" {
  const trimmedCountry = values.countryCode.trim();

  if (trimmedCountry && !countryCodePattern.test(trimmedCountry)) {
    return "country";
  }

  if (hasLocationData(trimmedCountry, values.city) && !values.locationConsent) {
    return "consent";
  }

  return null;
}
