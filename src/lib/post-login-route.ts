import { AppRoute } from '@/constants/app-routes';
import { getApiErrorStatus } from '@/lib/api-error';
import { getSkinProfileSetupStatus } from '@/lib/skin-profile-setup';
import * as skinProfileService from '@/services/skin-profile.service';

export async function resolvePostLoginRoute(): Promise<AppRoute> {
  try {
    const profile = await skinProfileService.getSkinProfile();
    return getSkinProfileSetupStatus(profile).isCoreComplete
      ? AppRoute.Dashboard
      : AppRoute.Onboarding;
  } catch (error) {
    return getApiErrorStatus(error) === 404
      ? AppRoute.Onboarding
      : AppRoute.Dashboard;
  }
}
