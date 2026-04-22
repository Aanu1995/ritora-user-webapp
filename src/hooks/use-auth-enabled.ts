'use client';

import { useAuthStore } from '@/stores/auth-store';

export function useAuthEnabled(enabled: boolean = true): boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated && enabled;
}
