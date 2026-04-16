import { renderHook, waitFor } from '@testing-library/react';
import { useActionToken } from '@/hooks/use-action-token';

describe('useActionToken', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/reset-password');
  });

  it('reads a query token and preserves unrelated hash fragments', async () => {
    window.history.replaceState(
      null,
      '',
      '/reset-password?token=query-token#section-2',
    );

    const { result, rerender } = renderHook(() => useActionToken());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.token).toBe('query-token');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#section-2');

    rerender();

    expect(result.current.token).toBe('query-token');
  });

  it('restores the token from browser history state after the URL is cleaned', async () => {
    window.history.replaceState(
      null,
      '',
      '/reset-password?token=query-token#section-2',
    );

    const firstRender = renderHook(() => useActionToken());

    await waitFor(() => {
      expect(firstRender.result.current.isReady).toBe(true);
    });

    expect(firstRender.result.current.token).toBe('query-token');
    firstRender.unmount();

    const secondRender = renderHook(() => useActionToken());

    await waitFor(() => {
      expect(secondRender.result.current.isReady).toBe(true);
    });

    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#section-2');
    expect(secondRender.result.current.token).toBe('query-token');
  });

  it('reads a hash token and keeps other hash params intact', async () => {
    window.history.replaceState(
      null,
      '',
      '/verify-email#token=hash-token&step=confirm',
    );

    const { result, rerender } = renderHook(() => useActionToken());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.token).toBe('hash-token');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#step=confirm');

    rerender();

    expect(result.current.token).toBe('hash-token');
  });
});
