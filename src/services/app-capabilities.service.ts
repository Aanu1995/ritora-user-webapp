import { ApiPath } from "@/constants/api-paths";
import { type ApiRequestOptions, getRequest } from "@/lib/api";
import type { UserCapabilities } from "@/types/auth";

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getAppCapabilities(
  options?: ApiRequestOptions,
): Promise<UserCapabilities> {
  return getWithOptions<UserCapabilities>(ApiPath.AppCapabilities, options);
}
