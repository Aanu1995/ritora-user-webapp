import { expect, test, type Page, type Route } from "@playwright/test";

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
          lookupConfidence: "medium",
          reviewRequired: true,
        },
      });

      await fulfillJson(
        route,
        200,
        createProductCheckResponse({
          reviewRequired: true,
          confidence: "medium",
        }),
      );
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
      page.getByRole("heading", { name: /good with limits/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/some extracted details need review/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add to shelf/i }),
    ).toHaveCount(0);
  });
});
