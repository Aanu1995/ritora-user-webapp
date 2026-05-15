jest.mock('@/lib/api', () => ({
  API_BASE_URL: 'http://localhost:3001/api/v1',
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
  setAccessToken: jest.fn(),
}));

import { deleteRequest, getRequest, patchRequest, postRequest } from '@/lib/api';
import {
  cancelAccountDeletion,
  confirmAccountDeletion,
  forgotPassword,
  getActiveSessions,
  getAppleOAuthStartUrl,
  getCurrentUser,
  getGoogleOAuthStartUrl,
  login,
  logout,
  logoutAll,
  refreshTokens,
  register,
  requestAccountDeletion,
  resendVerification,
  resetPassword,
  updatePreferredLanguage,
  updateProfile,
  updateTimeZone,
  verifyEmail,
} from '@/services/auth.service';

afterEach(() => jest.clearAllMocks());

describe('auth.service', () => {
  it('login calls postRequest with login path', async () => {
    const mockResponse = { accessToken: 'token', user: { id: '1' } };
    (postRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await login({
      email: 'test@example.com',
      password: 'pass',
    });

    expect(postRequest).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'pass',
    });
    expect(result).toEqual(mockResponse);
  });

  it('getGoogleOAuthStartUrl builds backend redirect URL with consent context', () => {
    const result = getGoogleOAuthStartUrl({
      preferredLanguage: 'sv',
      termsAccepted: true,
      privacyPolicyAccepted: true,
    });

    expect(result).toBe(
      'http://localhost:3001/api/v1/auth/google?language=sv&termsAccepted=true&privacyPolicyAccepted=true',
    );
  });

  it('getAppleOAuthStartUrl builds backend redirect URL with consent context', () => {
    const result = getAppleOAuthStartUrl({
      preferredLanguage: 'sv',
      termsAccepted: true,
      privacyPolicyAccepted: true,
    });

    expect(result).toBe(
      'http://localhost:3001/api/v1/auth/apple?language=sv&termsAccepted=true&privacyPolicyAccepted=true',
    );
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
    (postRequest as jest.Mock).mockResolvedValue({});

    await register(input);

    expect(postRequest).toHaveBeenCalledWith('/auth/register', input);
  });

  it('refreshTokens calls postRequest with refresh path', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ accessToken: 'new' });

    const result = await refreshTokens();

    expect(postRequest).toHaveBeenCalledWith('/auth/refresh');
    expect(result.accessToken).toBe('new');
  });

  it('logout calls postRequest with logout path', async () => {
    (postRequest as jest.Mock).mockResolvedValue(undefined);

    await logout();

    expect(postRequest).toHaveBeenCalledWith('/auth/logout');
  });

  it('logoutAll calls postRequest with logout-all path', async () => {
    (postRequest as jest.Mock).mockResolvedValue(undefined);

    await logoutAll();

    expect(postRequest).toHaveBeenCalledWith('/auth/logout-all');
  });

  it('getCurrentUser calls getRequest with me path', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (getRequest as jest.Mock).mockResolvedValue(user);

    const result = await getCurrentUser();

    expect(getRequest).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });

  it('getActiveSessions calls getRequest with sessions path', async () => {
    const sessions = [{ id: 's1' }];
    (getRequest as jest.Mock).mockResolvedValue(sessions);

    const result = await getActiveSessions();

    expect(getRequest).toHaveBeenCalledWith('/auth/sessions');
    expect(result).toEqual(sessions);
  });

  it('verifyEmail calls postRequest with token', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await verifyEmail('tok123');

    expect(postRequest).toHaveBeenCalledWith('/auth/verify-email', {
      token: 'tok123',
    });
  });

  it('resendVerification calls postRequest with email', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await resendVerification('a@b.com');

    expect(postRequest).toHaveBeenCalledWith(
      '/auth/resend-verification',
      { email: 'a@b.com' },
    );
  });

  it('forgotPassword calls postRequest with email', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await forgotPassword('a@b.com');

    expect(postRequest).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'a@b.com',
    });
  });

  it('resetPassword calls postRequest with data', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    await resetPassword({ token: 't', newPassword: 'p' });

    expect(postRequest).toHaveBeenCalledWith('/auth/reset-password', {
      token: 't',
      newPassword: 'p',
    });
  });

  it('requestAccountDeletion calls deleteRequest with password payload', async () => {
    (deleteRequest as jest.Mock).mockResolvedValue({
      status: 'scheduled',
      message: 'Account deletion scheduled',
      scheduledFor: '2026-06-13T12:00:00.000Z',
    });

    const result = await requestAccountDeletion({ password: 'Password1' });

    expect(deleteRequest).toHaveBeenCalledWith('/auth/account', {
      data: { password: 'Password1' },
    });
    expect(result.status).toBe('scheduled');
  });

  it('confirmAccountDeletion calls postRequest with token', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      status: 'scheduled',
      message: 'Account deletion scheduled',
    });

    await confirmAccountDeletion('confirm-token');

    expect(postRequest).toHaveBeenCalledWith(
      '/auth/account/deletion/confirm',
      { token: 'confirm-token' },
    );
  });

  it('cancelAccountDeletion calls postRequest with token', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      message: 'Account deletion has been cancelled',
    });

    await cancelAccountDeletion('cancel-token');

    expect(postRequest).toHaveBeenCalledWith('/auth/account/deletion/cancel', {
      token: 'cancel-token',
    });
  });

  it('updateProfile calls patchRequest with profile data', async () => {
    const payload = { firstName: 'Ada', lastName: 'Lovelace' };
    const mockResponse = { id: '1', ...payload };
    (patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await updateProfile(payload);

    expect(patchRequest).toHaveBeenCalledWith('/users/me', payload);
    expect(result).toEqual(mockResponse);
  });

  it('updatePreferredLanguage calls patchRequest with language data', async () => {
    const payload = { preferredLanguage: 'sv' };
    const mockResponse = { id: '1', preferredLanguage: 'sv' };
    (patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await updatePreferredLanguage(payload);

    expect(patchRequest).toHaveBeenCalledWith(
      '/users/me/language',
      payload,
    );
    expect(result).toEqual(mockResponse);
  });

  it('updateTimeZone calls patchRequest with timezone data', async () => {
    const payload = { timeZone: 'Europe/Stockholm' };
    const mockResponse = { id: '1', timeZone: 'Europe/Stockholm' };
    (patchRequest as jest.Mock).mockResolvedValue(mockResponse);

    const result = await updateTimeZone(payload);

    expect(patchRequest).toHaveBeenCalledWith(
      '/users/me/time-zone',
      payload,
    );
    expect(result).toEqual(mockResponse);
  });
});
