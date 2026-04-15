import { QueryClient } from '@tanstack/react-query';
import { getApiErrorStatus } from './api-error';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => {
          const status = getApiErrorStatus(error);
          if (status !== undefined && status < 500) {
            return false;
          }

          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const appQueryClient = createAppQueryClient();
