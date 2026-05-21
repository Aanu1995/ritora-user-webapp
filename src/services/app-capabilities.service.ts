import { ApiPath } from "@/constants/api-paths";
import { getRequest } from "@/lib/api";
import type { UserCapabilities } from "@/types/auth";

export async function getAppCapabilities(): Promise<UserCapabilities> {
  return getRequest<UserCapabilities>(ApiPath.AppCapabilities);
}
