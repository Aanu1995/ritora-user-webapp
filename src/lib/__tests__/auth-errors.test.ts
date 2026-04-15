import { getAuthErrorMessage } from '@/lib/auth-errors';

/**
 * Tiny translator stub that returns the key verbatim. It lets us assert
 * which i18n key the helper resolves without pulling in next-intl.
 */
const t = (key: string) => key;

describe('getAuthErrorMessage', () => {
  it('returns fallback key when error is null/undefined', () => {
    expect(getAuthErrorMessage(null, t)).toBe('errors.unknown');
    expect(getAuthErrorMessage(undefined, t)).toBe('errors.unknown');
  });

  it('uses a custom fallback key when provided', () => {
    expect(getAuthErrorMessage(null, t, 'errors.serverError')).toBe(
      'errors.serverError',
    );
  });

  it('returns networkError when status is missing', () => {
    const err = { body: { message: 'network down' } };
    expect(getAuthErrorMessage(err, t)).toBe('errors.networkError');
  });

  it('returns networkError when status is 0', () => {
    const err = { status: 0 };
    expect(getAuthErrorMessage(err, t)).toBe('errors.networkError');
  });

  it('maps known server codes through CODE_TO_KEY', () => {
    expect(
      getAuthErrorMessage(
        { status: 401, body: { code: 'INVALID_CREDENTIALS' } },
        t,
      ),
    ).toBe('errors.invalidCredentials');

    expect(
      getAuthErrorMessage(
        { status: 409, body: { code: 'EMAIL_IN_USE' } },
        t,
      ),
    ).toBe('errors.emailInUse');

    expect(
      getAuthErrorMessage(
        { status: 404, body: { code: 'USER_NOT_FOUND' } },
        t,
      ),
    ).toBe('errors.userNotFound');

    expect(
      getAuthErrorMessage(
        { status: 410, body: { code: 'TOKEN_EXPIRED' } },
        t,
      ),
    ).toBe('errors.tokenExpired');

    expect(
      getAuthErrorMessage(
        { status: 423, body: { code: 'ACCOUNT_LOCKED' } },
        t,
      ),
    ).toBe('errors.accountLocked');
  });

  it('normalises server codes to uppercase before lookup', () => {
    expect(
      getAuthErrorMessage(
        { status: 401, body: { code: 'invalid_credentials' } },
        t,
      ),
    ).toBe('errors.invalidCredentials');
  });

  it('falls through to status mapping when code is unknown', () => {
    expect(
      getAuthErrorMessage(
        { status: 401, body: { code: 'SOMETHING_WEIRD' } },
        t,
      ),
    ).toBe('errors.invalidCredentials');

    expect(getAuthErrorMessage({ status: 403 }, t)).toBe('errors.forbidden');
    expect(getAuthErrorMessage({ status: 429 }, t)).toBe('errors.rateLimit');
    expect(getAuthErrorMessage({ status: 500 }, t)).toBe('errors.serverError');
    expect(getAuthErrorMessage({ status: 503 }, t)).toBe('errors.serverError');
  });

  it('returns a short server-supplied message verbatim when no mapping matches', () => {
    expect(
      getAuthErrorMessage(
        {
          status: 418, // unmapped teapot
          body: { message: 'Coffee machine is on strike' },
        },
        t,
      ),
    ).toBe('Coffee machine is on strike');
  });

  it('ignores long or multi-line server messages and returns fallback', () => {
    const longMessage = 'x'.repeat(250);
    expect(
      getAuthErrorMessage({ status: 418, body: { message: longMessage } }, t),
    ).toBe('errors.unknown');

    expect(
      getAuthErrorMessage(
        { status: 418, body: { message: 'line1\nline2' } },
        t,
      ),
    ).toBe('errors.unknown');
  });

  it('falls back to err.message when body is missing', () => {
    expect(
      getAuthErrorMessage(
        { status: 418, message: 'Teapot service unavailable' },
        t,
      ),
    ).toBe('Teapot service unavailable');
  });

  it('returns fallback when neither code nor status nor message match', () => {
    expect(getAuthErrorMessage({ status: 418 }, t)).toBe('errors.unknown');
  });
});
