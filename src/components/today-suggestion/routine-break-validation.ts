"use client";

import { z } from "zod";

const RESUME_DATE_INVALID_KEY = "validation.resumeDateInvalid";
const RESUME_DATE_PAST_KEY = "validation.resumeDatePast";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const routineBreakResumeSchema = z.object({
  endsAt: z
    .string()
    .trim()
    .superRefine((value, context) => {
      if (value === "") return;
      if (!DATE_PATTERN.test(value)) {
        context.addIssue({
          code: "custom",
          message: RESUME_DATE_INVALID_KEY,
        });
        return;
      }
      const today = new Date();
      const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (value <= todayIso) {
        context.addIssue({
          code: "custom",
          message: RESUME_DATE_PAST_KEY,
        });
      }
    }),
});

export type RoutineBreakResumeValues = z.infer<typeof routineBreakResumeSchema>;

export const routineBreakResumeDefaultValues: RoutineBreakResumeValues = {
  endsAt: "",
};

export function toRoutineBreakEndsAt(value: string): string | null {
  if (!value || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const localMidnight = new Date(year!, (month ?? 1) - 1, day);
  return localMidnight.toISOString();
}

export function toRoutineBreakDatePickerValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMinimumRoutineBreakResumeDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}
