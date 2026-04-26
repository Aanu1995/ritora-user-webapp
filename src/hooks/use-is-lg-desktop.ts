import { useSyncExternalStore } from 'react';

const LG_BREAKPOINT = 1024;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.innerWidth >= LG_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

export function useIsLgDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
