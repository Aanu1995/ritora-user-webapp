import { z } from "zod";

export const passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "validation.firstNameRequired"),
    lastName: z.string().trim().min(1, "validation.lastNameRequired"),
    email: z
      .string()
      .min(1, "validation.emailRequired")
      .email("validation.emailInvalid"),
    password: z
      .string()
      .min(1, "validation.passwordRequired")
      .regex(passwordPattern, "validation.passwordPattern"),
    confirmPassword: z.string().min(1, "validation.passwordRequired"),
    termsAccepted: z
      .boolean()
      .refine((value) => value, "validation.termsRequired"),
    privacyPolicyAccepted: z
      .boolean()
      .refine((value) => value, "validation.privacyRequired"),
  })
  .superRefine((value, ctx) => {
    if (
      value.password &&
      value.confirmPassword &&
      value.password !== value.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "validation.passwordMismatch",
      });
    }
  });

export type RegisterValues = z.infer<typeof registerSchema>;
