export type RecentProcedure = {
  type: string;
  performed_at?: string | null;
};

export type SafetyContext = {
  conditions?: string[];
  medications?: string[];
  photosensitizing_other?: boolean;
  recent_procedures?: RecentProcedure[];
};

export type ReactionEntry = {
  trigger: string;
  trigger_type?: string;
  reaction_types?: string[];
  severity?: string;
  certainty?: string;
  patch_test_confirmed?: boolean;
};

export type ReactionHistory = {
  has_known_reactions?: boolean | null;
  entries?: ReactionEntry[];
};

export type ConcernDetail = {
  concern: string;
  severity?: string;
  duration_months?: number;
  priority?: number;
  locations?: string[];
  subtype?: string;
  triggers?: string[];
};

export type ConcernDetails = {
  per_concern?: ConcernDetail[];
};

export type SkinBehavior = {
  burn_tendency?: string;
  tan_tendency?: string;
  pih_tendency?: string;
  melasma_tendency?: string;
  keloid_tendency?: string;
  daily_sun_exposure_hours?: string;
  sunscreen_habit?: string;
  sunscreen_tolerance?: string;
};

export type ActiveTolerance = {
  tolerance: string;
  last_used?: string | null;
};

export type ActiveTolerances = Record<string, ActiveTolerance>;

export type RoutinePreferences = {
  pace?: string;
  am_minutes?: number;
  pm_minutes?: number;
  max_active_nights_per_week?: number;
  fragrance_free?: boolean;
  non_comedogenic?: boolean;
  sunscreen_filter?: string;
  sunscreen_finish?: string;
};

export type LifestyleContext = {
  sleep?: string;
  stress?: string;
  water_intake?: string;
  water_hardness?: string;
  water_sensitivity?: string;
  water_reaction_notes?: string | null;
  diet_flags?: string[];
  smoking?: string;
  alcohol?: string;
  sweat_exercise?: string;
  mask_wearing?: boolean;
  shaving?: boolean;
  climate_sensitivities?: string[];
};

export type ShoppingPreferences = {
  ingredient_dislikes?: string[];
  product_dislikes?: string[];
  brand_dislikes?: string[];
  ingredient_ethics?: string[];
  texture_preferences?: string[];
};

export type SkinProfile = {
  id: string;
  dateOfBirth: string | null;
  sexAtBirth: string | null;
  skinType: string | null;
  skinTone: string | null;
  ethnicity: string | null;
  currentConcerns: string[];
  countryCode: string | null;
  city: string | null;
  fitzpatrickPhototype: string | null;
  sensitivityLevel: string | null;
  hydrationLevel: string | null;
  primaryGoal: string | null;
  pregnancyStatus: string | null;
  underDermatologistCare: string | null;
  allowSmartPicks: boolean;
  budgetTier: string | null;
  safetyContext: SafetyContext;
  reactionHistory: ReactionHistory;
  concernDetails: ConcernDetails;
  skinBehavior: SkinBehavior;
  activeTolerances: ActiveTolerances;
  routinePreferences: RoutinePreferences;
  lifestyleContext: LifestyleContext;
  shoppingPreferences: ShoppingPreferences;
  hormonalContext: HormonalContext;
  completeness: number;
  hasHealthContextConsent: boolean;
  hasLocationContextConsent: boolean;
  hasHormonalContextConsent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SkinProfileOptions = {
  skinTypes: string[];
  skinTones: string[];
  ethnicities: string[];
  concerns: string[];
  fitzpatrickPhototypes: string[];
  sensitivityLevels: string[];
  hydrationLevels: string[];
  pregnancyStatuses: string[];
  sexAtBirth: string[];
  conditions: string[];
  medications: string[];
  procedureTypes: string[];
  sunscreenHabits: string[];
  sunscreenTolerances: string[];
  sunscreenFilters: string[];
  sunscreenFinishes: string[];
  tendencyLevels: string[];
  activeIngredients: string[];
  activeToleranceLevels: string[];
  routinePaces: string[];
  budgetTiers: string[];
  texturePreferences: string[];
  ingredientEthics: string[];
  reactionTriggerTypes: string[];
  reactionTypes: string[];
  reactionSeverities: string[];
  reactionCertainties: string[];
  sleepLevels: string[];
  stressLevels: string[];
  waterIntakeLevels: string[];
  waterHardnessLevels: string[];
  waterSensitivityLevels: string[];
  dietFlags: string[];
  smokingLevels: string[];
  alcoholLevels: string[];
  climateSensitivities: string[];
  cyclePatterns: string[];
  hormonalBreakoutPatterns: string[];
};

export enum SkinProfileWaterHardness {
  Unknown = "unknown",
  Soft = "soft",
  Moderate = "moderate",
  Hard = "hard",
}

export enum SkinProfileWaterSensitivity {
  None = "none",
  Suspected = "suspected",
  Confirmed = "confirmed",
}

export enum SkinProfileConsentType {
  LocationProcessing = "location_processing",
  HealthContextProcessing = "health_context_processing",
  HormonalContextProcessing = "hormonal_context_processing",
  AiSuggestionProcessing = "ai_suggestion_processing",
}

export enum SkinProfileAccessEventType {
  DataAccessed = "data_accessed",
  ConsentGranted = "consent_granted",
  ConsentRevoked = "consent_revoked",
}

export enum SkinProfileAccessActorType {
  User = "user",
  System = "system",
}

export enum SkinProfileAccessPurpose {
  SkinProfileRead = "skin_profile_read",
  RecommendationAnalysis = "recommendation_analysis",
  AccountExport = "account_export",
  ConsentGrant = "consent_grant",
  ConsentRevoke = "consent_revoke",
}

export type SkinProfileAccessLog = {
  id: string;
  consentType: SkinProfileConsentType;
  eventType: SkinProfileAccessEventType;
  actorType: SkinProfileAccessActorType;
  purpose: SkinProfileAccessPurpose;
  createdAt: string;
};

export type SkinProfileInput = {
  dateOfBirth?: string | null;
  sexAtBirth?: string | null;
  skinType?: string | null;
  skinTone?: string | null;
  ethnicity?: string | null;
  currentConcerns?: string[];
  countryCode?: string | null;
  city?: string | null;
  locationConsent?: boolean;
  fitzpatrickPhototype?: string | null;
  sensitivityLevel?: string | null;
  hydrationLevel?: string | null;
  primaryGoal?: string | null;
  pregnancyStatus?: string | null;
  underDermatologistCare?: string | null;
  allowSmartPicks?: boolean;
  budgetTier?: string | null;
  safetyContext?: SafetyContext;
  reactionHistory?: ReactionHistory;
  concernDetails?: ConcernDetails;
  skinBehavior?: SkinBehavior;
  activeTolerances?: ActiveTolerances;
  routinePreferences?: RoutinePreferences;
  lifestyleContext?: LifestyleContext;
  shoppingPreferences?: ShoppingPreferences;
  hormonalContext?: HormonalContext;
  healthContextConsent?: boolean;
  hormonalContextConsent?: boolean;
};

export type HormonalContext = {
  cycle_pattern?: string;
  breakout_pattern?: string;
  cycle_related_breakouts?: boolean;
  uses_hormonal_contraception?: boolean;
  menopause_related_changes?: boolean;
};
