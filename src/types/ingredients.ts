import type { Locale } from "@/i18n/config";
import type {
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
} from "@/types/shelf";

export enum AnalysisSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum AnalysisStatus {
  Ok = "ok",
  InsufficientData = "insufficient_data",
}

export enum AnalysisConfidence {
  High = "high",
  Medium = "medium",
  Low = "low",
}

export enum AnalysisMode {
  Focus = "focus",
  Multi = "multi",
}

export enum IngredientCategory {
  Retinoid = "retinoid",
  Aha = "aha",
  Bha = "bha",
  Pha = "pha",
  BenzoylPeroxide = "benzoyl-peroxide",
  VitaminC = "vitamin-c",
  Niacinamide = "niacinamide",
  Hydroquinone = "hydroquinone",
  AzelaicAcid = "azelaic-acid",
  TyrosinaseInhibitor = "tyrosinase-inhibitor",
  Bakuchiol = "bakuchiol",
  Sulphur = "sulphur",
  Peptide = "peptide",
  Barrier = "barrier",
  Humectant = "humectant",
  Antioxidant = "antioxidant",
  MineralSpf = "mineral-spf",
  ChemicalSpf = "chemical-spf",
}

export type AnalysisActive = {
  slug: string;
  displayName: string;
  category: IngredientCategory;
  summary: string;
  avoidCategories: IngredientCategory[];
  avoidIngredients: Array<{
    slug: string;
    displayName: string;
  }>;
  mitigationHint: string | null;
};

export type IngredientConflict = {
  code: string;
  severity: AnalysisSeverity;
  ingredientA: string;
  ingredientB: string;
  productAId: string;
  productBId: string;
  conditions?: Record<string, unknown>;
  mitigation?: string;
  explanation: string | null;
  description: string;
};

export type IngredientOverlap = {
  ingredient: string;
  productIds: string[];
  severity: AnalysisSeverity;
  explanation: string | null;
  description: string;
};

export type LayeringStep = {
  productId: string;
  brand: string;
  name: string;
  reason: string;
};

export type AnalysisResult = {
  mode: AnalysisMode;
  status: AnalysisStatus;
  confidence: AnalysisConfidence;
  safetyScore: number | null;
  actives: AnalysisActive[];
  conflicts: IngredientConflict[];
  overlaps: IngredientOverlap[];
  layeringOrder: LayeringStep[];
  productsMissingInci: string[];
  engineVersion: string;
  generatedAt: string;
};

export type AnalyzeProductsInput =
  | {
      focusProductId: string;
      language?: Locale;
      withExplanations?: boolean;
      forceRefresh?: boolean;
    }
  | {
      productIds: string[];
      language?: Locale;
      withExplanations?: boolean;
    };

export enum ProductCheckSource {
  IngredientPaste = "ingredient_paste",
  PhotoExtraction = "photo_extraction",
}

export enum ProductCheckVerdict {
  GoodFit = "good_fit",
  GoodWithLimits = "good_with_limits",
  UseCarefully = "use_carefully",
  AvoidForProfile = "avoid_for_profile",
  IngredientsOnly = "ingredients_only",
  NotEnoughData = "not_enough_data",
}

export enum ProductCheckTone {
  Positive = "positive",
  Caution = "caution",
  Danger = "danger",
  Neutral = "neutral",
}

export enum ProductCheckAiReviewStatus {
  Reviewed = "reviewed",
  Unavailable = "unavailable",
}

export enum ProductCheckReasonCode {
  InsufficientIngredients = "insufficient_ingredients",
  HighConflict = "high_conflict",
  MediumConflict = "medium_conflict",
  LowConflict = "low_conflict",
  DuplicateExposure = "duplicate_exposure",
  ProductReactionSignal = "product_reaction_signal",
  MissingPersonalContext = "missing_personal_context",
  MissingReactionContext = "missing_reaction_context",
  RecentJournalReaction = "recent_journal_reaction",
  SuggestionHistoryReaction = "suggestion_history_reaction",
  LowConfidence = "low_confidence",
  ReviewRequired = "review_required",
  SensitiveProfile = "sensitive_profile",
  ReactionTrigger = "reaction_trigger",
  PhotosensitizingActive = "photosensitizing_active",
}

export enum ProductCheckNextAction {
  AddToShelf = "add_to_shelf",
  UseAsPlanned = "use_as_planned",
  ReviewAndPatchTest = "review_and_patch_test",
  ReviewIngredients = "review_ingredients",
  ReviewSmartPicks = "review_smart_picks",
  CompleteProfile = "complete_profile",
  SkipProduct = "skip_product",
}

export enum ProductCheckPersonalizationLevel {
  Personalized = "personalized",
  Educational = "educational",
}

export enum ProductCheckContextSignal {
  SkinProfile = "skin_profile",
  ReactionHistory = "reaction_history",
  ActiveShelf = "active_shelf",
  SkinJournal = "skin_journal",
  SuggestionHistory = "suggestion_history",
}

export enum ProductCheckEvidenceKind {
  ProfileReactionTrigger = "profile_reaction_trigger",
  ShelfReactionSignal = "shelf_reaction_signal",
}

export enum ProductCheckPurchaseGuidanceReasonCode {
  HigherRisk = "higher_risk",
  DuplicateExposure = "duplicate_exposure",
  SmartPicksAvailable = "smart_picks_available",
  MissingPersonalContext = "missing_personal_context",
}

export enum ProductCheckAlternativeSource {
  SmartPicks = "smart_picks",
}

export type ProductCheckAlternativeBudgetTier =
  | "drugstore"
  | "mid"
  | "premium"
  | "luxury";

export type ProductCheckProductInput = {
  source: ProductCheckSource;
  brand?: string | null;
  name?: string | null;
  category: ProductCategory;
  inciIngredients: string[];
  lookupConfidence?: LookupConfidence;
  lookupWarnings?: LookupWarningCode[];
  reviewRequired?: boolean;
};

export type ProductCheckInput = {
  product: ProductCheckProductInput;
  language?: Locale;
};

export type ProductCheckReason = {
  code: ProductCheckReasonCode;
  severity: AnalysisSeverity | null;
  ingredientNames: string[];
  conflictCode: string | null;
};

export type ProductCheckVerdictResult = {
  label: ProductCheckVerdict;
  tone: ProductCheckTone;
  confidence: AnalysisConfidence;
  safetyScore: number | null;
  reasons: ProductCheckReason[];
  nextAction: ProductCheckNextAction;
  generatedAt: string;
};

export type ProductCheckAiReview = {
  status: ProductCheckAiReviewStatus;
  confidence: AnalysisConfidence;
  suggestedVerdict: ProductCheckVerdict | null;
  reasonCodes: ProductCheckReasonCode[];
  ingredientNames: string[];
  summary: string | null;
  reviewedAt: string;
};

export type ProductCheckContextSummary = {
  level: ProductCheckPersonalizationLevel;
  usedSignals: ProductCheckContextSignal[];
  missingSignals: ProductCheckContextSignal[];
  activeShelfProductCount: number;
  recentJournalReactionCount: number;
  recentSuggestionReactionCount: number;
};

export type ProductCheckReactionEvidence = {
  kind: ProductCheckEvidenceKind;
  confidence: AnalysisConfidence;
  productName: string | null;
  ingredientNames: string[];
  reactionSignalCount: number;
  usageDaysLast90: number | null;
};

export type ProductCheckAlternative = {
  id: string;
  source: ProductCheckAlternativeSource;
  brand: string;
  productName: string;
  ingredientOrCategory: string;
  budgetTier: ProductCheckAlternativeBudgetTier | null;
  sellerNames: string[];
  reason: string | null;
};

export type ProductCheckPurchaseGuidance = {
  shouldConsiderAlternatives: boolean;
  reasonCodes: ProductCheckPurchaseGuidanceReasonCode[];
  alternatives: ProductCheckAlternative[];
};

export type ProductCheckResponse = {
  context: ProductCheckContextSummary;
  analysis: AnalysisResult;
  verdict: ProductCheckVerdictResult;
  aiReview: ProductCheckAiReview;
  reactionEvidence: ProductCheckReactionEvidence[];
  purchaseGuidance: ProductCheckPurchaseGuidance;
};

export enum ProductCompareItemKind {
  CheckedProduct = "checked_product",
  ShelfProduct = "shelf_product",
}

export enum ProductCompareGoal {
  NewProductDecision = "new_product_decision",
  ShelfRoutineDecision = "shelf_routine_decision",
}

export enum ProductCompareOutcome {
  ChooseAnchor = "choose_anchor",
  ChooseCandidate = "choose_candidate",
  NoClearWinner = "no_clear_winner",
  NotEnoughData = "not_enough_data",
}

export enum ProductCompareReasonCode {
  BetterFit = "better_fit",
  LowerConflict = "lower_conflict",
  LessDuplicateExposure = "less_duplicate_exposure",
  ReactionRisk = "reaction_risk",
  MissingPersonalContext = "missing_personal_context",
  NotEnoughData = "not_enough_data",
  SimilarTradeoffs = "similar_tradeoffs",
  AlreadyOwned = "already_owned",
  ReplacementOnly = "replacement_only",
  DifferentRoutineRoles = "different_routine_roles",
  RoutineConflict = "routine_conflict",
  UseTogetherCarefully = "use_together_carefully",
  FillsRoutineGap = "fills_routine_gap",
}

export enum ProductCompareAiReviewStatus {
  Reviewed = "reviewed",
  Unavailable = "unavailable",
}

export type ProductCompareItemInput =
  | {
      kind: ProductCompareItemKind.CheckedProduct;
      product: ProductCheckProductInput;
    }
  | {
      kind: ProductCompareItemKind.ShelfProduct;
      productId: string;
    };

export type ProductCompareInput = {
  goal?: ProductCompareGoal;
  anchor: ProductCompareItemInput;
  candidates: ProductCompareItemInput[];
  language?: Locale;
};

export type ProductCompareReason = {
  code: ProductCompareReasonCode;
  itemIds: string[];
  ingredientNames: string[];
  severity: AnalysisSeverity | null;
};

export type ProductCompareItemResult = {
  itemId: string;
  kind: ProductCompareItemKind;
  productId: string | null;
  brand: string;
  name: string;
  category: ProductCategory;
  inciIngredientCount: number;
  matchedIngredientCount: number;
  confidence: AnalysisConfidence;
  safetyScore: number | null;
  verdict: ProductCheckVerdictResult;
  keyActives: string[];
  conflictCount: number;
  overlapCount: number;
  reactionEvidenceCount: number;
};

export type ProductCompareDecision = {
  outcome: ProductCompareOutcome;
  winnerItemId: string | null;
  confidence: AnalysisConfidence;
  summary: string;
  reasons: ProductCompareReason[];
  generatedAt: string;
};

export type ProductCompareAiReview = {
  status: ProductCompareAiReviewStatus;
  confidence: AnalysisConfidence;
  preferredItemId: string | null;
  reasonCodes: ProductCompareReasonCode[];
  summary: string | null;
  reviewedAt: string;
};

export type ProductCompareResponse = {
  goal: ProductCompareGoal;
  context: ProductCheckContextSummary;
  items: ProductCompareItemResult[];
  comparison: ProductCompareDecision;
  aiReview: ProductCompareAiReview;
};
