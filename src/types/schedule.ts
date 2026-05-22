export enum DayOfWeek {
  Mon = "mon",
  Tue = "tue",
  Wed = "wed",
  Thu = "thu",
  Fri = "fri",
  Sat = "sat",
  Sun = "sun",
}

export const DAY_OF_WEEK_ORDER: Record<DayOfWeek, number> = {
  [DayOfWeek.Mon]: 0,
  [DayOfWeek.Tue]: 1,
  [DayOfWeek.Wed]: 2,
  [DayOfWeek.Thu]: 3,
  [DayOfWeek.Fri]: 4,
  [DayOfWeek.Sat]: 5,
  [DayOfWeek.Sun]: 6,
};

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  DayOfWeek.Mon,
  DayOfWeek.Tue,
  DayOfWeek.Wed,
  DayOfWeek.Thu,
  DayOfWeek.Fri,
  DayOfWeek.Sat,
  DayOfWeek.Sun,
];

export enum SlotMode {
  Manual = "manual",
  AI = "ai",
}

export enum StepLabel {
  Cleanser = "cleanser",
  Toner = "toner",
  Essence = "essence",
  Serum = "serum",
  Moisturizer = "moisturizer",
  SunProtection = "sun-protection",
  Mask = "mask",
  Exfoliant = "exfoliant",
  EyeCare = "eye-care",
  LipCare = "lip-care",
  Treatment = "treatment",
  Other = "other",
  Custom = "custom",
}

export enum SchedulePreset {
  EveryDay = "every_day",
}

export enum AddSlotPresetMode {
  EveryDay = "every_day",
  Single = "single",
}

export enum ScheduleApiErrorCode {
  CustomLabelRequired = "SCHEDULE_CUSTOM_LABEL_REQUIRED",
  MoveConflict = "SCHEDULE_MOVE_CONFLICT",
  ProductsNotOwned = "SCHEDULE_PRODUCTS_NOT_OWNED",
  SlotConflict = "SCHEDULE_SLOT_CONFLICT",
  SlotNotFound = "SCHEDULE_SLOT_NOT_FOUND",
  TooManySteps = "SCHEDULE_TOO_MANY_STEPS",
}

export type Daypart = "morning" | "afternoon" | "evening";

export const MAX_STEPS_PER_SLOT = 10;
export const MAX_SLOT_NOTES_LENGTH = 1000;
export const MAX_STEP_NOTES_LENGTH = 500;
export const MAX_CUSTOM_LABEL_LENGTH = 100;
export const MAX_SPECIALIST_PROVIDER_NAME_LENGTH = 120;
export const MAX_SPECIALIST_CLINIC_NAME_LENGTH = 160;
export const MAX_SPECIALIST_SAFETY_NOTES_LENGTH = 1000;

export type RoutineStepProductSummary = {
  id: string;
  brand: string;
  name: string;
  category: string;
  imageUrl: string | null;
  status: string;
};

export type RoutineStep = {
  id: string;
  stepOrder: number;
  inventoryProductId: string | null;
  stepLabel: StepLabel;
  customLabel: string | null;
  notes: string | null;
  optional: boolean;
  isSpecialistLocked: boolean;
  product: RoutineStepProductSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleSlot = {
  id: string;
  dayOfWeek: DayOfWeek;
  slotTime: string; // HH:MM
  mode: SlotMode;
  slotNotes: string | null;
  specialistProviderName: string | null;
  specialistClinicName: string | null;
  specialistActiveSince: string | null;
  specialistSafetyNotes: string | null;
  steps: RoutineStep[];
  createdAt: string;
  updatedAt: string;
};

export type Schedule = {
  timeZone: string;
  slots: ScheduleSlot[];
};

export type TodaysSchedule = {
  dayOfWeek: DayOfWeek;
  timeZone: string;
  slots: ScheduleSlot[];
};

export type CreateSlotPayload = {
  dayOfWeek: DayOfWeek;
  slotTime: string;
  mode?: SlotMode;
  slotNotes?: string;
  specialistProviderName?: string | null;
  specialistClinicName?: string | null;
  specialistActiveSince?: string | null;
  specialistSafetyNotes?: string | null;
  steps?: RoutineStepInput[];
};

export type UpdateSlotPayload = {
  slotTime?: string;
  mode?: SlotMode;
  slotNotes?: string | null;
  specialistProviderName?: string | null;
  specialistClinicName?: string | null;
  specialistActiveSince?: string | null;
  specialistSafetyNotes?: string | null;
};

export type CreateSlotsPayload = {
  daysOfWeek: DayOfWeek[];
  slotTime: string;
  mode?: SlotMode;
  slotNotes?: string;
  specialistProviderName?: string | null;
  specialistClinicName?: string | null;
  specialistActiveSince?: string | null;
  specialistSafetyNotes?: string | null;
  steps?: RoutineStepInput[];
};

export type ApplyPresetPayload = {
  preset: SchedulePreset;
  slotTime: string;
  mode?: SlotMode;
  slotNotes?: string;
  specialistProviderName?: string | null;
  specialistClinicName?: string | null;
  specialistActiveSince?: string | null;
  specialistSafetyNotes?: string | null;
  steps?: RoutineStepInput[];
};

export type MoveSlotPayload = {
  toDay: DayOfWeek;
  toTime: string;
};

export type RoutineStepInput = {
  id?: string;
  stepOrder: number;
  inventoryProductId: string | null;
  stepLabel: StepLabel;
  customLabel?: string | null;
  notes?: string | null;
  optional?: boolean;
  isSpecialistLocked?: boolean;
};

export type UpsertRoutineStepsPayload = {
  steps: RoutineStepInput[];
};

export function deriveDaypart(slotTime: string): Daypart {
  const [hourStr] = slotTime.split(":");
  const hour = Number.parseInt(hourStr ?? "0", 10);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function formatSlotTimeLabel(slotTime: string): string {
  return slotTime.slice(0, 5);
}

export function compareSlotsChrono(a: ScheduleSlot, b: ScheduleSlot): number {
  const dayDiff =
    DAY_OF_WEEK_ORDER[a.dayOfWeek] - DAY_OF_WEEK_ORDER[b.dayOfWeek];
  if (dayDiff !== 0) return dayDiff;
  return a.slotTime.localeCompare(b.slotTime);
}
