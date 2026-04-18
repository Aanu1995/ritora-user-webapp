'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteTransitionScreen } from '@/components/auth/route-transition-screen';
import { resolvePostLoginRoute } from '@/lib/post-login-route';

export default function PostLoginPage() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    void resolvePostLoginRoute().then((nextRoute) => {
      if (!isActive) {
        return;
      }

      router.replace(nextRoute);
    });

    return () => {
      isActive = false;
    };
  }, [router]);

  return <RouteTransitionScreen fullHeight={false} />;
}
