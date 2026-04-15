import { z } from 'zod';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

export const passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'validation.firstNameRequired'),
    lastName: z.string().trim().min(1, 'validation.lastNameRequired'),
    email: z
      .string()
      .min(1, 'validation.emailRequired')
      .email('validation.emailInvalid'),
    password: z
      .string()
      .min(1, 'validation.passwordRequired')
      .regex(passwordPattern, 'validation.passwordPattern'),
    confirmPassword: z.string().min(1, 'validation.passwordRequired'),
    termsAccepted: z.boolean(),
    privacyPolicyAccepted: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (
      value.password &&
      value.confirmPassword &&
      value.password !== value.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'validation.passwordMismatch',
      });
    }

    if (!value.termsAccepted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['termsAccepted'],
        message: 'validation.termsRequired',
      });
    }

    if (!value.privacyPolicyAccepted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['privacyPolicyAccepted'],
        message: 'validation.privacyRequired',
      });
    }
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}
