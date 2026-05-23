import type {
  CommunityAdaptation,
  CommunityHome,
  CommunityPostingEligibility,
  CommunityReview,
  CommunityRoutine,
  CommunitySafeProfileFacets,
  CommunitySubmission,
} from "@/types/community";

export const communityFacets: CommunitySafeProfileFacets = {
  skinType: "dry",
  concernTags: ["barrier", "redness", "texture"],
  sensitivityLevel: "sensitive",
  skinToneRange: "fitzpatrick-iii",
  climateBucket: "cold-dry",
  routinePace: "minimal",
  goalTags: ["barrier"],
};

export const eligiblePosting: CommunityPostingEligibility = {
  eligible: true,
  minimumAccountAgeDays: 3,
  accountAgeDays: 14,
  eligibleAt: "2026-05-01T00:00:00.000Z",
  hasAcceptedGuidelines: true,
  hasCompletedSkinProfile: true,
  hasShelfProduct: true,
  emailVerified: true,
  reasons: [],
};

export const blockedPosting: CommunityPostingEligibility = {
  eligible: false,
  minimumAccountAgeDays: 3,
  accountAgeDays: 1,
  eligibleAt: "2026-05-25T00:00:00.000Z",
  hasAcceptedGuidelines: false,
  hasCompletedSkinProfile: false,
  hasShelfProduct: false,
  emailVerified: false,
  reasons: [
    {
      code: "account_too_new",
      message: "Your account is too new to publish community content.",
    },
    {
      code: "community_guidelines_required",
      message: "Accept the community guidelines before posting.",
    },
    {
      code: "email_unverified",
      message: "Verify your email before posting.",
    },
    {
      code: "skin_profile_required",
      message: "Complete your skin profile before posting.",
    },
    {
      code: "shelf_product_required",
      message: "Add a shelf product before posting.",
    },
  ],
};

export const routineFixture: CommunityRoutine = {
  id: "routine-1",
  type: "routine",
  title: "Quiet AM barrier routine",
  summary: "A gentle routine that avoids stacking strong actives.",
  disclosureType: "ordinary",
  moderationStatus: "published",
  concernTags: ["barrier"],
  goalTags: ["maintenance"],
  safeFacets: communityFacets,
  safetyFlags: [
    {
      code: "missing-sunscreen",
      severity: "medium",
      message: "Add sunscreen when using photosensitizing actives.",
    },
  ],
  helpfulCount: 12,
  notHelpfulCount: 1,
  matchScore: 92,
  relevanceReasons: ["dry skin", "sensitive skin", "cold climate"],
  steps: [
    {
      stepOrder: 1,
      slot: "am",
      productBrand: "Ritora",
      productName: "Milk Cleanser",
      category: "cleanser",
      frequency: "daily",
      notes: "Keep it gentle.",
    },
    {
      stepOrder: 2,
      slot: "am",
      productBrand: null,
      productName: null,
      category: "sunscreen",
      frequency: "daily",
      notes: null,
    },
  ],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

export const reviewFixture: CommunityReview = {
  id: "review-1",
  type: "review",
  productBrand: "Ritora",
  productName: "Barrier Cream",
  productCategory: "moisturizer",
  disclosureType: "gifted",
  usageDuration: "4 weeks",
  frequency: "daily",
  outcomes: ["helped-overall", "repurchased"],
  repurchase: "yes",
  body: "Helped my routine feel calmer without adding extra steps.",
  moderationStatus: "published",
  safeFacets: communityFacets,
  safetyFlags: [],
  routineContext: [
    {
      productBrand: "Ritora",
      productName: "Milk Cleanser",
      category: "cleanser",
    },
  ],
  helpfulCount: 8,
  notHelpfulCount: 0,
  matchScore: 76,
  relevanceReasons: ["barrier goal"],
  createdAt: "2026-05-02T00:00:00.000Z",
  updatedAt: "2026-05-02T00:00:00.000Z",
};

export const communityHomeFixture: CommunityHome = {
  profileFacets: communityFacets,
  postingEligibility: blockedPosting,
  routines: [routineFixture],
  reviews: [reviewFixture],
  warnings: [
    {
      id: "warning-1",
      title: "Retinoid routines need sunscreen",
      body: "Community routines involving retinoids should preserve sunscreen.",
      severity: "medium",
      affected_facets: ["sensitive"],
      active: true,
      created_at: "2026-05-03T00:00:00.000Z",
      updated_at: "2026-05-03T00:00:00.000Z",
    },
  ],
  patterns: [
    {
      id: "pattern-1",
      title: "Minimal barrier support",
      body: "Users like you often keep cleanser, moisturizer and sunscreen stable.",
    },
  ],
};

export const submissionsFixture: CommunitySubmission[] = [
  {
    id: "submission-routine",
    type: "routine",
    title: "Needs safer routine",
    editableText: "Original routine wording",
    status: "needs_edit",
    disclosureType: "ordinary",
    safetyFlags: [
      {
        code: "medical-claim",
        severity: "high",
        message: "Remove treatment claims before resubmitting.",
      },
    ],
    authorUserId: "user-1",
    createdAt: "2026-05-04T00:00:00.000Z",
    updatedAt: "2026-05-04T00:00:00.000Z",
  },
  {
    id: "submission-review",
    type: "review",
    title: "Rejected review",
    editableText: "Original review wording",
    status: "rejected",
    disclosureType: "sponsored",
    safetyFlags: [],
    authorUserId: "user-1",
    createdAt: "2026-05-05T00:00:00.000Z",
    updatedAt: "2026-05-05T00:00:00.000Z",
  },
];

export const adaptationFixture: CommunityAdaptation = {
  id: "adaptation-1",
  routineId: "routine-1",
  summary: {
    kept: 1,
    swapped: 1,
    removed: 1,
    gaps: 1,
  },
  changes: [
    {
      changeType: "kept",
      stepOrder: 1,
      sourceProductName: "Milk Cleanser",
      sourceProductBrand: "Ritora",
      targetProductId: "product-1",
      targetProductName: "Milk Cleanser",
      targetProductBrand: "Ritora",
      category: "cleanser",
      reason: "Exact product exists on your shelf.",
    },
    {
      changeType: "swapped",
      stepOrder: 2,
      sourceProductName: "Barrier Cream",
      sourceProductBrand: "Ritora",
      targetProductId: "product-2",
      targetProductName: "Calm Cream",
      targetProductBrand: "Ritora",
      category: "moisturizer",
      reason: "Same category and lower irritation risk.",
    },
    {
      changeType: "removed",
      stepOrder: 3,
      sourceProductName: "Strong Peel",
      sourceProductBrand: "Example",
      targetProductId: null,
      targetProductName: null,
      targetProductBrand: null,
      category: "exfoliant",
      reason: "Removed because frequency conflicts with your sensitivity.",
    },
    {
      changeType: "gap",
      stepOrder: 4,
      sourceProductName: null,
      sourceProductBrand: null,
      targetProductId: null,
      targetProductName: null,
      targetProductBrand: null,
      category: "sunscreen",
      reason: "A sunscreen category gap remains.",
    },
  ],
};
