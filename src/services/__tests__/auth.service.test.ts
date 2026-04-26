jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
  setAccessToken: jest.fn(),
}));

import * as api from '@/lib/api';
import * as authService from '@/services/auth.service';

afterEach(() => jest.clearAllMocks());

describe('auth.service', () => {
  it('login calls postRequest with login path', async () => {
    const mockResponse = { accessToken: 'token', user: { id: '1' } };
    (api.postRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'pass',
    });

    expect(api.postRequest).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'pass',
    });
    expect(result).toEqual(mockResponse);
  });

  it('register calls postRequest with register path', async () => {
    const input = {
      email: 'a@b.com',
      password: 'p',
      firstName: 'A',
      lastName: 'B',
      preferredLanguage: 'en',
      termsAccepted: true,
      privacyPolicyAccepted: true,
    };
    (api.postRequest as jest.Mock).mockResolvedValue({});

    await authService.register(input);

    expect(api.postRequest).toHaveBeenCalledWith('/auth/register', input);
  });

  it('refreshTokens calls postRequest with refresh path', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ accessToken: 'new' });

    const result = await authService.refreshTokens();

    expect(api.postRequest).toHaveBeenCalledWith('/auth/refresh');
    expect(result.accessToken).toBe('new');
  });

  it('logout calls postRequest with logout path', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue(undefined);

    await authService.logout();

    expect(api.postRequest).toHaveBeenCalledWith('/auth/logout');
  });

  it('logoutAll calls postRequest with logout-all path', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue(undefined);

    await authService.logoutAll();

    expect(api.postRequest).toHaveBeenCalledWith('/auth/logout-all');
  });

  it('getCurrentUser calls getRequest with me path', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (api.getRequest as jest.Mock).mockResolvedValue(user);

    const result = await authService.getCurrentUser();

    expect(api.getRequest).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });

  it('getActiveSessions calls getRequest with sessions path', async () => {
    const sessions = [{ id: 's1' }];
    (api.getRequest as jest.Mock).mockResolvedValue(sessions);

    const result = await authService.getActiveSessions();

    expect(api.getRequest).toHaveBeenCalledWith('/auth/sessions');
    expect(result).toEqual(sessions);
  });

  it('verifyEmail calls postRequest with token', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await authService.verifyEmail('tok123');

    expect(api.postRequest).toHaveBeenCalledWith('/auth/verify-email', {
      token: 'tok123',
    });
  });

  it('resendVerification calls postRequest with email', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await authService.resendVerification('a@b.com');

    expect(api.postRequest).toHaveBeenCalledWith(
      '/auth/resend-verification',
      { email: 'a@b.com' },
    );
  });

  it('forgotPassword calls postRequest with email', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await authService.forgotPassword('a@b.com');

    expect(api.postRequest).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'a@b.com',
    });
  });

  it('resetPassword calls postRequest with data', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await authService.resetPassword({ token: 't', newPassword: 'p' });

    expect(api.postRequest).toHaveBeenCalledWith('/auth/reset-password', {
      token: 't',
      newPassword: 'p',
    });
  });

  it('updateProfile calls patchRequest with profile data', async () => {
    const payload = { firstName: 'Ada', lastName: 'Lovelace' };
    const mockResponse = { id: '1', ...payload };
    (api.patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.updateProfile(payload);

    expect(api.patchRequest).toHaveBeenCalledWith('/users/me', payload);
    expect(result).toEqual(mockResponse);
  });

  it('updatePreferredLanguage calls patchRequest with language data', async () => {
    const payload = { preferredLanguage: 'sv' };
    const mockResponse = { id: '1', preferredLanguage: 'sv' };
    (api.patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.updatePreferredLanguage(payload);

    expect(api.patchRequest).toHaveBeenCalledWith(
      '/users/me/language',
      payload,
    );
    expect(result).toEqual(mockResponse);
  });

  it('updateTimeZone calls patchRequest with timezone data', async () => {
    const payload = { timeZone: 'Europe/Stockholm' };
    const mockResponse = { id: '1', timeZone: 'Europe/Stockholm' };
    (api.patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.updateTimeZone(payload);

    expect(api.patchRequest).toHaveBeenCalledWith(
      '/users/me/time-zone',
      payload,
    );
    expect(result).toEqual(mockResponse);
  });
});
