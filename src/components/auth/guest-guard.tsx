'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RouteTransitionScreen } from '@/components/auth/route-transition-screen';
import { AppRoute } from '@/constants/app-routes';
import { useAuthStore } from '@/stores/auth-store';

type GuestGuardProps = {
  children: React.ReactNode;
  allowAuthenticatedPaths?: readonly string[];
};

export function GuestGuard({
  children,
  allowAuthenticatedPaths = [],
}: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const allowsAuthenticatedAccess = allowAuthenticatedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowsAuthenticatedAccess) {
      router.replace(AppRoute.Dashboard);
    }
  }, [allowsAuthenticatedAccess, isAuthenticated, isLoading, router]);

  if (isLoading || (isAuthenticated && !allowsAuthenticatedAccess)) {
    return <RouteTransitionScreen />;
  }

  return <>{children}</>;
}
