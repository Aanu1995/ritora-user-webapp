import { ApiPath } from "@/constants/api-paths";
import { postRequest } from "@/lib/api";
import type {
  CreateSupportFeedbackPayload,
  SupportFeedbackCreated,
} from "@/types/support";

export async function createSupportFeedback(
  payload: CreateSupportFeedbackPayload,
): Promise<SupportFeedbackCreated> {
  return postRequest<SupportFeedbackCreated>(ApiPath.SupportFeedback, payload);
}
