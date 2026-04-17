/**
 * Shelf — Product Catalogue & Inventory Management types.
 *
 * The Shelf owns product facts. It does not own routine decisions
 * (AM vs PM, frequency, layer step) — those live in the Suggestion feature.
 * `UserFields.preferredTimeOfDay` is an OPTIONAL hint the user can set during
 * the add flow. The Suggestion feature may honour it when it builds the
 * routine, but the Shelf never surfaces it as a prominent chip.
 */

export enum ProductCategory {
  Cleanser = 'cleanser',
  Toner = 'toner',
  Essence = 'essence',
  Serum = 'serum',
  Moisturizer = 'moisturizer',
  SunProtection = 'sun-protection',
  Mask = 'mask',
  Exfoliant = 'exfoliant',
  EyeCare = 'eye-care',
  LipCare = 'lip-care',
  Treatment = 'treatment',
  Other = 'other',
}

export enum PreferredTimeOfDay {
  Morning = 'morning',
  Evening = 'evening',
  Either = 'either',
}

export enum ApplicationMethod {
  Fingertips = 'fingertips',
  CottonPad = 'cotton-pad',
  Brush = 'brush',
  Spray = 'spray',
  Dropper = 'dropper',
  Spatula = 'spatula',
  Other = 'other',
}

export enum Quantity {
  OneDrop = 'one-drop',
  TwoToThreeDrops = 'two-to-three-drops',
  PeaSize = 'pea-size',
  PumpOne = 'pump-one',
  PumpTwo = 'pump-two',
  CoinSize = 'coin-size',
  Generous = 'generous',
  AsNeeded = 'as-needed',
  Other = 'other',
}

export enum ShelfStatus {
  Active = 'active',
  Archived = 'archived',
  FinishedUp = 'finished-up',
}

export enum ShelfSort {
  RecentlyAdded = 'recently-added',
  ExpiringSoon = 'expiring-soon',
  Alphabetical = 'alphabetical',
  CategoryGrouped = 'category-grouped',
}

export enum ShelfStatFilter {
  All = 'all',
  InUse = 'in-use',
  Unopened = 'unopened',
  NearingExpiry = 'nearing-expiry',
  Expired = 'expired',
  Archived = 'archived',
}

export enum DataProvenance {
  BarcodeLookup = 'barcode-lookup',
  UrlFetch = 'url-fetch',
  Catalogue = 'catalogue',
  UserEntered = 'user-entered',
}

export type CatalogueIdentity = {
  brand: string;
  name: string;
  category: ProductCategory;
  barcode: string | null;
  imageUrls: string[];
  sizeMl: number | null;
  description: string | null;
  benefits: string[];
  suitedFor: string[];
  inciIngredients: string[];
  inciLastConfirmedAt: string | null;
};

export type ApplicationGuidance = {
  applicationMethod: ApplicationMethod | null;
  quantity: Quantity | null;
  steps: string[];
  cautions: string[];
  waitMinutes: number | null;
};

export type ManufacturerInfo = {
  brand: string;
  parentCompany: string | null;
  countryOfOrigin: string | null;
  countryOfManufacture: string | null;
  supportEmail: string | null;
  productUrl: string | null;
  websiteUrl: string | null;
};

export type UserFields = {
  openedAt: string | null;
  expiresAt: string | null;
  periodAfterOpeningMonths: number | null;
  pricePaid: number | null;
  pricePaidCurrency: string | null;
  purchasedFrom: string | null;
  personalNotes: string | null;
  preferredTimeOfDay: PreferredTimeOfDay | null;
};

export type ShelfProduct = {
  id: string;
  identity: CatalogueIdentity;
  guidance: ApplicationGuidance;
  manufacturer: ManufacturerInfo;
  userFields: UserFields;
  status: ShelfStatus;
  provenance: DataProvenance;
  createdAt: string;
  updatedAt: string;
};

export type ShelfProductDraft = Omit<
  ShelfProduct,
  'id' | 'createdAt' | 'updatedAt'
>;

export type ShelfProductFormValue = Pick<
  ShelfProductDraft,
  'identity' | 'guidance' | 'manufacturer' | 'userFields'
>;

export enum ShelfFormValidationCode {
  BrandRequired = 'brand-required',
  NameRequired = 'name-required',
  DescriptionRequired = 'description-required',
  BenefitsRequired = 'benefits-required',
  SuitedForRequired = 'suited-for-required',
  IngredientsRequired = 'ingredients-required',
  SizeRequired = 'size-required',
  SizeInvalid = 'size-invalid',
  ShelfLifeDateRequired = 'shelf-life-date-required',
  GuidanceStepsRequired = 'guidance-steps-required',
  PriceInvalid = 'price-invalid',
  SupportEmailInvalid = 'support-email-invalid',
  ProductUrlInvalid = 'product-url-invalid',
  ExpiresAtInvalid = 'expires-at-invalid',
}

/**
 * Used while collecting fields across the add-product flow. Sub-objects can
 * be partial because Search / URL / barcode lookups rarely supply every
 * field. The Confirm step composes a complete ShelfProductDraft from these
 * fragments before calling the create mutation.
 */
export type ShelfProductPartial = {
  identity?: Partial<CatalogueIdentity>;
  guidance?: Partial<ApplicationGuidance>;
  manufacturer?: Partial<ManufacturerInfo>;
  userFields?: Partial<UserFields>;
  status?: ShelfStatus;
  provenance?: DataProvenance;
};

export type CatalogueSuggestion = Pick<
  CatalogueIdentity,
  'brand' | 'name' | 'category' | 'imageUrls' | 'sizeMl' | 'barcode'
>;

export type ResolvedLookup = {
  identity: Partial<CatalogueIdentity>;
  manufacturer: Partial<ManufacturerInfo>;
  provenance: DataProvenance;
};

/**
 * Live derived status of a product on the shelf, computed from `openedAt`,
 * `expiresAt`, `periodAfterOpeningMonths`, and `status`. This is not stored;
 * it is re-derived every render by {@link deriveShelfLife}.
 */
export enum ShelfLifeState {
  Unopened = 'unopened',
  Fresh = 'fresh',
  Aging = 'aging',
  Expired = 'expired',
  Finished = 'finished',
  Archived = 'archived',
}

export type ShelfLifeSnapshot = {
  state: ShelfLifeState;
  /** Fraction [0, 1] of shelf life remaining, or null when no expiry data. */
  remainingFraction: number | null;
  /** Days remaining until expiry (negative if expired), null if unopened or unknown. */
  remainingDays: number | null;
};

export type ShelfListFilters = {
  stat: ShelfStatFilter;
  category: ProductCategory | 'all';
  search: string;
  sort: ShelfSort;
};
