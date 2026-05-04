import { getRequest, patchRequest, postRequest } from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  ApplicationLog,
  ApplicationLogVersion,
  EditApplicationPayload,
  RecordApplicationPayload,
} from "@/types/application-tracking";

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

export async function getApplicationLog(id: string): Promise<ApplicationLog> {
  return getRequest<ApplicationLog>(ApiPath.ApplicationLog(id));
}

export async function getApplicationLogVersions(
  id: string,
): Promise<ApplicationLogVersion[]> {
  return getRequest<ApplicationLogVersion[]>(
    ApiPath.ApplicationLogVersions(id),
  );
}
