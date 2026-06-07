import { expect, test, type Page, type Route } from "@playwright/test";
import { createReadySkinProfile } from "../src/test/skin-profile";

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  preferredLanguage: "en",
  timeZone: "Europe/Stockholm",
  createdAt: "2026-05-17T00:00:00.000Z",
};

const PLAYWRIGHT_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? "3010"}`;

const CORS_HEADERS = {
  "access-control-allow-origin": PLAYWRIGHT_ORIGIN,
  "access-control-allow-credentials": "true",
  "access-control-allow-headers":
    "content-type, authorization, accept-language, x-timezone",
  "access-control-allow-methods": "GET,POST,OPTIONS,PATCH,DELETE",
};

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function mockAuthenticatedApi(page: Page) {
  await Promise.all([
    page.route("**/api/v1/auth/refresh", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, { accessToken: "mock-token" });
    }),
    page.route("**/api/v1/auth/me", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, mockUser);
    }),
    page.route("**/api/v1/app/nav-badges", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, {
        notifications_unread_count: 0,
        skin_journal_warning_count: 0,
      });
    }),
    page.route("**/api/v1/skin-profile", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
      }

      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, createReadySkinProfile());
    }),
    page.route("**/api/v1/auth/**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
      }

      await route.fallback();
    }),
  ]);
}

async function dismissCookieBanner(page: Page) {
  const reject = page.getByRole("button", { name: /reject/i });
  try {
    await reject.waitFor({ state: "visible", timeout: 2000 });
    await reject.click();
  } catch {
    return;
  }
}

function createShelfDraft() {
  return {
    identity: {
      brand: "Ritora Lab",
      name: "Barrier Serum",
      category: "serum",
      barcode: null,
      imageUrls: [],
      sizeMl: 30,
      description: "Hydrating barrier serum.",
      benefits: ["Hydration"],
      suitedFor: ["Sensitive skin"],
      inciIngredients: ["Aqua", "Niacinamide"],
      inciLastConfirmedAt: "2026-05-17T09:00:00.000Z",
    },
    guidance: {
      applicationMethod: null,
      quantity: null,
      steps: ["Apply after cleansing."],
      cautions: [],
      waitMinutes: null,
    },
    manufacturer: {
      brand: "Ritora Lab",
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: "active",
    provenance: "photo-lookup",
  };
}

function createShelfProduct(overrides?: {
  id?: string;
  brand?: string;
  name?: string;
  inciIngredients?: string[];
}) {
  const draft = createShelfDraft();

  return {
    id: overrides?.id ?? "shelf-1",
    ...draft,
    identity: {
      ...draft.identity,
      brand: overrides?.brand ?? draft.identity.brand,
      name: overrides?.name ?? draft.identity.name,
      inciIngredients:
        overrides?.inciIngredients ?? draft.identity.inciIngredients,
    },
    manufacturer: {
      ...draft.manufacturer,
      brand: overrides?.brand ?? draft.manufacturer.brand,
    },
    createdAt: "2026-05-17T09:00:00.000Z",
    updatedAt: "2026-05-17T09:00:00.000Z",
  };
}

function createProductCheckResponse(options?: {
  reviewRequired?: boolean;
  confidence?: "high" | "medium" | "low";
}) {
  const confidence = options?.confidence ?? "high";
  const reviewRequired = options?.reviewRequired ?? false;

  return {
    context: {
      level: "personalized",
      usedSignals: ["skin_profile", "active_shelf"],
      missingSignals: [],
      activeShelfProductCount: 1,
      recentJournalReactionCount: 0,
      recentSuggestionReactionCount: 0,
    },
    analysis: {
      mode: "multi",
      status: "ok",
      confidence,
      safetyScore: reviewRequired ? 82 : 92,
      actives: [],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: "ingredient-engine-v2",
      generatedAt: "2026-05-17T09:00:00.000Z",
    },
    verdict: {
      label: reviewRequired ? "good_with_limits" : "good_fit",
      tone: reviewRequired ? "caution" : "positive",
      confidence,
      safetyScore: reviewRequired ? 82 : 92,
      reasons: reviewRequired
        ? [
            {
              code: "review_required",
              severity: null,
              ingredientNames: [],
              conflictCode: null,
            },
          ]
        : [],
      nextAction: reviewRequired ? "review_and_patch_test" : "use_as_planned",
      generatedAt: "2026-05-17T09:00:00.000Z",
    },
    aiReview: {
      status: "reviewed",
      confidence,
      suggestedVerdict: null,
      reasonCodes: [],
      ingredientNames: [],
      summary: null,
      reviewedAt: "2026-05-17T09:00:00.000Z",
    },
    reactionEvidence: [],
    purchaseGuidance: {
      shouldConsiderAlternatives: false,
      reasonCodes: [],
      alternatives: [],
    },
  };
}

function createShelfCompareResponse() {
  const base = createProductCompareResponse();

  return {
    ...base,
    goal: "shelf_routine_decision",
    items: base.items.map((item, index) => ({
      ...item,
      kind: "shelf_product",
      productId: index === 0 ? "shelf-1" : "shelf-2",
      brand: index === 0 ? "Ritora Lab" : "Calm Lab",
      name: index === 0 ? "Barrier Serum" : "Gentle Cream",
    })),
    comparison: {
      ...base.comparison,
      summary:
        "These shelf products have similar tradeoffs, so Ritora cannot choose a clear winner.",
    },
  };
}

function createProductCompareResponse() {
  return {
    goal: "new_product_decision",
    context: {
      level: "personalized",
      usedSignals: ["skin_profile", "active_shelf"],
      missingSignals: [],
      activeShelfProductCount: 1,
      recentJournalReactionCount: 0,
      recentSuggestionReactionCount: 0,
    },
    items: [
      {
        itemId: "anchor",
        kind: "checked_product",
        productId: null,
        brand: "Ritora Lab",
        name: "Barrier Serum",
        category: "serum",
        inciIngredientCount: 2,
        matchedIngredientCount: 2,
        confidence: "high",
        safetyScore: 92,
        verdict: createProductCheckResponse().verdict,
        keyActives: ["Niacinamide"],
        conflictCount: 0,
        overlapCount: 0,
        reactionEvidenceCount: 0,
      },
      {
        itemId: "candidate-1",
        kind: "shelf_product",
        productId: "shelf-1",
        brand: "Ritora Lab",
        name: "Barrier Serum",
        category: "serum",
        inciIngredientCount: 2,
        matchedIngredientCount: 2,
        confidence: "high",
        safetyScore: 92,
        verdict: createProductCheckResponse().verdict,
        keyActives: ["Niacinamide"],
        conflictCount: 0,
        overlapCount: 0,
        reactionEvidenceCount: 0,
      },
    ],
    comparison: {
      outcome: "no_clear_winner",
      winnerItemId: null,
      confidence: "medium",
      summary:
        "This looks very similar to a product you already own. It is only worth buying if you are replacing the shelf product.",
      reasons: [
        {
          code: "already_owned",
          itemIds: ["anchor", "candidate-1"],
          ingredientNames: ["Aqua", "Niacinamide"],
          severity: null,
        },
        {
          code: "replacement_only",
          itemIds: ["anchor", "candidate-1"],
          ingredientNames: ["Aqua", "Niacinamide"],
          severity: null,
        },
      ],
      generatedAt: "2026-05-17T09:00:00.000Z",
    },
    aiReview: {
      status: "unavailable",
      confidence: "low",
      preferredItemId: null,
      reasonCodes: [],
      summary: null,
      reviewedAt: "2026-05-17T09:00:00.000Z",
    },
  };
}

function createResolvedLookup() {
  return {
    ...createShelfDraft(),
    source: "user-photos",
    confidence: "medium",
    reviewRequired: true,
    warnings: ["partial-data"],
    evidence: [],
  };
}

test.describe("Check Product", () => {
  test("checks pasted ingredients and renders a verdict without saving to Shelf", async ({
    page,
  }) => {
    await mockAuthenticatedApi(page);
    await page.route("**/api/v1/ingredients/check-product", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject({
        product: {
          source: "ingredient_paste",
          brand: "Ritora Lab",
          name: "Barrier Serum",
          inciIngredients: ["Aqua", "Niacinamide"],
        },
      });

      await fulfillJson(route, 200, createProductCheckResponse());
    });
    await page.route("**/api/v1/inventory/products**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, {
        items: [createShelfProduct()],
        nextCursor: null,
      });
    });
    await page.route("**/api/v1/ingredients/compare-products", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject({
        goal: "new_product_decision",
        anchor: {
          kind: "checked_product",
          product: {
            brand: "Ritora Lab",
            name: "Barrier Serum",
          },
        },
        candidates: [{ kind: "shelf_product", productId: "shelf-1" }],
      });

      await fulfillJson(route, 200, createProductCompareResponse());
    });

    await page.goto("/check-product");
    await dismissCookieBanner(page);

    await page.getByLabel(/brand/i).fill("Ritora Lab");
    await page.getByLabel(/product name/i).fill("Barrier Serum");
    await page
      .getByPlaceholder(/paste inci ingredients/i)
      .fill("Aqua, Niacinamide");
    await page.getByRole("button", { name: /quick check/i }).click();

    await expect(
      page.getByRole("heading", { name: /good fit/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add to shelf/i }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: /open comparison/i }).click();
    await page.getByLabel(/ritora lab barrier serum/i).click();
    await page.getByRole("button", { name: /compare with 1 shelf product/i }).click();
    await expect(page.getByText(/no clear reason to buy/i)).toBeVisible();
    await expect(page.getByText(/replacement/i)).toBeVisible();
  });

  test("checks extracted ingredient label photos and stays verdict-only", async ({
    page,
  }) => {
    await mockAuthenticatedApi(page);
    await page.route(
      "**/api/v1/catalogue/products/extract-from-images",
      async (route) => {
        expect(route.request().method()).toBe("POST");
        await fulfillJson(route, 200, createResolvedLookup());
      },
    );
    await page.route("**/api/v1/ingredients/check-product", async (route) => {
      expect(route.request().postDataJSON()).toMatchObject({
        product: {
          source: "photo_extraction",
          brand: "Ritora Lab",
          name: "Barrier Serum",
          reviewRequired: false,
        },
      });

      await fulfillJson(route, 200, createProductCheckResponse());
    });

    await page.goto("/check-product");
    await dismissCookieBanner(page);
    await page.getByRole("tab", { name: /photos/i }).click();
    await expect(page.getByLabel(/add product photo/i)).toHaveCount(0);
    await page.getByLabel(/^add photo$/i).setInputFiles({
      name: "label.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("label-photo"),
    });
    await page.getByRole("button", { name: /quick check/i }).click();

    await expect(
      page.getByRole("heading", { name: /good fit/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/some extracted details need review/i),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /add to shelf/i }),
    ).toHaveCount(0);
  });

  test("compares one Shelf product with another from the detail page", async ({
    page,
  }) => {
    const shelfOne = createShelfProduct({ id: "shelf-1" });
    const shelfTwo = createShelfProduct({
      id: "shelf-2",
      brand: "Calm Lab",
      name: "Gentle Cream",
      inciIngredients: ["Aqua", "Glycerin", "Ceramide NP"],
    });
    await mockAuthenticatedApi(page);
    await page.route("**/api/v1/inventory/products**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/inventory/products/shelf-1")) {
        await fulfillJson(route, 200, shelfOne);
        return;
      }

      await fulfillJson(route, 200, {
        items: [shelfOne, shelfTwo],
        nextCursor: null,
      });
    });
    await page.route("**/api/v1/ingredients/compare-products", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject({
        goal: "shelf_routine_decision",
        anchor: { kind: "shelf_product", productId: "shelf-1" },
        candidates: [{ kind: "shelf_product", productId: "shelf-2" }],
      });

      await fulfillJson(route, 200, createShelfCompareResponse());
    });

    await page.goto("/shelf/shelf-1");
    await dismissCookieBanner(page);
    await page.getByRole("button", { name: /^compare$/i }).click();
    await page.getByLabel(/calm lab gentle cream/i).click();
    await page.getByRole("button", { name: /review 1 owned product/i }).click();

    await expect(page.getByText(/no single product needs to win/i)).toBeVisible();
    await expect(page.getByText(/similar tradeoffs/i)).toBeVisible();
  });
});
