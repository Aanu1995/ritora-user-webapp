import { useSyncExternalStore } from 'react';
import { getBrowserTimeZone } from '@/lib/time-zone';

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

let cachedTimeZone: string | null = null;
let teardownListeners: (() => void) | null = null;

function refreshDeviceTimeZone() {
  const nextTimeZone = getBrowserTimeZone();

  if (nextTimeZone === cachedTimeZone) {
    return;
  }

  cachedTimeZone = nextTimeZone;
  subscribers.forEach((subscriber) => subscriber());
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    refreshDeviceTimeZone();
  }
}

function ensureListeners() {
  if (teardownListeners || typeof window === 'undefined') {
    return;
  }

  cachedTimeZone = getBrowserTimeZone();

  window.addEventListener('focus', refreshDeviceTimeZone);
  window.addEventListener('pageshow', refreshDeviceTimeZone);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  teardownListeners = () => {
    window.removeEventListener('focus', refreshDeviceTimeZone);
    window.removeEventListener('pageshow', refreshDeviceTimeZone);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

function cleanupListeners() {
  if (subscribers.size > 0 || !teardownListeners) {
    return;
  }

  teardownListeners();
  teardownListeners = null;
}

function subscribe(callback: Subscriber) {
  subscribers.add(callback);
  ensureListeners();

  return () => {
    subscribers.delete(callback);
    cleanupListeners();
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (cachedTimeZone === null) {
    cachedTimeZone = getBrowserTimeZone();
  }

  return cachedTimeZone;
}

function getServerSnapshot() {
  return null;
}

export function useDeviceTimeZone() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
