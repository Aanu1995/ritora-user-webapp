import { z } from 'zod';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  MAX_CUSTOM_LABEL_LENGTH,
  MAX_SLOT_NOTES_LENGTH,
  MAX_STEPS_PER_SLOT,
  MAX_STEP_NOTES_LENGTH,
  SlotMode,
  StepLabel,
} from '@/types/schedule';

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeSchema = z
  .string()
  .regex(TIME_REGEX, 'schedule.validation.timeFormat');

export const dayOfWeekSchema = z.enum(
  DAYS_OF_WEEK as unknown as [DayOfWeek, ...DayOfWeek[]],
);

export const slotModeSchema = z.nativeEnum(SlotMode);

export const slotNotesSchema = z
  .string()
  .max(MAX_SLOT_NOTES_LENGTH, 'schedule.validation.slotNotesMax')
  .nullable()
  .optional();

export const stepLabelSchema = z.nativeEnum(StepLabel);

export const addSlotFormSchema = z
  .object({
    dayOfWeek: dayOfWeekSchema,
    slotTime: timeSchema,
    mode: slotModeSchema.default(SlotMode.AI),
    slotNotes: slotNotesSchema,
  })
  .strict();

export type AddSlotFormValues = z.infer<typeof addSlotFormSchema>;

export const applyPresetFormSchema = z
  .object({
    slotTime: timeSchema,
    mode: slotModeSchema.default(SlotMode.AI),
    slotNotes: slotNotesSchema,
  })
  .strict();

export type ApplyPresetFormValues = z.infer<typeof applyPresetFormSchema>;

export const routineStepSchema = z
  .object({
    id: z.string().optional(),
    stepOrder: z.number().int().min(0),
    inventoryProductId: z.string().nullable(),
    stepLabel: stepLabelSchema,
    customLabel: z
      .string()
      .max(MAX_CUSTOM_LABEL_LENGTH, 'schedule.validation.customLabelMax')
      .nullable()
      .optional(),
    notes: z
      .string()
      .max(MAX_STEP_NOTES_LENGTH, 'schedule.validation.stepNotesMax')
      .nullable()
      .optional(),
    optional: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.stepLabel !== StepLabel.Custom ||
      Boolean(value.customLabel?.trim()),
    {
      path: ['customLabel'],
      message: 'schedule.validation.customLabelRequired',
    },
  );

export const routineStepsSchema = z
  .array(routineStepSchema)
  .max(MAX_STEPS_PER_SLOT, 'schedule.validation.maxSteps');
