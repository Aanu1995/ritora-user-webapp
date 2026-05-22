import {
  type ApiRequestOptions,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  ApplicationLog,
  ApplicationLogVersion,
  EditApplicationPayload,
  RecordApplicationPayload,
} from "@/types/application-tracking";

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function recordApplication(
  payload: RecordApplicationPayload,
): Promise<ApplicationLog> {
  return postRequest<ApplicationLog>(ApiPath.ApplicationLogs, payload);
}

export async function editApplication(
  id: string,
  payload: EditApplicationPayload,
): Promise<ApplicationLog> {
  return patchRequest<ApplicationLog>(ApiPath.ApplicationLog(id), payload);
}

export async function getApplicationLog(
  id: string,
  options?: ApiRequestOptions,
): Promise<ApplicationLog> {
  return getWithOptions<ApplicationLog>(ApiPath.ApplicationLog(id), options);
}

export async function getApplicationLogVersions(
  id: string,
  options?: ApiRequestOptions,
): Promise<ApplicationLogVersion[]> {
  return getWithOptions<ApplicationLogVersion[]>(
    ApiPath.ApplicationLogVersions(id),
    options,
  );
}
