import type {
  SuggestionEvidenceSourceId,
  SuggestionGapActionKind,
} from "@/types/suggestions";

export type SmartPicksMode = "refine" | "starter";
export const SMART_PICKS_MODES: readonly SmartPicksMode[] = [
  "refine",
  "starter",
] as const;

export type SmartPicksBudgetTier = "drugstore" | "mid" | "premium" | "luxury";

export const SMART_PICKS_BUDGET_TIERS: readonly SmartPicksBudgetTier[] = [
  "drugstore",
  "mid",
  "premium",
  "luxury",
] as const;

export const SMART_PICKS_AVAILABILITY_STATUS = {
  Local: "local",
  ImportOnly: "import_only",
  Unavailable: "unavailable",
  Unknown: "unknown",
} as const;

export type SmartPicksAvailabilityStatus =
  (typeof SMART_PICKS_AVAILABILITY_STATUS)[keyof typeof SMART_PICKS_AVAILABILITY_STATUS];

export const SMART_PICKS_GAP_KIND = {
  Missing: "missing",
  Environment: "environment",
  Starter: "starter",
  Replacement: "replacement",
} as const;

export type SmartPicksGapKind =
  (typeof SMART_PICKS_GAP_KIND)[keyof typeof SMART_PICKS_GAP_KIND];

export type SmartPicksProductPerformanceSummary = {
  productId: string;
  brand: string;
  productName: string;
  category: string | null;
  usageDaysLast30: number;
  usageDaysLast90: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  adherence: "none" | "light" | "consistent";
  goalTrend:
    | "working"
    | "not_improving"
    | "irritation_signal"
    | "insufficient_history";
  concernTrend: string | null;
  photoCheckpoints: number;
  reactionSignalCount: number;
  replacementCandidate: boolean;
  replacementReason: string | null;
};

export const SMART_PICKS_EMPTY_REASON = {
  ProfileRequired: "profile_required",
  ConsentRequired: "consent_required",
  FullyCovered: "fully_covered",
  AllGapsDismissed: "all_gaps_dismissed",
  RedundancyOnly: "redundancy_only",
  StarterNeedsShelf: "starter_needs_shelf",
  HistoryInsufficient: "history_insufficient",
  ProductGenerationUnavailable: "product_generation_unavailable",
} as const;

export type SmartPicksEmptyReason =
  (typeof SMART_PICKS_EMPTY_REASON)[keyof typeof SMART_PICKS_EMPTY_REASON];

export const SMART_PICKS_HISTORY_READINESS_REASON = {
  Ready: "ready",
  NeedsUsageLogs: "needs_usage_logs",
  NeedsClearPhotos: "needs_clear_photos",
  NeedsUsageAndPhotos: "needs_usage_and_photos",
} as const;

export type SmartPicksHistoryReadinessReason =
  (typeof SMART_PICKS_HISTORY_READINESS_REASON)[keyof typeof SMART_PICKS_HISTORY_READINESS_REASON];

export const SMART_PICKS_MISSING_PROFILE_FIELD = {
  DateOfBirth: "date_of_birth",
  SexAtBirth: "sex_at_birth",
  SkinType: "skin_type",
  SkinTone: "skin_tone",
  FitzpatrickPhototype: "fitzpatrick_phototype",
  Ethnicity: "ethnicity",
  CurrentConcerns: "current_concerns",
  PrimaryGoal: "primary_goal",
  ConcernSeverity: "concern_severity",
  PihTendency: "pih_tendency",
  MelasmaTendency: "melasma_tendency",
  KeloidTendency: "keloid_tendency",
  SunscreenHabit: "sunscreen_habit",
  SunscreenTolerance: "sunscreen_tolerance",
  RoutinePace: "routine_pace",
  FragranceFree: "fragrance_free",
  NonComedogenic: "non_comedogenic",
  SunscreenFilter: "sunscreen_filter",
  SunscreenFinish: "sunscreen_finish",
  WaterHardness: "water_hardness",
  WaterSensitivity: "water_sensitivity",
  BudgetTier: "budget_tier",
  SmartPicksConsent: "smart_picks_consent",
} as const;

export type SmartPicksMissingProfileField =
  (typeof SMART_PICKS_MISSING_PROFILE_FIELD)[keyof typeof SMART_PICKS_MISSING_PROFILE_FIELD];

export type SmartPicksHistoryReadiness = {
  usablePhotoCheckpoints: number;
  loggedUseDaysLast90: number;
  canAssessReplacements: boolean;
  reason: SmartPicksHistoryReadinessReason;
};

export type SmartPicksEmptyState = {
  reason: SmartPicksEmptyReason | null;
  dismissedGapCount: number;
  nextEligibleAt: string | null;
  missingProfileFields: SmartPicksMissingProfileField[];
  activeProductCount: number;
  canAssessReplacements: boolean;
  historyReadiness: SmartPicksHistoryReadiness;
};

export type SmartPicksCoverageState = "filled" | "missing" | "missing-priority";

export type SmartPicksCoverageRole =
  | "cleanse"
  | "hydrate"
  | "treat"
  | "moisturise"
  | "spf"
  | "eye"
  | "treatment-secondary";

export const SMART_PICKS_VERIFICATION_STATUS = {
  AiNamed: "ai_named",
  RetailerVerified: "retailer_verified",
  RetailerUnverified: "retailer_unverified",
  Unavailable: "unavailable",
} as const;

export type SmartPicksProductVerificationStatus =
  (typeof SMART_PICKS_VERIFICATION_STATUS)[keyof typeof SMART_PICKS_VERIFICATION_STATUS];

export type SmartPicksCoverageSlot = {
  role: SmartPicksCoverageRole;
  state: SmartPicksCoverageState;
  filledByProductId: string | null;
  filledByName: string | null;
  goalRelevance: "essential" | "supportive" | "optional";
};

export type SmartPicksRetailer = {
  name: string;
  url: string;
  priceCents: number | null;
  currency: string | null;
  inStock: boolean;
  isAffiliate: boolean;
};

export type SmartPicksReasoningChip = {
  tone:
    | "goal"
    | "budget"
    | "ethnicity"
    | "compatibility"
    | "location"
    | "safety";
  text: string;
  icon: string;
};

export type SmartPicksRuledOutProduct = {
  brand: string;
  productName: string;
  priceCents: number | null;
  currency: string | null;
  reason: string;
};

export type SmartPicksProductPick = {
  id: string;
  brand: string;
  productName: string;
  budgetTier: SmartPicksBudgetTier | null;
  priceCents: number | null;
  currency: string | null;
  retailers: SmartPicksRetailer[];
  reasoningChips: SmartPicksReasoningChip[];
  reasoningFacts: Record<string, string>;
  ruledOut: SmartPicksRuledOutProduct[];
  sourceIds: SuggestionEvidenceSourceId[];
  alternatives: SmartPicksProductPick[];
  verificationStatus: SmartPicksProductVerificationStatus;
  availabilityStatus: SmartPicksAvailabilityStatus;
  recommendationRankReason: string | null;
  localAlternativeReason: string | null;
  retailerDataCheckedAt: string | null;
  retailerDataStale: boolean;
  userAction: SuggestionGapActionKind | null;
  createdAt: string;
};

export const SMART_PICKS_STARTER_KIT_STEP_STATUS = {
  Covered: "covered",
  Recommended: "recommended",
  Wait: "wait",
} as const;

export type SmartPicksStarterKitStepStatus =
  (typeof SMART_PICKS_STARTER_KIT_STEP_STATUS)[keyof typeof SMART_PICKS_STARTER_KIT_STEP_STATUS];

export type SmartPicksStarterKitStep = {
  order: number;
  role: SmartPicksCoverageRole;
  title: string;
  ingredientOrCategory: string;
  normalizedKey: string;
  status: SmartPicksStarterKitStepStatus;
  ownedProductId: string | null;
  ownedProductName: string | null;
  reason: string;
  pick: SmartPicksProductPick | null;
  sourceIds: SuggestionEvidenceSourceId[];
};

export type SmartPicksStarterKit = {
  summary: string | null;
  steps: SmartPicksStarterKitStep[];
};

export type SmartPicksGap = {
  ingredientOrCategory: string;
  normalizedKey: string;
  priority: "priority" | "consider";
  reason: string;
  goalAlignment: string | null;
  sourceIds: SuggestionEvidenceSourceId[];
  gapKind: SmartPicksGapKind;
  replacementFor: SmartPicksProductPerformanceSummary | null;
  pick: SmartPicksProductPick | null;
};

export type SmartPicksOverview = {
  mode: SmartPicksMode;
  generatedAt: string;
  inputsHash: string;
  recap: {
    primaryGoal: string | null;
    skinType: string | null;
    location: { city: string | null; countryCode: string | null };
    budgetTier: SmartPicksBudgetTier | null;
    ethnicity: string | null;
  };
  coverage: {
    slots: SmartPicksCoverageSlot[];
    filled: number;
    total: number;
  };
  priorityGaps: SmartPicksGap[];
  considerGaps: SmartPicksGap[];
  covered: { role: string; productName: string; reason: string }[];
  redundancy: {
    activeTag: string;
    products: {
      id: string;
      brand: string;
      name: string;
      recommendation: "keep" | "finish-first" | "redundant";
    }[];
    hint: string;
  }[];
  consentRequired: boolean;
  skinProfileRequired: boolean;
  productSuggestionsUnavailable: boolean;
  emptyState: SmartPicksEmptyState;
  starterKit: SmartPicksStarterKit;
};

export type SmartPicksWishlistItem = {
  actionId: string;
  savedAt: string;
  ingredientOrCategory: string;
  normalizedKey: string;
  reason: string | null;
  goalAlignment: string | null;
  pick: SmartPicksProductPick;
};

export type SmartPicksWishlistResponse = {
  items: SmartPicksWishlistItem[];
};

export type UpdateSmartPicksBudgetPayload = {
  budgetTier: SmartPicksBudgetTier;
};
