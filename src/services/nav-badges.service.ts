import { ApiPath } from "@/constants/api-paths";
import { type ApiRequestOptions, getRequest } from "@/lib/api";
import type { AppNavBadges } from "@/types/nav-badges";

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getAppNavBadges(
  options?: ApiRequestOptions,
): Promise<AppNavBadges> {
  return getWithOptions<AppNavBadges>(ApiPath.AppNavBadges, options);
}
