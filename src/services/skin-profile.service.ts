import {
  type ApiRequestOptions,
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  SkinProfile,
  SkinProfileAccessLog,
  SkinProfileInput,
  SkinProfileOptions,
} from "@/types/skin-profile";

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getSkinProfile(
  options?: ApiRequestOptions,
): Promise<SkinProfile> {
  return getWithOptions<SkinProfile>(ApiPath.SkinProfile, options);
}

export async function getSkinProfileOptions(
  options?: ApiRequestOptions,
): Promise<SkinProfileOptions> {
  return getWithOptions<SkinProfileOptions>(
    ApiPath.SkinProfileOptions,
    options,
  );
}

export async function getSkinProfileAccessLogs(
  options?: ApiRequestOptions,
): Promise<SkinProfileAccessLog[]> {
  return getWithOptions<SkinProfileAccessLog[]>(
    ApiPath.SkinProfileAccessLogs,
    options,
  );
}

export async function createSkinProfile(
  data: SkinProfileInput,
): Promise<SkinProfile> {
  return postRequest<SkinProfile>(ApiPath.SkinProfile, data);
}

export async function updateSkinProfile(
  data: SkinProfileInput,
): Promise<SkinProfile> {
  return patchRequest<SkinProfile>(ApiPath.SkinProfile, data);
}

export async function deleteSkinProfile(): Promise<void> {
  return deleteRequest(ApiPath.SkinProfile);
}

export async function deleteSkinProfileHealthContext(): Promise<SkinProfile> {
  return deleteRequest<SkinProfile>(ApiPath.SkinProfileHealthContext);
}

export async function deleteSkinProfileHormonalContext(): Promise<SkinProfile> {
  return deleteRequest<SkinProfile>(ApiPath.SkinProfileHormonalContext);
}
