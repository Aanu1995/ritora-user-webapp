import { getSupportEmail, getSupportMailto } from '../support-email';

describe('support email config', () => {
  const originalSupportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  afterEach(() => {
    if (originalSupportEmail === undefined) {
      delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    } else {
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL = originalSupportEmail;
    }
  });

  it('reads the public support email from the environment', () => {
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL = ' help@example.com ';

    expect(getSupportEmail()).toBe('help@example.com');
    expect(getSupportMailto()).toBe('mailto:help@example.com');
  });

  it('throws when the support email is not configured', () => {
    delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

    expect(() => getSupportEmail()).toThrow(
      'NEXT_PUBLIC_SUPPORT_EMAIL is not configured',
    );
  });
});
