import { ApiError } from '@/lib/api-error';
import { appQueryClient, createAppQueryClient } from '@/lib/query-client';

function getRetryHandler() {
  const retry = createAppQueryClient().getDefaultOptions().queries?.retry;

  if (typeof retry !== 'function') {
    throw new Error('Expected query retry option to be a function');
  }

  return retry;
}

describe('query client configuration', () => {
  it('uses the expected defaults for app queries', () => {
    const client = createAppQueryClient();
    const defaults = client.getDefaultOptions().queries;

    expect(defaults?.staleTime).toBe(60_000);
    expect(defaults?.refetchOnWindowFocus).toBe(false);
  });

  it('does not retry client errors', () => {
    const retry = getRetryHandler();

    expect(
      retry(0, new ApiError('Bad request', { status: 400 })),
    ).toBe(false);
  });

  it('retries a server error once and then stops', () => {
    const retry = getRetryHandler();

    expect(
      retry(0, new ApiError('Server error', { status: 500 })),
    ).toBe(true);
    expect(retry(1, new Error('Still failing'))).toBe(false);
  });

  it('exports a shared app query client instance', () => {
    expect(appQueryClient).toBeDefined();
    expect(appQueryClient.getDefaultOptions().queries?.staleTime).toBe(60_000);
  });
});
