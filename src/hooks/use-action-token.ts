'use client';

import { useEffect, useSyncExternalStore } from 'react';

type UseActionTokenResult = {
  token: string;
  isReady: boolean;
};

type ActionTokenSnapshot = UseActionTokenResult & {
  pathname: string;
};

const EMPTY_ACTION_TOKEN_SNAPSHOT: ActionTokenSnapshot = {
  token: '',
  isReady: false,
  pathname: '',
};

const READY_EMPTY_ACTION_TOKEN_SNAPSHOT: ActionTokenSnapshot = {
  token: '',
  isReady: true,
  pathname: '',
};

const ACTION_TOKEN_STATE_KEY = '__ritoraActionToken';
const ACTION_TOKEN_PATHNAME_STATE_KEY = '__ritoraActionTokenPathname';
let cachedSnapshot = EMPTY_ACTION_TOKEN_SNAPSHOT;

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

function readActionTokenSnapshot(): ActionTokenSnapshot {
  if (typeof window === 'undefined') {
    return EMPTY_ACTION_TOKEN_SNAPSHOT;
  }

  const url = new URL(window.location.href);
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);
  const pathname = url.pathname;
  const historyState =
    typeof window.history.state === 'object' && window.history.state !== null
      ? (window.history.state as Record<string, unknown>)
      : null;
  const stateToken =
    historyState?.[ACTION_TOKEN_PATHNAME_STATE_KEY] === pathname
      ? historyState?.[ACTION_TOKEN_STATE_KEY]
      : '';
  const tokenFromState = typeof stateToken === 'string' ? stateToken : '';
  const token =
    url.searchParams.get('token') ?? hashParams.get('token') ?? tokenFromState;
  const nextSnapshot: ActionTokenSnapshot = token
    ? {
        token,
        isReady: true,
        pathname,
      }
    : {
        ...READY_EMPTY_ACTION_TOKEN_SNAPSHOT,
        pathname,
      };

  if (
    cachedSnapshot.token === nextSnapshot.token &&
    cachedSnapshot.isReady === nextSnapshot.isReady &&
    cachedSnapshot.pathname === nextSnapshot.pathname
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = nextSnapshot;
  return cachedSnapshot;
}

export function useActionToken(): UseActionTokenResult {
  const snapshot = useSyncExternalStore(
    subscribeToLocation,
    readActionTokenSnapshot,
    () => EMPTY_ACTION_TOKEN_SNAPSHOT,
  );

  useEffect(() => {
    if (!snapshot.token) {
      return;
    }

    const url = new URL(window.location.href);
    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const hashParams = new URLSearchParams(hash);
    const hasQueryToken = url.searchParams.has('token');
    const hasHashToken = hashParams.has('token');

    if (hasQueryToken) {
      url.searchParams.delete('token');
    }

    if (hasHashToken) {
      hashParams.delete('token');
      const nextHash = hashParams.toString();
      url.hash = nextHash ? `#${nextHash}` : '';
    }

    const currentState =
      typeof window.history.state === 'object' && window.history.state !== null
        ? (window.history.state as Record<string, unknown>)
        : {};

    window.history.replaceState(
      {
        ...currentState,
        [ACTION_TOKEN_STATE_KEY]: snapshot.token,
        [ACTION_TOKEN_PATHNAME_STATE_KEY]: url.pathname,
      },
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [snapshot.token]);

  return {
    token: snapshot.token,
    isReady: snapshot.isReady,
  };
}
