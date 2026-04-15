'use client';

import { useEffect, useSyncExternalStore } from 'react';

type UseActionTokenResult = {
  token: string;
  isReady: boolean;
};

const EMPTY_ACTION_TOKEN_SNAPSHOT: UseActionTokenResult = {
  token: '',
  isReady: false,
};

const EMPTY_LOCATION_SNAPSHOT = '';

function readLocationSnapshot(): string {
  if (typeof window === 'undefined') {
    return EMPTY_LOCATION_SNAPSHOT;
  }

  return `${window.location.search}|${window.location.hash}`;
}

function subscribeToLocation(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleLocationChange = () => {
    callback();
  };

  window.addEventListener('hashchange', handleLocationChange);
  window.addEventListener('popstate', handleLocationChange);

  return () => {
    window.removeEventListener('hashchange', handleLocationChange);
    window.removeEventListener('popstate', handleLocationChange);
  };
}

export function useActionToken(): UseActionTokenResult {
  const locationSnapshot = useSyncExternalStore(
    subscribeToLocation,
    readLocationSnapshot,
    () => EMPTY_LOCATION_SNAPSHOT,
  );
  const snapshot =
    typeof window === 'undefined'
      ? EMPTY_ACTION_TOKEN_SNAPSHOT
      : (() => {
          const url = new URL(window.location.href);
          const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
          const hashParams = new URLSearchParams(hash);

          return {
            token:
              url.searchParams.get('token') ?? hashParams.get('token') ?? '',
            isReady: true,
          };
        })();

  useEffect(() => {
    if (snapshot.token) {
      const url = new URL(window.location.href);
      const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
      const hashParams = new URLSearchParams(hash);
      const hasQueryToken = url.searchParams.has('token');
      const hasHashToken = hashParams.has('token');

      if (!hasQueryToken && !hasHashToken) {
        return;
      }

      if (hasQueryToken) {
        url.searchParams.delete('token');
      }

      if (hasHashToken) {
        hashParams.delete('token');
        const nextHash = hashParams.toString();
        url.hash = nextHash ? `#${nextHash}` : '';
      }

      window.history.replaceState(
        null,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  }, [locationSnapshot, snapshot.token]);

  return snapshot;
}
