import {
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

export async function getSkinProfile(): Promise<SkinProfile> {
  return getRequest<SkinProfile>(ApiPath.SkinProfile);
}

export async function getSkinProfileOptions(): Promise<SkinProfileOptions> {
  return getRequest<SkinProfileOptions>(ApiPath.SkinProfileOptions);
}

export async function getSkinProfileAccessLogs(): Promise<
  SkinProfileAccessLog[]
> {
  return getRequest<SkinProfileAccessLog[]>(ApiPath.SkinProfileAccessLogs);
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
