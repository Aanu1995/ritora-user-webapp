const AUTH_BASE = '/auth';
const USERS_BASE = '/users';
const USERS_ME_BASE = `${USERS_BASE}/me`;
const SKIN_PROFILE_BASE = '/skin-profile';
const CATALOGUE_PRODUCTS_BASE = '/catalogue/products';
const INVENTORY_PRODUCTS_BASE = '/inventory/products';
const SCHEDULE_BASE = '/schedule';
const SCHEDULE_SLOTS_BASE = `${SCHEDULE_BASE}/slots`;

const buildInventoryProductPath = (id: string) =>
  `${INVENTORY_PRODUCTS_BASE}/${id}`;

const buildScheduleSlotPath = (id: string) => `${SCHEDULE_SLOTS_BASE}/${id}`;

export const ApiPath = {
  AuthLogin: `${AUTH_BASE}/login`,
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
} as const;
