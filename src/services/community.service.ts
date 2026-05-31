import { ApiPath } from "@/constants/api-paths";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import type {
  CommunityAdaptation,
  CommunityHome,
  CommunityHelpfulnessVote,
  CommunityList,
  CommunityListQuery,
  CommunityOutcomeSignal,
  CommunityOutcomeResultsQuery,
  CommunityOutcomeSignalInput,
  CommunityOutcomeSignalResponse,
  CommunityPeopleLikeMe,
  CommunityPostingEligibility,
  CommunityProductEvidence,
  CommunityReportReason,
  CommunityReview,
  CommunityReviewResultsResponse,
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

type CommunityCursorListQuery = Pick<CommunityListQuery, "cursor" | "limit">;

function isAbortSignal(value: unknown): value is AbortSignal {
  return (
    typeof value === "object" &&
    value !== null &&
    "aborted" in value &&
    "addEventListener" in value
  );
}

function normalizeCursorListArgs(
  queryOrSignal?: CommunityCursorListQuery | AbortSignal,
  signal?: AbortSignal,
) {
  if (isAbortSignal(queryOrSignal)) {
    return { query: {}, signal: queryOrSignal };
  }

  return { query: queryOrSignal ?? {}, signal };
}

export function getPeopleLikeMe(
  queryOrSignal?: CommunityCursorListQuery | AbortSignal,
  signal?: AbortSignal,
): Promise<CommunityPeopleLikeMe> {
  const args = normalizeCursorListArgs(queryOrSignal, signal);
  return getRequest<CommunityPeopleLikeMe>(
    ApiPath.CommunityPeopleLikeMe,
    buildCommunityListRequestConfig(args.query, args.signal),
  );
}

function buildCommunityListParams(query: CommunityListQuery) {
  const optionalParams = {
    avoidTag: query.avoidTag,
    concern: query.concern,
    contextProductCategory: query.contextProductCategory,
    disclosureType: query.disclosureType,
    goal: query.goal,
    habitTag: query.habitTag,
    outcome: query.outcome,
    productCategory: query.productCategory,
    productRole: query.productRole,
    result: query.result,
    resultSignal: query.resultSignal,
    routineContextUsage: query.routineContextUsage,
    routineSlot: query.routineSlot,
    search: query.search,
    sensitivity: query.sensitivity,
    skinResponse: query.skinResponse,
    skinType: query.skinType,
    sort: query.sort,
    timeframe: query.timeframe,
    usageDuration: query.usageDuration,
    warningTag: query.warningTag,
  };

  return {
    ...Object.fromEntries(
      Object.entries(optionalParams).filter(([, value]) => Boolean(value)),
    ),
    ...(query.cursor ? { cursor: query.cursor } : {}),
    ...(typeof query.limit === "number" ? { limit: query.limit } : {}),
    ...(typeof query.minRating === "number"
      ? { minRating: query.minRating }
      : {}),
  };
}

function buildCommunityListRequestConfig(
  query: CommunityListQuery,
  signal?: AbortSignal,
) {
  const params = buildCommunityListParams(query);
  if (Object.keys(params).length === 0) {
    return { signal };
  }
  return { params, signal };
}

export function listCommunityRoutines(
  query: CommunityListQuery = {},
  signal?: AbortSignal,
): Promise<CommunityList<CommunityRoutine>> {
  return getRequest<CommunityList<CommunityRoutine>>(
    ApiPath.CommunityRoutines,
    buildCommunityListRequestConfig(query, signal),
  );
}

export function getCommunityRoutine(
  id: string,
  signal?: AbortSignal,
): Promise<CommunityRoutine> {
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

export function createCommunityRoutine(
  input: CreateCommunityRoutineInput,
): Promise<CommunityRoutine> {
  return postRequest<CommunityRoutine>(ApiPath.CommunityRoutines, input);
}

export function updateCommunityRoutine(
  id: string,
  input: Partial<CreateCommunityRoutineInput>,
): Promise<CommunityRoutine> {
  return patchRequest<CommunityRoutine>(
    ApiPath.CommunityRoutineEdit(id),
    input,
  );
}

export function adaptCommunityRoutine(
  id: string,
): Promise<CommunityAdaptation> {
  return postRequest<CommunityAdaptation>(ApiPath.CommunityRoutineAdapt(id));
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
): Promise<CommunityOutcomeSignalResponse> {
  return postRequest<CommunityOutcomeSignalResponse>(
    ApiPath.CommunityRoutineOutcomeSignal(id),
    input,
  );
}

export function listCommunityReviews(
  query: CommunityListQuery = {},
  signal?: AbortSignal,
): Promise<CommunityList<CommunityReview>> {
  return getRequest<CommunityList<CommunityReview>>(
    ApiPath.CommunityReviews,
    buildCommunityListRequestConfig(query, signal),
  );
}

export function createCommunityReview(
  input: CreateCommunityReviewInput,
): Promise<{
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
): Promise<CommunityOutcomeSignalResponse> {
  return postRequest<CommunityOutcomeSignalResponse>(
    ApiPath.CommunityReviewOutcomeSignal(id),
    input,
  );
}

export function listCommunityReviewResults(
  id: string,
  queryOrSignal?: CommunityOutcomeResultsQuery | CommunityOutcomeSignal | "",
  abortSignal?: AbortSignal,
): Promise<CommunityReviewResultsResponse> {
  return listCommunityOutcomeResults(
    ApiPath.CommunityReviewResults(id),
    queryOrSignal,
    abortSignal,
  );
}

export function listCommunityRoutineResults(
  id: string,
  queryOrSignal?: CommunityOutcomeResultsQuery | CommunityOutcomeSignal | "",
  abortSignal?: AbortSignal,
): Promise<CommunityReviewResultsResponse> {
  return listCommunityOutcomeResults(
    ApiPath.CommunityRoutineResults(id),
    queryOrSignal,
    abortSignal,
  );
}

function listCommunityOutcomeResults(
  path: string,
  queryOrSignal?: CommunityOutcomeResultsQuery | CommunityOutcomeSignal | "",
  abortSignal?: AbortSignal,
): Promise<CommunityReviewResultsResponse> {
  const query =
    typeof queryOrSignal === "string"
      ? { signal: queryOrSignal }
      : (queryOrSignal ?? {});
  const params = {
    ...(query.cursor ? { cursor: query.cursor } : {}),
    ...(query.limit ? { limit: query.limit } : {}),
    ...(query.signal ? { signal: query.signal } : {}),
  };

  return getRequest<CommunityReviewResultsResponse>(path, {
    ...(Object.keys(params).length > 0 ? { params } : {}),
    signal: abortSignal,
  });
}

export function listCommunityWarnings(
  signal?: AbortSignal,
): Promise<CommunityWarning[]> {
  return getRequest<CommunityWarning[]>(ApiPath.CommunityWarnings, { signal });
}

export function listMyCommunitySubmissions(
  queryOrSignal?: CommunityCursorListQuery | AbortSignal,
  signal?: AbortSignal,
): Promise<CommunityList<CommunitySubmission>> {
  const args = normalizeCursorListArgs(queryOrSignal, signal);
  return getRequest<CommunityList<CommunitySubmission>>(
    ApiPath.CommunityMySubmissions,
    buildCommunityListRequestConfig(args.query, args.signal),
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
