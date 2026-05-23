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
  safeFacets: CommunitySafeProfileFacets;
  safetyFlags: CommunitySafetyFlag[];
  helpfulCount: number;
  notHelpfulCount: number;
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
  outcomes: string[];
  repurchase: string;
  body: string | null;
  moderationStatus: CommunityModerationStatus;
  safeFacets: CommunitySafeProfileFacets;
  safetyFlags: CommunitySafetyFlag[];
  routineContext: CommunityReviewContextProduct[];
  helpfulCount: number;
  notHelpfulCount: number;
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

export type CommunityList<T> = {
  items: T[];
};

export type CreateCommunityRoutineInput = {
  title: string;
  summary?: string | null;
  disclosureType: CommunityDisclosureType;
  concernTags: string[];
  goalTags: string[];
  steps: Array<{
    slot: "am" | "pm" | "either";
    productId?: string | null;
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
  outcomes: string[];
  repurchase: string;
  routineContext: Array<{ productId?: string | null; category: string }>;
  body?: string | null;
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
  safetyFlags: CommunitySafetyFlag[];
  authorUserId: string;
  createdAt: string;
  updatedAt: string;
};
