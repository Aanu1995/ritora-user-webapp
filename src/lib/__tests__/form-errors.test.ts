import { firstFieldError } from '@/lib/form-errors';

const t = (key: string) => `translated:${key}`;

describe('firstFieldError', () => {
  it('returns undefined when errors is null/undefined', () => {
    expect(firstFieldError(null, t)).toBeUndefined();
    expect(firstFieldError(undefined, t)).toBeUndefined();
  });

  it('returns undefined for an empty array', () => {
    expect(firstFieldError([], t)).toBeUndefined();
  });

  it('returns undefined when no issue carries a message', () => {
    expect(firstFieldError([null, undefined, {}], t)).toBeUndefined();
  });

  it('returns a plain message verbatim when it has no dot', () => {
    expect(firstFieldError([{ message: 'Already localised' }], t)).toBe(
      'Already localised',
    );
  });

  it('translates dotted keys through the supplied translator', () => {
    expect(firstFieldError([{ message: 'validation.emailRequired' }], t)).toBe(
      'translated:validation.emailRequired',
    );
  });

  it('picks the first issue that carries a message', () => {
    const errors = [
      null,
      { message: '' }, // falsy — skipped
      { message: 'validation.passwordPattern' },
      { message: 'validation.passwordRequired' }, // later issue ignored
    ];
    expect(firstFieldError(errors, t)).toBe(
      'translated:validation.passwordPattern',
    );
  });

  it('returns raw message when the translator throws', () => {
    const throwingTranslator = () => {
      throw new Error('missing key');
    };
    expect(
      firstFieldError([{ message: 'validation.emailRequired' }], throwingTranslator),
    ).toBe('validation.emailRequired');
  });

  it('does not try to translate normal sentences that contain punctuation', () => {
    expect(
      firstFieldError(
        [{ message: 'An account with this email already exists. Try logging in instead.' }],
        t,
      ),
    ).toBe('An account with this email already exists. Try logging in instead.');
  });
});
