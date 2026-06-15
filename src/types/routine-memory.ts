export const RoutineMemoryEventType = {
  ProductAdded: "product_added",
  FirstLoggedUse: "first_logged_use",
  ProductUsed: "product_used",
  FrequencyChanged: "frequency_changed",
  ProductSkipped: "product_skipped",
  ReactionSignal: "reaction_signal",
  RecoveryStarted: "recovery_started",
  RecentChangeLogged: "recent_change_logged",
} as const;

export type RoutineMemoryEventType =
  (typeof RoutineMemoryEventType)[keyof typeof RoutineMemoryEventType];

export const RoutineMemoryEventSeverity = {
  Info: "info",
  Watch: "watch",
  Warning: "warning",
  Recovery: "recovery",
} as const;

export type RoutineMemoryEventSeverity =
  (typeof RoutineMemoryEventSeverity)[keyof typeof RoutineMemoryEventSeverity];

export const RoutineMemorySourceType = {
  InventoryProduct: "inventory_product",
  ApplicationLog: "application_log",
  SkinJournalEntry: "skin_journal_entry",
  RoutineSimplification: "routine_simplification",
} as const;

export type RoutineMemorySourceType =
  (typeof RoutineMemorySourceType)[keyof typeof RoutineMemorySourceType];

export const RoutineMemorySuspicionLevel = {
  Watch: "watch",
  Possible: "possible",
  HigherAttention: "higher_attention",
} as const;

export type RoutineMemorySuspicionLevel =
  (typeof RoutineMemorySuspicionLevel)[keyof typeof RoutineMemorySuspicionLevel];

export const RoutineMemoryReasonCode = {
  ReactionAfterFirstLoggedUse: "reaction_after_first_logged_use",
  ReactionAfterProductAdded: "reaction_after_product_added",
  ReactionAfterFrequencyChange: "reaction_after_frequency_change",
  SkippedAfterReaction: "skipped_after_reaction",
  ActiveCategoryNearReaction: "active_category_near_reaction",
} as const;

export type RoutineMemoryReasonCode =
  (typeof RoutineMemoryReasonCode)[keyof typeof RoutineMemoryReasonCode];

export const RoutineMemoryDurationDay = {
  Seven: 7,
  Fourteen: 14,
  Thirty: 30,
  Ninety: 90,
} as const;

export type RoutineMemoryDurationDays =
  (typeof RoutineMemoryDurationDay)[keyof typeof RoutineMemoryDurationDay];

export const ROUTINE_MEMORY_DURATION_OPTIONS: RoutineMemoryDurationDays[] = [
  RoutineMemoryDurationDay.Seven,
  RoutineMemoryDurationDay.Fourteen,
  RoutineMemoryDurationDay.Thirty,
  RoutineMemoryDurationDay.Ninety,
];

export interface RoutineMemoryWindow {
  start: string;
  end: string;
  days: number;
}

export interface RoutineMemoryProduct {
  productId: string | null;
  brand: string | null;
  name: string | null;
  category: string | null;
  imageUrl?: string | null;
}

export interface RoutineMemoryTimelineEvent {
  id: string;
  date: string;
  occurredAt: string | null;
  type: RoutineMemoryEventType;
  severity: RoutineMemoryEventSeverity;
  product: RoutineMemoryProduct | null;
  sourceType: RoutineMemorySourceType;
  sourceId: string;
}

export interface RoutineMemorySuspiciousProduct {
  productId: string;
  brand: string;
  name: string;
  category: string | null;
  imageUrl?: string | null;
  suspicionLevel: RoutineMemorySuspicionLevel;
  score: number;
  reasonCodes: RoutineMemoryReasonCode[];
  firstUseDate: string | null;
  lastUseDate: string | null;
  nearestReactionDate: string | null;
  daysFromFirstUseToReaction: number | null;
  reactionSignalCountNearUse: number;
}

export interface RoutineMemoryProductTimeline {
  product: RoutineMemoryProduct;
  suspicionLevel: RoutineMemorySuspicionLevel | null;
  reasonCodes: RoutineMemoryReasonCode[];
  firstUseDate: string | null;
  lastUseDate: string | null;
  nearestReactionDate: string | null;
  eventCount: number;
  timeline: RoutineMemoryTimelineEvent[];
}

export interface RoutineMemorySummary {
  timelineEventCount: number;
  productChangeCount: number;
  applicationLogCount: number;
  reactionSignalCount: number;
  recoveryEventCount: number;
  suspiciousProductCount: number;
  hasPossibleLinks: boolean;
}

export interface RoutineMemoryResponse {
  generatedAt: string;
  timeZone: string;
  window: RoutineMemoryWindow;
  disclaimer: string;
  summary: RoutineMemorySummary;
  timeline: RoutineMemoryTimelineEvent[];
  suspiciousProducts: RoutineMemorySuspiciousProduct[];
  productTimelines?: RoutineMemoryProductTimeline[];
}
