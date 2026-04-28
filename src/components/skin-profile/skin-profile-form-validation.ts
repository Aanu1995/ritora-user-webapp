import { firstFieldError } from "@/lib/form-errors";
import {
  skinProfileSchema,
  TOTAL_SKIN_PROFILE_STEPS,
  type SkinProfileFormValues,
} from "./skin-profile-form.constants";

export const STEP_KEYS = [
  "baseline",
  "concernsPriority",
  "sunPigmentStep",
  "routineBaseline",
  "preferences",
] as const;

export const ALL_STEP_NUMBERS = [1, 2, 3, 4, 5] as const;

export function clampStep(step: number): number {
  return Math.min(Math.max(step, 1), TOTAL_SKIN_PROFILE_STEPS);
}

export function getValidationErrors(
  values: SkinProfileFormValues,
  translate: (key: string) => string,
): Partial<Record<string, string>> {
  const result = skinProfileSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<Partial<Record<string, string>>>(
    (errors, issue) => {
      const path = issue.path.join(".");
      if (errors[path]) {
        return errors;
      }

      errors[path] =
        firstFieldError([{ message: issue.message }], translate) ??
        issue.message;
      return errors;
    },
    {},
  );
}
