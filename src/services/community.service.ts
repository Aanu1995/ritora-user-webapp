import { ApiPath } from "@/constants/api-paths";
import { deleteRequest, getRequest, patchRequest, postRequest } from "@/lib/api";
import type {
  CommunityAdaptation,
  CommunityHome,
  CommunityHelpfulnessVote,
  CommunityList,
  CommunityOutcomeSignalInput,
  CommunityPostingEligibility,
  CommunityProductEvidence,
  CommunityReportReason,
  CommunityReview,
  CommunityRoutine,
  CommunitySubmission,
  CommunityWarning,
  CreateCommunityReviewInput,
  CreateCommunityRoutineInput,
} from "@/types/community";

export function getCommunityHome(signal?: AbortSignal): Promise<CommunityHome> {
  return getRequest<CommunityHome>(ApiPath.CommunityHome, { signal });
}

export function getCommunityPostingEligibility(
  signal?: AbortSignal,
): Promise<CommunityPostingEligibility> {
  return getRequest<CommunityPostingEligibility>(ApiPath.CommunityEligibility, {
    signal,
  });
}

export function acceptCommunityGuidelines(): Promise<CommunityPostingEligibility> {
  return postRequest<CommunityPostingEligibility>(
    ApiPath.CommunityAcceptGuidelines,
  );
}

export function getPeopleLikeMe(signal?: AbortSignal): Promise<CommunityList<CommunityRoutine | CommunityReview>> {
  return getRequest<CommunityList<CommunityRoutine | CommunityReview>>(ApiPath.CommunityPeopleLikeMe, { signal });
}

export function listCommunityRoutines(signal?: AbortSignal): Promise<CommunityList<CommunityRoutine>> {
  return getRequest<CommunityList<CommunityRoutine>>(ApiPath.CommunityRoutines, { signal });
}

export function getCommunityRoutine(id: string, signal?: AbortSignal): Promise<CommunityRoutine> {
  return getRequest<CommunityRoutine>(ApiPath.CommunityRoutine(id), { signal });
}

export function getCommunityProductEvidence(
  id: string,
  signal?: AbortSignal,
): Promise<CommunityProductEvidence> {
  return getRequest<CommunityProductEvidence>(
    ApiPath.CommunityProductEvidence(id),
    { signal },
  );
}

export function createCommunityRoutine(input: CreateCommunityRoutineInput): Promise<CommunityRoutine> {
  return postRequest<CommunityRoutine>(ApiPath.CommunityRoutines, input);
}

export function updateCommunityRoutine(
  id: string,
  input: Partial<CreateCommunityRoutineInput>,
): Promise<CommunityRoutine> {
  return patchRequest<CommunityRoutine>(ApiPath.CommunityRoutineEdit(id), input);
}

export function adaptCommunityRoutine(id: string): Promise<CommunityAdaptation> {
  return postRequest<CommunityAdaptation>(ApiPath.CommunityRoutineAdapt(id));
}

export function saveCommunityAdaptation(routineId: string, adaptationId: string): Promise<{ saved: true }> {
  return postRequest<{ saved: true }>(ApiPath.CommunityRoutineSaveAdaptation(routineId), { adaptationId });
}

export function reportCommunityRoutine(
  id: string,
  reason: CommunityReportReason,
  note?: string,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityRoutineReport(id), { reason, note });
}

export function voteCommunityRoutine(
  id: string,
  vote: CommunityHelpfulnessVote,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityRoutineHelpfulness(id), { vote });
}

export function signalCommunityRoutineOutcome(
  id: string,
  input: CommunityOutcomeSignalInput,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityRoutineOutcomeSignal(id), input);
}

export function listCommunityReviews(signal?: AbortSignal): Promise<CommunityList<CommunityReview>> {
  return getRequest<CommunityList<CommunityReview>>(ApiPath.CommunityReviews, { signal });
}

export function createCommunityReview(input: CreateCommunityReviewInput): Promise<{
  moderationStatus: string;
  safetyFlags: unknown[];
}> {
  return postRequest(ApiPath.CommunityReviews, input);
}

export function updateCommunityReview(
  id: string,
  input: Partial<CreateCommunityReviewInput>,
): Promise<CommunityReview> {
  return patchRequest<CommunityReview>(ApiPath.CommunityReviewEdit(id), input);
}

export function reportCommunityReview(
  id: string,
  reason: CommunityReportReason,
  note?: string,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityReviewReport(id), { reason, note });
}

export function voteCommunityReview(
  id: string,
  vote: CommunityHelpfulnessVote,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityReviewHelpfulness(id), { vote });
}

export function signalCommunityReviewOutcome(
  id: string,
  input: CommunityOutcomeSignalInput,
): Promise<unknown> {
  return postRequest(ApiPath.CommunityReviewOutcomeSignal(id), input);
}

export function listCommunityWarnings(signal?: AbortSignal): Promise<CommunityWarning[]> {
  return getRequest<CommunityWarning[]>(ApiPath.CommunityWarnings, { signal });
}

export function listMyCommunitySubmissions(
  signal?: AbortSignal,
): Promise<CommunityList<CommunitySubmission>> {
  return getRequest<CommunityList<CommunitySubmission>>(
    ApiPath.CommunityMySubmissions,
    { signal },
  );
}

export function resubmitCommunityContent(
  id: string,
): Promise<CommunitySubmission> {
  return postRequest<CommunitySubmission>(ApiPath.CommunityResubmitContent(id));
}

export function withdrawCommunityContent(
  id: string,
): Promise<{ deleted: true }> {
  return deleteRequest<{ deleted: true }>(ApiPath.CommunityWithdrawContent(id));
}
