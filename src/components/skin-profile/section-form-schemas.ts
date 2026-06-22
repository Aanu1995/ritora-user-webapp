import { z } from "@/lib/zod";
import type {
  ActiveTolerances,
  HormonalContext,
  LifestyleContext,
  ReactionEntry,
  RoutinePreferences,
  SafetyContext,
  SkinBehavior,
  SkinProfile,
} from "@/types/skin-profile";
import {
  SkinProfileValue,
  TriStateBooleanValue,
} from "./skin-profile-domain-values";

const optionalString = (max = 100) => z.string().trim().max(max).optional();
const nullableSelect = (max = 100) => z.string().trim().max(max).nullable();
const stringArray = (maxItems = 30, maxLength = 100) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);
const optionalDate = z
  .string()
  .trim()
  .max(20)
  .nullable()
  .optional()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "validation.invalidDate",
  });

export const reactionFormSchema = z.object({
  trigger: z.string().trim().min(1, "validation.required").max(120),
  triggerType: z.string().trim().min(1, "validation.required").max(40),
  certainty: z.string().trim().min(1, "validation.required").max(40),
  reactionTypes: stringArray(12, 40).min(1, "validation.required"),
  severity: z.string().trim().min(1, "validation.required").max(40),
  patchTest: z.boolean(),
});

export type ReactionFormValues = z.infer<typeof reactionFormSchema>;

export const DEFAULT_REACTION_FORM_VALUES: ReactionFormValues = {
  trigger: "",
  triggerType: SkinProfileValue.Ingredient,
  certainty: SkinProfileValue.Suspected,
  reactionTypes: [],
  severity: SkinProfileValue.Mild,
  patchTest: false,
};

export function buildReactionEntry(values: ReactionFormValues): ReactionEntry {
  return {
    trigger: values.trigger.trim(),
    trigger_type: values.triggerType,
    certainty: values.certainty,
    reaction_types: values.reactionTypes,
    severity: values.severity,
    patch_test_confirmed: values.patchTest,
  };
}

const reactionEntrySchema = z.object({
  trigger: z.string().trim().min(1, "validation.required").max(120),
  trigger_type: optionalString(40),
  reaction_types: stringArray(12, 40).optional(),
  severity: optionalString(40),
  certainty: optionalString(40),
  patch_test_confirmed: z.boolean().optional(),
});

const REACTION_HISTORY_REQUIRED_MESSAGE =
  "validation.reactionHistoryRequired";

export const reactionHistorySectionSchema = z
  .object({
    reactionHistory: z.object({
      has_known_reactions: z.boolean().nullable().optional(),
      entries: z.array(reactionEntrySchema).max(50).optional(),
    }),
  })
  .superRefine((value, ctx) => {
    const reactionHistory = value.reactionHistory;
    const entries = reactionHistory.entries ?? [];
    const hasKnownReactions = reactionHistory.has_known_reactions;
    const isAnswered = typeof hasKnownReactions === "boolean";
    const isKnownWithoutEntries =
      hasKnownReactions === true && entries.length === 0;

    if (!isAnswered || isKnownWithoutEntries) {
      ctx.addIssue({
        code: "custom",
        message: REACTION_HISTORY_REQUIRED_MESSAGE,
        path: [],
      });
    }
  });

export type ReactionHistoryFormValues = z.infer<
  typeof reactionHistorySectionSchema
>;

export function getReactionHistoryFormValues(
  profile: SkinProfile,
): ReactionHistoryFormValues {
  const hasKnownReactions = profile.reactionHistory?.has_known_reactions;
  const entries =
    hasKnownReactions === false ? [] : (profile.reactionHistory?.entries ?? []);

  return {
    reactionHistory: {
      has_known_reactions:
        hasKnownReactions ?? (entries.length > 0 ? true : undefined),
      entries,
    },
  };
}

const activeToleranceSchema = z.object({
  tolerance: z.string().trim().min(1, "validation.required").max(40),
  last_used: optionalDate,
});

export const activeToleranceSectionSchema = z.object({
  activeTolerances: z.record(z.string(), activeToleranceSchema),
});

export type ActiveToleranceFormValues = z.infer<
  typeof activeToleranceSectionSchema
>;

export function getActiveToleranceFormValues(
  profile: SkinProfile,
): ActiveToleranceFormValues {
  return { activeTolerances: profile.activeTolerances ?? {} };
}

export const lifestyleSectionSchema = z.object({
  lifestyleContext: z.object({
    sleep: optionalString(40),
    stress: optionalString(40),
    water_intake: optionalString(40),
    water_hardness: optionalString(40),
    water_sensitivity: optionalString(40),
    water_reaction_notes: z.string().trim().max(180).nullable().optional(),
    diet_flags: stringArray(20, 60).optional(),
    smoking: optionalString(40),
    alcohol: optionalString(40),
    sweat_exercise: optionalString(40),
    mask_wearing: z.boolean().optional(),
    shaving: z.boolean().optional(),
    climate_sensitivities: stringArray(20, 60).optional(),
  }),
});

export type LifestyleFormValues = z.infer<typeof lifestyleSectionSchema>;

export function getLifestyleFormValues(
  profile: SkinProfile,
): LifestyleFormValues {
  return { lifestyleContext: profile.lifestyleContext ?? {} };
}

export const skinBehaviorSectionSchema = z.object({
  fitzpatrickPhototype: nullableSelect(4),
  skinBehavior: z.object({
    burn_tendency: optionalString(40),
    tan_tendency: optionalString(40),
    pih_tendency: optionalString(40),
    melasma_tendency: optionalString(40),
    keloid_tendency: optionalString(40),
    daily_sun_exposure_hours: optionalString(40),
    sunscreen_habit: optionalString(40),
    sunscreen_tolerance: optionalString(40),
  }),
  routinePreferences: z.object({
    pace: optionalString(40),
    am_minutes: z.number().int().min(0).max(120).optional(),
    pm_minutes: z.number().int().min(0).max(120).optional(),
    max_active_nights_per_week: z.number().int().min(0).max(7).optional(),
    fragrance_free: z.boolean().optional(),
    non_comedogenic: z.boolean().optional(),
    sunscreen_filter: optionalString(40),
    sunscreen_finish: optionalString(40),
  }),
});

export type SunPigmentFormValues = z.infer<typeof skinBehaviorSectionSchema>;

export function getSunPigmentFormValues(
  profile: SkinProfile,
): SunPigmentFormValues {
  return {
    fitzpatrickPhototype: profile.fitzpatrickPhototype,
    skinBehavior: profile.skinBehavior ?? {},
    routinePreferences: profile.routinePreferences ?? {},
  };
}

export const medicalSafetySectionSchema = z.object({
  pregnancyStatus: nullableSelect(40),
  underDermatologistCare: nullableSelect(40),
  safetyContext: z.object({
    conditions: stringArray(30, 80).optional(),
    medications: stringArray(30, 80).optional(),
    photosensitizing_other: z.boolean().optional(),
    recent_procedures: z
      .array(
        z.object({
          type: z.string().trim().min(1, "validation.required").max(80),
          performed_at: optionalDate,
        }),
      )
      .max(20)
      .optional(),
  }),
});

export type MedicalSafetyFormValues = z.infer<
  typeof medicalSafetySectionSchema
>;

export function getMedicalSafetyFormValues(
  profile: SkinProfile,
): MedicalSafetyFormValues {
  const pregnancyStatus =
    profile.sexAtBirth === SkinProfileValue.Male
      ? SkinProfileValue.NotPregnant
      : profile.pregnancyStatus;

  return {
    pregnancyStatus,
    underDermatologistCare: profile.underDermatologistCare,
    safetyContext: {
      conditions: profile.safetyContext?.conditions ?? [],
      medications: profile.safetyContext?.medications ?? [],
      photosensitizing_other: Boolean(
        profile.safetyContext?.photosensitizing_other,
      ),
      recent_procedures: profile.safetyContext?.recent_procedures ?? [],
    },
  };
}

export function buildMedicalSafetyPayload(values: MedicalSafetyFormValues): {
  pregnancyStatus: string | null;
  underDermatologistCare: string | null;
  safetyContext: SafetyContext;
} {
  return {
    pregnancyStatus: values.pregnancyStatus,
    underDermatologistCare: values.underDermatologistCare,
    safetyContext: values.safetyContext,
  };
}

export const hormonalSectionSchema = z.object({
  cyclePattern: z.string().trim().max(40),
  breakoutPattern: z.string().trim().max(40),
  cycleRelatedBreakouts: z.string().trim().max(40),
  usesHormonalContraception: z.string().trim().max(40),
  menopauseRelatedChanges: z.string().trim().max(40),
});

export type HormonalFormValues = z.infer<typeof hormonalSectionSchema>;

const boolToTri = (value: boolean | undefined): string => {
  if (value === true) return TriStateBooleanValue.Yes;
  if (value === false) return TriStateBooleanValue.No;
  return "";
};

const triToBool = (value: string): boolean | undefined => {
  if (value === TriStateBooleanValue.Yes) return true;
  if (value === TriStateBooleanValue.No) return false;
  return undefined;
};

export function getHormonalFormValues(
  context: HormonalContext,
): HormonalFormValues {
  return {
    cyclePattern: context.cycle_pattern ?? "",
    breakoutPattern: context.breakout_pattern ?? "",
    cycleRelatedBreakouts: boolToTri(context.cycle_related_breakouts),
    usesHormonalContraception: boolToTri(context.uses_hormonal_contraception),
    menopauseRelatedChanges: boolToTri(context.menopause_related_changes),
  };
}

export function buildHormonalPayload(
  values: HormonalFormValues,
): HormonalContext {
  const context: HormonalContext = {};

  if (values.cyclePattern) context.cycle_pattern = values.cyclePattern;
  if (values.breakoutPattern) context.breakout_pattern = values.breakoutPattern;

  const cycleRelated = triToBool(values.cycleRelatedBreakouts);
  if (cycleRelated !== undefined) {
    context.cycle_related_breakouts = cycleRelated;
  }

  const contraception = triToBool(values.usesHormonalContraception);
  if (contraception !== undefined) {
    context.uses_hormonal_contraception = contraception;
  }

  const menopause = triToBool(values.menopauseRelatedChanges);
  if (menopause !== undefined) {
    context.menopause_related_changes = menopause;
  }

  return context;
}

export const ensureLifestyleContext = (
  value: LifestyleContext,
): LifestyleContext => value;

export const ensureSkinBehavior = (value: SkinBehavior): SkinBehavior => value;
export const ensureRoutinePreferences = (
  value: RoutinePreferences,
): RoutinePreferences => value;
export const ensureActiveTolerances = (
  value: ActiveTolerances,
): ActiveTolerances => value;
