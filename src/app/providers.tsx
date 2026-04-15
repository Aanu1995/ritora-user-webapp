'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';
import { appQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={appQueryClient}>
      <AuthHydration>{children}</AuthHydration>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
