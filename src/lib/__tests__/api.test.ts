jest.mock('@/i18n/config', () => ({
  getPreferredLocale: jest.fn(() => 'sv'),
}));

jest.mock('@/lib/time-zone', () => ({
  getBrowserTimeZone: jest.fn(() => 'Europe/Stockholm'),
}));

import { applyRequestContext, setAccessToken } from '@/lib/api';

describe('applyRequestContext', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    setAccessToken(null);
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('adds the preferred locale, browser timezone, and auth token to requests', () => {
    setAccessToken('access-token');

    const config = applyRequestContext({
      headers: {},
      url: '/schedule',
      baseURL: 'http://localhost:3001/api/v1',
    } as never);

    expect(config.headers['Accept-Language']).toBe('sv');
    expect(config.headers['x-timezone']).toBe('Europe/Stockholm');
    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('blocks insecure absolute API transport in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() =>
      applyRequestContext({
        headers: {},
        url: '/auth/me',
        baseURL: 'http://api.ritora.com/api/v1',
      } as never),
    ).toThrow('Blocked insecure API transport in production');
  });

  it('allows loopback HTTP API transport in production for local QA and e2e', () => {
    process.env.NODE_ENV = 'production';

    const config = applyRequestContext({
      headers: {},
      url: '/auth/me',
      baseURL: 'http://localhost:3001/api/v1',
    } as never);

    expect(config.baseURL).toBe('http://localhost:3001/api/v1');
  });
});
