const AUTH_BASE = "/auth";
const USERS_BASE = "/users";
const USERS_ME_BASE = `${USERS_BASE}/me`;
const SKIN_PROFILE_BASE = "/skin-profile";
const CATALOGUE_PRODUCTS_BASE = "/catalogue/products";
const INVENTORY_PRODUCTS_BASE = "/inventory/products";
const SCHEDULE_BASE = "/schedule";
const SCHEDULE_SLOTS_BASE = `${SCHEDULE_BASE}/slots`;
const INGREDIENTS_BASE = "/ingredients";
const SKIN_JOURNAL_BASE = "/skin-journal";
const NOTIFICATIONS_BASE = "/notifications";
const APP_BASE = "/app";
const SUGGESTIONS_BASE = "/suggestions";
const APPLICATION_LOGS_BASE = "/application-logs";
const SUGGESTIONS_HISTORY_BASE = "/suggestions/history";

const buildInventoryProductPath = (id: string) =>
  `${INVENTORY_PRODUCTS_BASE}/${id}`;

const buildScheduleSlotPath = (id: string) => `${SCHEDULE_SLOTS_BASE}/${id}`;

export const ApiPath = {
  AuthLogin: `${AUTH_BASE}/login`,
  AuthGoogle: `${AUTH_BASE}/google`,
  AuthApple: `${AUTH_BASE}/apple`,
  AuthRegister: `${AUTH_BASE}/register`,
  AuthRefresh: `${AUTH_BASE}/refresh`,
  AuthLogout: `${AUTH_BASE}/logout`,
  AuthLogoutAll: `${AUTH_BASE}/logout-all`,
  AuthMe: `${AUTH_BASE}/me`,
  AuthSessions: `${AUTH_BASE}/sessions`,
  AuthVerifyEmail: `${AUTH_BASE}/verify-email`,
  AuthResendVerification: `${AUTH_BASE}/resend-verification`,
  AuthForgotPassword: `${AUTH_BASE}/forgot-password`,
  AuthResetPassword: `${AUTH_BASE}/reset-password`,
  AuthExport: `${AUTH_BASE}/export`,
  AuthAccount: `${AUTH_BASE}/account`,

  UsersMe: USERS_ME_BASE,
  UsersMeLanguage: `${USERS_ME_BASE}/language`,
  UsersMeTimeZone: `${USERS_ME_BASE}/time-zone`,

  SkinProfile: SKIN_PROFILE_BASE,
  SkinProfileOptions: `${SKIN_PROFILE_BASE}/options`,
  SkinProfileAccessLogs: `${SKIN_PROFILE_BASE}/access-logs`,
  SkinProfileHealthContext: `${SKIN_PROFILE_BASE}/health-context`,
  SkinProfileHormonalContext: `${SKIN_PROFILE_BASE}/hormonal-context`,

  CatalogueProductsExtractFromImages: `${CATALOGUE_PRODUCTS_BASE}/extract-from-images`,

  InventoryProducts: INVENTORY_PRODUCTS_BASE,
  InventoryProductsUploadImage: `${INVENTORY_PRODUCTS_BASE}/upload-image`,
  InventoryProductsStats: `${INVENTORY_PRODUCTS_BASE}/stats`,
  InventoryProductsBulkArchive: `${INVENTORY_PRODUCTS_BASE}/bulk/archive`,
  InventoryProductsBulkRestore: `${INVENTORY_PRODUCTS_BASE}/bulk/restore`,
  InventoryProductsBulkMarkFinished: `${INVENTORY_PRODUCTS_BASE}/bulk/mark-finished`,
  InventoryProductsBulkDelete: `${INVENTORY_PRODUCTS_BASE}/bulk-delete`,
  InventoryProduct: buildInventoryProductPath,
  InventoryProductArchive: (id: string) =>
    `${buildInventoryProductPath(id)}/archive`,
  InventoryProductRestore: (id: string) =>
    `${buildInventoryProductPath(id)}/restore`,
  InventoryProductMarkFinished: (id: string) =>
    `${buildInventoryProductPath(id)}/mark-finished`,

  Schedule: SCHEDULE_BASE,
  ScheduleToday: `${SCHEDULE_BASE}/today`,
  ScheduleSlots: SCHEDULE_SLOTS_BASE,
  ScheduleSlotsBatch: `${SCHEDULE_SLOTS_BASE}/batch`,
  ScheduleApplyPreset: `${SCHEDULE_BASE}/apply-preset`,
  ScheduleSlot: buildScheduleSlotPath,
  ScheduleSlotSteps: (id: string) => `${buildScheduleSlotPath(id)}/steps`,
  ScheduleSlotMove: (id: string) => `${buildScheduleSlotPath(id)}/move`,

  IngredientsAnalyze: `${INGREDIENTS_BASE}/analyze`,

  AppNavBadges: `${APP_BASE}/nav-badges`,

  SkinJournalToday: `${SKIN_JOURNAL_BASE}/today`,
  SkinJournalCalendar: `${SKIN_JOURNAL_BASE}/calendar`,
  SkinJournalEntries: `${SKIN_JOURNAL_BASE}/entries`,
  SkinJournalPhotos: `${SKIN_JOURNAL_BASE}/photos`,
  SkinJournalPhotoFilters: `${SKIN_JOURNAL_BASE}/photo-filters`,
  SkinJournalPhotoDates: `${SKIN_JOURNAL_BASE}/photo-dates`,
  SkinJournalDay: (date: string) => `${SKIN_JOURNAL_BASE}/days/${date}`,
  SkinJournalEntry: (id: string) => `${SKIN_JOURNAL_BASE}/entries/${id}`,
  SkinJournalEntryRetry: (id: string) =>
    `${SKIN_JOURNAL_BASE}/entries/${id}/analyze/retry`,
  SkinJournalCompare: `${SKIN_JOURNAL_BASE}/compare`,
  SkinJournalEvents: `${SKIN_JOURNAL_BASE}/events`,
  SkinJournalEventAck: (id: string) =>
    `${SKIN_JOURNAL_BASE}/events/${id}/acknowledge`,
  SkinJournalInsights: `${SKIN_JOURNAL_BASE}/insights`,
  SkinJournalInsightDismiss: (id: string) =>
    `${SKIN_JOURNAL_BASE}/insights/${id}/dismiss`,
  SkinJournalInsightSeen: (id: string) =>
    `${SKIN_JOURNAL_BASE}/insights/${id}/seen`,
  SkinJournalWrappedList: `${SKIN_JOURNAL_BASE}/wrapped`,
  SkinJournalWrapped: (id: string) => `${SKIN_JOURNAL_BASE}/wrapped/${id}`,
  SkinJournalSimplificationActive: `${SKIN_JOURNAL_BASE}/simplification/active`,
  SkinJournalSimplificationStart: `${SKIN_JOURNAL_BASE}/simplification/start`,
  SkinJournalSimplification: (id: string) =>
    `${SKIN_JOURNAL_BASE}/simplification/${id}`,
  SkinJournalSimplificationAck: (id: string) =>
    `${SKIN_JOURNAL_BASE}/simplification/${id}/acknowledge`,
  SkinJournalStats: `${SKIN_JOURNAL_BASE}/stats`,
  SkinJournalExport: `${SKIN_JOURNAL_BASE}/export`,
  SkinJournalExportJob: (id: string) => `${SKIN_JOURNAL_BASE}/export/${id}`,

  Notifications: NOTIFICATIONS_BASE,
  NotificationRead: (id: string) => `${NOTIFICATIONS_BASE}/${id}/read`,
  NotificationsReadAll: `${NOTIFICATIONS_BASE}/read-all`,
  NotificationPreferences: `${NOTIFICATIONS_BASE}/preferences`,

  SuggestionsToday: `${SUGGESTIONS_BASE}/today`,
  SuggestionsTodayNormalRoutine: `${SUGGESTIONS_BASE}/today/reaction/normal-routine`,
  SuggestionsTodayReminderLater: `${SUGGESTIONS_BASE}/today/reminders/later`,
  SuggestionGapActions: `${SUGGESTIONS_BASE}/gap-actions`,
  SuggestionsBreak: `${SUGGESTIONS_BASE}/break`,
  SuggestionsBreakResume: `${SUGGESTIONS_BASE}/break/resume`,
  SuggestionBreak: (id: string) => `${SUGGESTIONS_BASE}/break/${id}`,
  SuggestionRegenerate: (id: string) => `${SUGGESTIONS_BASE}/${id}/regenerate`,
  Suggestion: (id: string) => `${SUGGESTIONS_BASE}/${id}`,
  SuggestionsHistory: SUGGESTIONS_HISTORY_BASE,
  SuggestionsHistoryExport: `${SUGGESTIONS_HISTORY_BASE}/export`,
  SuggestionsHistoryDay: (date: string) =>
    `${SUGGESTIONS_HISTORY_BASE}/${date}`,

  ApplicationLogs: APPLICATION_LOGS_BASE,
  ApplicationLog: (id: string) => `${APPLICATION_LOGS_BASE}/${id}`,
  ApplicationLogVersions: (id: string) =>
    `${APPLICATION_LOGS_BASE}/${id}/versions`,
} as const;
