export type CommunityModerationStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "needs_edit"
  | "hidden"
  | "rejected";

export type CommunityDisclosureType =
  | "ordinary"
  | "gifted"
  | "sponsored"
  | "affiliate"
  | "professional"
  | "brand_rep";

export type CommunitySafetySeverity = "info" | "low" | "medium" | "high";

export type CommunityHelpfulnessVote = "helpful" | "not_helpful";

export type CommunityOutcomeSignal =
  | "worked_for_me_too"
  | "worked_with_changes"
  | "mixed_result"
  | "did_not_work"
  | "caused_irritation"
  | "not_relevant";

export type CommunityOutcomeSignalCounts = Record<CommunityOutcomeSignal, number>;

export type CommunityOutcomeTrialDuration =
  | "under-2-weeks"
  | "2-weeks"
  | "4-weeks"
  | "8-weeks"
  | "3-months-plus";

export type CommunityOutcomeFollowedPart =
  | "products"
  | "routine-timing"
  | "avoid-list"
  | "habits"
  | "partial";

export type CommunityOutcomeIrritationLevel =
  | "none"
  | "mild"
  | "moderate"
  | "severe";

export type CommunityOutcomeSignalInput = {
  signal: CommunityOutcomeSignal;
  sameGoal: boolean;
  trialDuration: CommunityOutcomeTrialDuration;
  followedParts: CommunityOutcomeFollowedPart[];
  irritationLevel: CommunityOutcomeIrritationLevel;
};

export type CommunityGoalResult =
  | "achieved"
  | "mostly_improved"
  | "partially_improved"
  | "maintained"
  | "mixed";

export type CommunityGoalTimeframe =
  | "2-weeks"
  | "4-weeks"
  | "8-weeks"
  | "3-months"
  | "3-months-plus"
  | "6-months"
  | "12-months-plus";

export type CommunityReviewRoutineSlot = "am" | "pm" | "am-pm" | "either";

export type CommunityReviewSkinResponse =
  | "improved"
  | "no_change"
  | "mixed"
  | "worsened";

export type CommunitySafeProfileFacets = {
  skinType: string | null;
  concernTags: string[];
  sensitivityLevel: string | null;
  skinToneRange: string | null;
  climateBucket: string | null;
  routinePace: string | null;
  goalTags: string[];
};

export type CommunitySafetyFlag = {
  code: string;
  severity: CommunitySafetySeverity;
  message: string;
};

export type CommunityPostingEligibilityReason = {
  code:
    | "email_unverified"
    | "skin_profile_required"
    | "shelf_product_required"
    | "community_guidelines_required"
    | "account_too_new"
    | "recent_moderation_abuse";
  message: string;
};

export type CommunityPostingEligibility = {
  eligible: boolean;
  minimumAccountAgeDays: number;
  accountAgeDays: number;
  eligibleAt: string;
  hasAcceptedGuidelines: boolean;
  hasCompletedSkinProfile: boolean;
  hasShelfProduct: boolean;
  emailVerified: boolean;
  reasons: CommunityPostingEligibilityReason[];
};

export type CommunityRoutineStep = {
  stepOrder: number;
  slot: "am" | "pm" | "either";
  productBrand: string | null;
  productName: string | null;
  category: string;
  frequency: string | null;
  notes: string | null;
};

export type CommunityRoutine = {
  id: string;
  type: "routine";
  title: string;
  summary: string | null;
  disclosureType: CommunityDisclosureType;
  moderationStatus: CommunityModerationStatus;
  concernTags: string[];
  goalTags: string[];
  goalResult: CommunityGoalResult | null;
  timeframe: CommunityGoalTimeframe | null;
  avoidTags: string[];
  habitTags: string[];
  didNotWorkTags: string[];
  warningTags: string[];
  safeFacets: CommunitySafeProfileFacets;
  safetyFlags: CommunitySafetyFlag[];
  helpfulCount: number;
  notHelpfulCount: number;
  outcomeSignalCounts: CommunityOutcomeSignalCounts;
  matchScore: number;
  relevanceReasons: string[];
  steps: CommunityRoutineStep[];
  createdAt: string;
  updatedAt: string;
};

export type CommunityReviewContextProduct = {
  productBrand: string | null;
  productName: string | null;
  category: string;
};

export type CommunityReview = {
  id: string;
  type: "review";
  productBrand: string;
  productName: string;
  productCategory: string;
  disclosureType: CommunityDisclosureType;
  usageDuration: string;
  frequency: string;
  routineSlot: CommunityReviewRoutineSlot | null;
  skinResponse: CommunityReviewSkinResponse | null;
  overallRating: number | null;
  effectivenessRating: number | null;
  irritationRating: number | null;
  textureRating: number | null;
  valueRating: number | null;
  outcomes: string[];
  repurchase: string;
  body: string | null;
  moderationStatus: CommunityModerationStatus;
  safeFacets: CommunitySafeProfileFacets;
  safetyFlags: CommunitySafetyFlag[];
  routineContext: CommunityReviewContextProduct[];
  helpfulCount: number;
  notHelpfulCount: number;
  outcomeSignalCounts: CommunityOutcomeSignalCounts;
  matchScore: number;
  relevanceReasons: string[];
  createdAt: string;
  updatedAt: string;
};

export type CommunityWarning = {
  id: string;
  title: string;
  body: string;
  severity: CommunitySafetySeverity;
  affected_facets: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CommunityHome = {
  profileFacets: CommunitySafeProfileFacets;
  postingEligibility: CommunityPostingEligibility;
  routines: CommunityRoutine[];
  reviews: CommunityReview[];
  warnings: CommunityWarning[];
  patterns: Array<{ id: string; title: string; body: string }>;
};

export type CommunityEvidenceCount = {
  value: string;
  count: number;
};

export type CommunityProductEvidence = {
  productId: string;
  productBrand: string;
  productName: string;
  reviewCount: number;
  playbookCount: number;
  similarAuthorEvidenceCount: number;
  similarOutcomeConfirmationCount: number;
  averageOverallRating: number | null;
  averageEffectivenessRating: number | null;
  averageIrritationRating: number | null;
  outcomeSignalCounts: CommunityOutcomeSignalCounts;
  similarOutcomeSignalCounts: CommunityOutcomeSignalCounts;
  topGoals: CommunityEvidenceCount[];
  topAvoids: CommunityEvidenceCount[];
  topOutcomes: CommunityEvidenceCount[];
};

export type CommunityList<T> = {
  items: T[];
};

export type CreateCommunityRoutineInput = {
  title: string;
  summary?: string | null;
  disclosureType: CommunityDisclosureType;
  concernTags: string[];
  goalTags: string[];
  goalResult?: CommunityGoalResult | null;
  timeframe: CommunityGoalTimeframe;
  avoidTags: string[];
  habitTags: string[];
  didNotWorkTags: string[];
  warningTags: string[];
  steps: Array<{
    slot: "am" | "pm" | "either";
    productId?: string | null;
    productBrand?: string | null;
    productName?: string | null;
    category: string;
    frequency?: string | null;
    notes?: string | null;
  }>;
};

export type CreateCommunityReviewInput = {
  productId?: string | null;
  productBrand: string;
  productName: string;
  productCategory: string;
  disclosureType: CommunityDisclosureType;
  usageDuration: string;
  frequency: string;
  routineSlot: CommunityReviewRoutineSlot;
  skinResponse: CommunityReviewSkinResponse;
  overallRating: number;
  effectivenessRating: number;
  irritationRating: number;
  textureRating?: number | null;
  valueRating?: number | null;
  outcomes: string[];
  repurchase: string;
  routineContext: Array<{
    productId?: string | null;
    productBrand?: string | null;
    productName?: string | null;
    category: string;
  }>;
  body?: string | null;
};

export type CommunityEditableRoutine = {
  title: string;
  summary: string | null;
  disclosureType: CommunityDisclosureType;
  concernTags: string[];
  goalTags: string[];
  goalResult: CommunityGoalResult | null;
  timeframe: CommunityGoalTimeframe | null;
  avoidTags: string[];
  habitTags: string[];
  didNotWorkTags: string[];
  warningTags: string[];
  steps: Array<{
    slot: "am" | "pm" | "either";
    productId: string | null;
    productBrand: string | null;
    productName: string | null;
    category: string;
    frequency: string | null;
    notes: string | null;
  }>;
};

export type CommunityEditableReview = {
  productId: string | null;
  productBrand: string;
  productName: string;
  productCategory: string;
  disclosureType: CommunityDisclosureType;
  usageDuration: string;
  frequency: string;
  routineSlot: CommunityReviewRoutineSlot | null;
  skinResponse: CommunityReviewSkinResponse | null;
  overallRating: number | null;
  effectivenessRating: number | null;
  irritationRating: number | null;
  textureRating: number | null;
  valueRating: number | null;
  outcomes: string[];
  repurchase: string;
  routineContext: Array<{
    productId: string | null;
    productBrand: string | null;
    productName: string | null;
    category: string;
  }>;
  body: string | null;
};

export type CommunityReportReason =
  | "unsafe_advice"
  | "medical_claims"
  | "harassment"
  | "spam"
  | "undisclosed_sponsorship"
  | "misleading_before_after"
  | "privacy_violation"
  | "other";

export type CommunityAdaptation = {
  id: string;
  routineId: string;
  changes: Array<{
    changeType: "kept" | "swapped" | "removed" | "gap";
    stepOrder: number;
    sourceProductName: string | null;
    sourceProductBrand: string | null;
    targetProductId: string | null;
    targetProductName: string | null;
    targetProductBrand: string | null;
    category: string;
    reason: string;
  }>;
  summary: {
    kept: number;
    swapped: number;
    removed: number;
    gaps: number;
  };
};

export type CommunitySubmission = {
  id: string;
  type: "routine" | "review";
  title: string;
  editableText: string | null;
  status: CommunityModerationStatus;
  disclosureType: CommunityDisclosureType;
  editableReview?: CommunityEditableReview | null;
  editableRoutine?: CommunityEditableRoutine | null;
  safetyFlags: CommunitySafetyFlag[];
  authorUserId: string;
  createdAt: string;
  updatedAt: string;
};
