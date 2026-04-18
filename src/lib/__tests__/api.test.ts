import axios from 'axios';
import { ApiError, getApiErrorBody, getApiErrorStatus } from '@/lib/api-error';
import { LOCALE_COOKIE } from '@/i18n/config';
import {
  deleteRequest,
  getAccessToken,
  getRequest,
  isAllowedApiRequestUrl,
  postRequest,
  patchRequest,
  putRequest,
  setAccessToken,
  setUnauthorizedHandler,
  shouldSendCredentialCookies,
} from '@/lib/api';

type MockAxiosInstance = {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  request: jest.Mock;
  interceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };
};

type MockAxiosModule = {
  create: jest.Mock<MockAxiosInstance, []>;
  isAxiosError: jest.Mock<boolean, [unknown]>;
  _requestUse: jest.Mock;
  _responseUse: jest.Mock;
  _instance: MockAxiosInstance;
};

jest.mock('axios', () => {
  const requestUse = jest.fn();
  const responseUse = jest.fn();
  const instance: MockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  };

  const mockAxios: MockAxiosModule = {
    create: jest.fn(),
    isAxiosError: jest.fn(),
    _requestUse: requestUse,
    _responseUse: responseUse,
    _instance: instance,
  };

  mockAxios.create.mockReturnValue(instance);

  return { __esModule: true, default: mockAxios };
});

const mockedAxios = axios as unknown as MockAxiosModule;
const mockInstance = mockedAxios._instance;
const requestInterceptor = mockedAxios._requestUse.mock.calls[0]?.[0] as (
  config: Record<string, unknown>,
) => Record<string, unknown>;
const responseErrorHandler = mockedAxios._responseUse.mock.calls[0]?.[1] as (
  error: unknown,
) => Promise<unknown>;

afterEach(() => {
  jest.clearAllMocks();
  setAccessToken(null);
  setUnauthorizedHandler(null);
  document.documentElement.lang = 'en';
  document.cookie = `${LOCALE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

describe('api client', () => {
  describe('setAccessToken / getAccessToken', () => {
    it('stores and retrieves token', () => {
      setAccessToken('tok-123');
      expect(getAccessToken()).toBe('tok-123');
    });

    it('clears token with null', () => {
      setAccessToken('tok-123');
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('request target security', () => {
    it('allows only same-origin API request URLs', () => {
      expect(isAllowedApiRequestUrl('/inventory/products')).toBe(true);
      expect(
        isAllowedApiRequestUrl(
          'http://localhost:3001/api/v1/inventory/products',
        ),
      ).toBe(true);
      expect(isAllowedApiRequestUrl('https://evil.example/collect')).toBe(false);
    });

    it('sends credential cookies to session and locale-sync endpoints', () => {
      expect(shouldSendCredentialCookies('/auth/login')).toBe(true);
      expect(shouldSendCredentialCookies('/auth/refresh')).toBe(true);
      expect(shouldSendCredentialCookies('/users/me/language')).toBe(true);
      expect(shouldSendCredentialCookies('/inventory/products')).toBe(false);
    });

    it('blocks unexpected API origins before the request is sent', () => {
      expect(() =>
        requestInterceptor({
          url: 'https://evil.example/collect',
          headers: {},
        }),
      ).toThrow(ApiError);
    });

    it('attaches bearer auth only to allowed API requests', () => {
      setAccessToken('tok-123');

      const config = requestInterceptor({
        url: '/inventory/products',
        headers: {},
      });

      expect(config.withCredentials).toBe(false);
      expect(config.headers).toEqual(
        expect.objectContaining({
          Authorization: 'Bearer tok-123',
        }),
      );
    });

    it('attaches the active locale to every API request', () => {
      document.documentElement.lang = 'sv';

      const config = requestInterceptor({
        url: '/inventory/products',
        headers: {},
      });

      expect(config.headers).toEqual(
        expect.objectContaining({
          'Accept-Language': 'sv',
        }),
      );
    });

    it('falls back to the persisted locale cookie when document lang is absent', () => {
      document.documentElement.lang = '';
      document.cookie = `${LOCALE_COOKIE}=sv; path=/`;

      const config = requestInterceptor({
        url: '/catalogue/products/search',
        headers: {},
      });

      expect(config.headers).toEqual(
        expect.objectContaining({
          'Accept-Language': 'sv',
        }),
      );
    });
  });

  describe('getRequest', () => {
    it('returns data on success', async () => {
      mockInstance.get.mockResolvedValue({ data: { id: 1 } });

      const result = await getRequest('/test');

      expect(mockInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual({ id: 1 });
    });

    it('throws server error on failure', async () => {
      const axiosError = {
        response: { status: 404, data: { message: 'Not found' } },
      };
      mockInstance.get.mockRejectedValue(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(getRequest('/test')).rejects.toThrow('Not found');
    });

    it('throws fallback message for non-axios errors', async () => {
      mockInstance.get.mockRejectedValue(new Error('network'));
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

      await expect(getRequest('/test')).rejects.toThrow(
        'Failed to fetch /test',
      );
    });
  });

  describe('postRequest', () => {
    it('posts data and returns response', async () => {
      mockInstance.post.mockResolvedValue({ data: { ok: true } });

      const result = await postRequest('/test', { foo: 'bar' });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/test',
        { foo: 'bar' },
        undefined,
      );
      expect(result).toEqual({ ok: true });
    });

    it('throws server error with status', async () => {
      const axiosError = {
        response: { status: 401, data: { message: 'Unauthorized' } },
      };
      mockInstance.post.mockRejectedValue(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      try {
        await postRequest('/test');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as Error).message).toBe('Unauthorized');
        expect(getApiErrorStatus(err)).toBe(401);
        expect(getApiErrorBody(err)).toEqual({ message: 'Unauthorized' });
      }
    });
  });

  describe('patchRequest', () => {
    it('patches data and returns response', async () => {
      mockInstance.patch.mockResolvedValue({ data: { updated: true } });

      const result = await patchRequest('/test', { field: 'value' });

      expect(mockInstance.patch).toHaveBeenCalledWith(
        '/test',
        { field: 'value' },
        undefined,
      );
      expect(result).toEqual({ updated: true });
    });
  });

  describe('putRequest', () => {
    it('puts data and returns response', async () => {
      mockInstance.put.mockResolvedValue({ data: { replaced: true } });

      const result = await putRequest('/test', { data: 1 });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/test',
        { data: 1 },
        undefined,
      );
      expect(result).toEqual({ replaced: true });
    });
  });

  describe('deleteRequest', () => {
    it('deletes and returns response', async () => {
      mockInstance.delete.mockResolvedValue({ data: undefined });

      const result = await deleteRequest('/test');

      expect(mockInstance.delete).toHaveBeenCalledWith('/test', undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('401 refresh handling', () => {
    it('refreshes once and retries the failed request', async () => {
      const originalRequest = { url: '/protected', headers: {} };

      mockInstance.post.mockResolvedValueOnce({
        data: { accessToken: 'fresh-token' },
      });
      mockInstance.request.mockResolvedValueOnce({ data: { ok: true } });
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      const result = await responseErrorHandler({
        config: originalRequest,
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/auth/refresh',
        undefined,
        expect.objectContaining({ _skipAuthRefresh: true }),
      );
      expect(mockInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/protected',
          _retry: true,
          headers: expect.objectContaining({
            Authorization: 'Bearer fresh-token',
          }),
        }),
      );
      expect(getAccessToken()).toBe('fresh-token');
      expect(result).toEqual({ data: { ok: true } });
    });

    it('uses a single refresh request for concurrent 401 responses', async () => {
      const originalRequestA = { url: '/protected-a', headers: {} };
      const originalRequestB = { url: '/protected-b', headers: {} };
      let resolveRefresh:
        | ((value: { data: { accessToken: string } }) => void)
        | undefined;

      mockInstance.post.mockReturnValue(
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
      );
      mockInstance.request.mockResolvedValue({ data: { ok: true } });
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      const requestA = responseErrorHandler({
        config: originalRequestA,
        response: { status: 401, data: { message: 'Unauthorized' } },
      });
      const requestB = responseErrorHandler({
        config: originalRequestB,
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      expect(mockInstance.post).toHaveBeenCalledTimes(1);

      resolveRefresh?.({ data: { accessToken: 'shared-token' } });

      await Promise.all([requestA, requestB]);

      expect(mockInstance.request).toHaveBeenCalledTimes(2);
      expect(getAccessToken()).toBe('shared-token');
    });
  });
});
