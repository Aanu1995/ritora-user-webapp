import { AppRoute } from '@/constants/app-routes';
import { getApiErrorStatus } from '@/lib/api-error';
import { QueryKey } from '@/constants/query-keys';
import { appQueryClient } from '@/lib/query-client';
import { getSkinProfileSetupStatus } from '@/lib/skin-profile-setup';
import { useAuthStore } from '@/stores/auth-store';
import * as skinProfileService from '@/services/skin-profile.service';

type PostLoginResolution = {
  route: AppRoute;
};

let postLoginStateGeneration = 0;
const pendingPostLoginResolutions = new Map<
  string,
  Promise<PostLoginResolution>
>();

function getPostLoginSessionKey(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function getMissingSkinProfileQueryKey(sessionKey: string | null) {
  if (!sessionKey) {
    return null;
  }

  return [QueryKey.PostLoginMissingSkinProfile, sessionKey] as const;
}

function markMissingSkinProfile(sessionKey: string | null) {
  const queryKey = getMissingSkinProfileQueryKey(sessionKey);

  if (!queryKey) {
    return;
  }

  appQueryClient.setQueryData(queryKey, true);
}

function clearMissingSkinProfile(sessionKey: string | null) {
  const queryKey = getMissingSkinProfileQueryKey(sessionKey);

  if (!queryKey) {
    return;
  }

  appQueryClient.removeQueries({ queryKey, exact: true });
}

async function fetchPostLoginResolution(
  sessionKey: string | null,
): Promise<PostLoginResolution> {
  const generation = postLoginStateGeneration;

  try {
    const profile = await skinProfileService.getSkinProfile();

    if (generation === postLoginStateGeneration) {
      appQueryClient.setQueryData([QueryKey.SkinProfile], profile);
      clearMissingSkinProfile(sessionKey);
    }

    return {
      route: getSkinProfileSetupStatus(profile).isCoreComplete
        ? AppRoute.Dashboard
        : AppRoute.SkinProfile,
    };
  } catch (error) {
    if (getApiErrorStatus(error) === 404) {
      if (generation === postLoginStateGeneration) {
        markMissingSkinProfile(sessionKey);
      }

      return { route: AppRoute.SkinProfile };
    }

    if (generation === postLoginStateGeneration) {
      clearMissingSkinProfile(sessionKey);
    }

    return { route: AppRoute.Dashboard };
  }
}

async function resolvePostLogin(): Promise<PostLoginResolution> {
  const sessionKey = getPostLoginSessionKey();

  if (!sessionKey) {
    return fetchPostLoginResolution(null);
  }

  const pendingResolution = pendingPostLoginResolutions.get(sessionKey);

  if (pendingResolution) {
    return pendingResolution;
  }

  const resolution = fetchPostLoginResolution(sessionKey).finally(() => {
    pendingPostLoginResolutions.delete(sessionKey);
  });

  pendingPostLoginResolutions.set(sessionKey, resolution);
  return resolution;
}

export async function resolvePostLoginRoute(): Promise<AppRoute> {
  const resolution = await resolvePostLogin();
  return resolution.route;
}

export function resetPostLoginState(): void {
  postLoginStateGeneration += 1;
  pendingPostLoginResolutions.clear();
  appQueryClient.removeQueries({
    queryKey: [QueryKey.PostLoginMissingSkinProfile],
  });
}

export function hasMissingSkinProfileHandoff(): boolean {
  const sessionKey = getPostLoginSessionKey();
  const queryKey = getMissingSkinProfileQueryKey(sessionKey);

  return queryKey ? appQueryClient.getQueryData(queryKey) === true : false;
}

export function consumeMissingSkinProfileHandoff(): boolean {
  const sessionKey = getPostLoginSessionKey();
  const queryKey = getMissingSkinProfileQueryKey(sessionKey);

  if (!queryKey || appQueryClient.getQueryData(queryKey) !== true) {
    return false;
  }

  appQueryClient.removeQueries({ queryKey, exact: true });
  return true;
}
