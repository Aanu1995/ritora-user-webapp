'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteTransitionScreen } from '@/components/auth/route-transition-screen';
import { AppRoute } from '@/constants/app-routes';
import { useAuthStore } from '@/stores/auth-store';

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(AppRoute.Dashboard);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <RouteTransitionScreen />;
  }

  return <>{children}</>;
}
