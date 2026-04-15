'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { AppPreferencesProvider } from '@/components/preferences/app-preferences-provider';
import type { ThemePreference } from '@/lib/theme-preferences';
import { appQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) {
      return;
    }

    hasHydrated.current = true;
    void hydrate();
  }, [hydrate]);

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
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </AppPreferencesProvider>
  );
}
