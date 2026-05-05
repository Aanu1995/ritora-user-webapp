import { z } from "zod";
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  MAX_CUSTOM_LABEL_LENGTH,
  MAX_SPECIALIST_CLINIC_NAME_LENGTH,
  MAX_SPECIALIST_PROVIDER_NAME_LENGTH,
  MAX_SPECIALIST_SAFETY_NOTES_LENGTH,
  MAX_SLOT_NOTES_LENGTH,
  MAX_STEPS_PER_SLOT,
  MAX_STEP_NOTES_LENGTH,
  SlotMode,
  StepLabel,
} from "@/types/schedule";

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const timeSchema = z.string().regex(TIME_REGEX, "validation.timeFormat");

export const dayOfWeekSchema = z.enum(
  DAYS_OF_WEEK as unknown as [DayOfWeek, ...DayOfWeek[]],
);

export const slotModeSchema = z.nativeEnum(SlotMode);

export const slotNotesSchema = z
  .string()
  .max(MAX_SLOT_NOTES_LENGTH, "validation.slotNotesMax")
  .nullable()
  .optional();

export const slotNotesInputSchema = z
  .string()
  .max(MAX_SLOT_NOTES_LENGTH, "validation.slotNotesMax");

export const specialistProviderNameInputSchema = z
  .string()
  .max(
    MAX_SPECIALIST_PROVIDER_NAME_LENGTH,
    "validation.specialistProviderNameMax",
  );

export const specialistClinicNameInputSchema = z
  .string()
  .max(MAX_SPECIALIST_CLINIC_NAME_LENGTH, "validation.specialistClinicNameMax");

export const specialistSafetyNotesInputSchema = z
  .string()
  .max(
    MAX_SPECIALIST_SAFETY_NOTES_LENGTH,
    "validation.specialistSafetyNotesMax",
  );

export const specialistActiveSinceInputSchema = z
  .string()
  .refine(
    (value) => value.length === 0 || DATE_ONLY_REGEX.test(value),
    "validation.specialistActiveSinceFormat",
  );

export const stepLabelSchema = z.nativeEnum(StepLabel);

export const daySelectionSchema = z
  .array(dayOfWeekSchema)
  .min(1, "addDialog.selectAtLeastOneDay");

export const createSlotsFormSchema = z
  .object({
    daysOfWeek: daySelectionSchema,
    slotTime: timeSchema,
    mode: slotModeSchema,
  })
  .strict();

export type CreateSlotsFormValues = z.infer<typeof createSlotsFormSchema>;

export const applyPresetFormSchema = z
  .object({
    slotTime: timeSchema,
    mode: slotModeSchema,
    slotNotes: slotNotesSchema,
  })
  .strict();

export type ApplyPresetFormValues = z.infer<typeof applyPresetFormSchema>;

export const routineStepBaseSchema = z.object({
  id: z.string().optional(),
  stepOrder: z.number().int().min(0),
  inventoryProductId: z.string().nullable(),
  stepLabel: stepLabelSchema,
  customLabel: z
    .string()
    .max(MAX_CUSTOM_LABEL_LENGTH, "validation.customLabelMax")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(MAX_STEP_NOTES_LENGTH, "validation.stepNotesMax")
    .nullable()
    .optional(),
  optional: z.boolean().optional(),
  isSpecialistLocked: z.boolean().optional(),
});

export const routineStepSchema = routineStepBaseSchema.refine(
  (value) =>
    value.stepLabel !== StepLabel.Custom || Boolean(value.customLabel?.trim()),
  {
    path: ["customLabel"],
    message: "validation.customLabelRequired",
  },
);

export const routineStepsSchema = z
  .array(routineStepSchema)
  .max(MAX_STEPS_PER_SLOT, "validation.maxSteps");

export const scheduleEditorFormSchema = z
  .object({
    slotTime: timeSchema,
    mode: slotModeSchema,
    slotNotes: slotNotesInputSchema,
    specialistProviderName: specialistProviderNameInputSchema,
    specialistClinicName: specialistClinicNameInputSchema,
    specialistActiveSince: specialistActiveSinceInputSchema,
    specialistSafetyNotes: specialistSafetyNotesInputSchema,
    steps: z.array(routineStepBaseSchema),
  })
  .superRefine((value, ctx) => {
    if (value.mode !== SlotMode.Manual) {
      return;
    }

    const parsedSteps = routineStepsSchema.safeParse(value.steps);

    if (!parsedSteps.success) {
      const firstIssue = parsedSteps.error.issues[0];

      if (firstIssue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps"],
          message: firstIssue.message,
        });
      }
    }
  });

export type ScheduleEditorFormValues = z.infer<typeof scheduleEditorFormSchema>;
