export type ApplicationItemStatus = "applied" | "skipped" | "substituted";
export const APPLICATION_ITEM_STATUSES: readonly ApplicationItemStatus[] = [
  "applied",
  "skipped",
  "substituted",
];

export type ApplicationItemSource =
  | "recommended"
  | "added_shelf"
  | "added_off_shelf";

export type ApplicationItemProductSnapshot = {
  product_id: string | null;
  brand: string | null;
  name: string | null;
  step_label: string | null;
  routine_step_id?: string | null;
  suggestion_step_id?: string | null;
  provenance?: string | null;
};

export type ApplicationLogItem = {
  id: string;
  stepOrder: number;
  suggestionStepId: string | null;
  inventoryProductId: string | null;
  substitutedWithProductId: string | null;
  productBrand: string | null;
  productName: string | null;
  stepLabel: string | null;
  status: ApplicationItemStatus;
  isAdHoc: boolean;
  itemSource: ApplicationItemSource;
  adHocBrand: string | null;
  adHocName: string | null;
  notes: string | null;
  substitutionReason: string | null;
  recommendedSnapshot: ApplicationItemProductSnapshot | null;
  appliedSnapshot: ApplicationItemProductSnapshot | null;
  appliedAt: string | null;
  product: ApplicationProductSummary | null;
  substitutedWithProduct: ApplicationProductSummary | null;
};

export type ApplicationProductSummary = {
  id: string;
  brand: string;
  name: string;
  category: string;
  imageUrl: string | null;
  status: string;
};

export type ApplicationLog = {
  id: string;
  suggestionInstanceId: string | null;
  slotId: string | null;
  targetDate: string; // YYYY-MM-DD
  targetTime: string | null; // HH:MM, null for ad-hoc
  daypart: "morning" | "noon" | "evening" | null;
  appliedAt: string | null;
  generalNotes: string | null;
  editReason: string | null;
  editCount: number;
  hasBeenEdited: boolean;
  firstRecordedAt: string;
  lastEditedAt: string | null;
  items: ApplicationLogItem[];
  createdAt: string;
  updatedAt: string;
};

export type ApplicationLogVersion = {
  id: string;
  applicationLogId: string;
  version: number;
  editedAt: string;
  editedByUserId: string;
  editReason: string | null;
  snapshot: ApplicationLogSnapshot;
};

export type ApplicationLogSnapshot = {
  version: number;
  applied_at: string | null;
  general_notes: string | null;
  items: ApplicationLogItemSnapshot[];
  edited_at: string;
  edited_by_user_id: string;
  edit_reason: string | null;
};

export type ApplicationLogItemSnapshot = {
  step_order: number;
  suggestion_step_id: string | null;
  inventory_product_id: string | null;
  substituted_with_product_id: string | null;
  product_brand_snapshot: string | null;
  product_name_snapshot: string | null;
  step_label: string | null;
  status: ApplicationItemStatus;
  is_ad_hoc: boolean;
  ad_hoc_brand: string | null;
  ad_hoc_name: string | null;
  notes: string | null;
  applied_at: string | null;
  item_source: ApplicationItemSource;
  substitution_reason: string | null;
  recommended_snapshot: ApplicationItemProductSnapshot | null;
  applied_snapshot: ApplicationItemProductSnapshot | null;
};

export type ApplicationLogItemInput = {
  stepOrder: number;
  suggestionStepId?: string | null;
  inventoryProductId?: string | null;
  substitutedWithProductId?: string | null;
  productBrand?: string | null;
  productName?: string | null;
  stepLabel?: string | null;
  status: ApplicationItemStatus;
  isAdHoc?: boolean;
  adHocBrand?: string | null;
  adHocName?: string | null;
  notes?: string | null;
  substitutionReason?: string | null;
  appliedAt?: string | null;
};

export type RecordApplicationPayload = {
  suggestionInstanceId?: string;
  slotId?: string;
  targetDate: string;
  targetTime?: string | null;
  appliedAt?: string | null;
  generalNotes?: string | null;
  items: ApplicationLogItemInput[];
};

export type EditApplicationPayload = {
  appliedAt?: string | null;
  generalNotes?: string | null;
  editReason?: string | null;
  items: ApplicationLogItemInput[];
};
