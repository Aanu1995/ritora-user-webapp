'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, startTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { AppPreferencesProvider } from '@/components/preferences/app-preferences-provider';
import type { ThemePreference } from '@/lib/theme-preferences';
import { appQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hasHydrated = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated.current) {
      return;
    }

    hasHydrated.current = true;
    void hydrate().then((localeChanged) => {
      if (localeChanged) {
        startTransition(() => {
          router.refresh();
        });
      }
    });
  }, [hydrate, router]);

  return <>{children}</>;
}

type ProvidersProps = {
  children: ReactNode;
  initialThemePreference?: ThemePreference | null;
};

export function Providers({
  children,
  initialThemePreference,
}: ProvidersProps) {
  return (
    <AppPreferencesProvider initialThemePreference={initialThemePreference}>
      <QueryClientProvider client={appQueryClient}>
        <AuthHydration>{children}</AuthHydration>
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </AppPreferencesProvider>
  );
}
