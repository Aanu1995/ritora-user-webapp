import { ApiPath } from "@/constants/api-paths";
import { getRequest } from "@/lib/api";
import type { AppNavBadges } from "@/types/nav-badges";

export async function getAppNavBadges(): Promise<AppNavBadges> {
  return getRequest(ApiPath.AppNavBadges);
}
