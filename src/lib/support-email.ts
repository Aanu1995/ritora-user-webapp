export const SUPPORT_EMAIL_ENV_KEY = 'NEXT_PUBLIC_SUPPORT_EMAIL';

export function getSupportEmail(): string {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

  if (!supportEmail) {
    throw new Error(`${SUPPORT_EMAIL_ENV_KEY} is not configured`);
  }

  return supportEmail;
}

export function getSupportMailto(): string {
  return `mailto:${getSupportEmail()}`;
}
