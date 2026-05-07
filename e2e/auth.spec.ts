import { test, expect } from "@playwright/test";

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  preferredLanguage: "en",
  timeZone: "Europe/Stockholm",
  createdAt: "2024-01-01T00:00:00.000Z",
};

const PLAYWRIGHT_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? "3010"}`;

const CORS_HEADERS = {
  "access-control-allow-origin": PLAYWRIGHT_ORIGIN,
  "access-control-allow-credentials": "true",
  "access-control-allow-headers":
    "content-type, authorization, accept-language, x-timezone",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

async function fulfillJson(
  route: import("@playwright/test").Route,
  status: number,
  body: unknown,
) {
  await route.fulfill({
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function mockAuthApi(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route("**/api/v1/auth/login", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      const body = route.request().postDataJSON();
      if (body.email === "test@example.com" && body.password === "TestPass1") {
        await fulfillJson(route, 200, {
          accessToken: "mock-token",
          user: mockUser,
        });
      } else {
        await fulfillJson(route, 401, {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        });
      }
    }),

    page.route("**/api/v1/auth/register", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 201, {
        message: "Verification email sent",
        user: { ...mockUser, emailVerified: false },
      });
    }),

    page.route("**/api/v1/auth/refresh", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 401, { message: "No refresh token" });
    }),

    page.route("**/api/v1/auth/me", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await fulfillJson(route, 200, mockUser);
    }),

    page.route("**/api/v1/auth/**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: CORS_HEADERS,
        });
        return;
      }

      await route.fallback();
    }),
  ]);
}

async function dismissCookieBanner(page: import("@playwright/test").Page) {
  const reject = page.getByRole("button", { name: /reject/i });
  try {
    await reject.waitFor({ state: "visible", timeout: 2000 });
    await reject.click();
  } catch {
    return;
  }
}

test.describe("Login Flow", () => {
  test("shows login form", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^log in$/i })).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");
    await dismissCookieBanner(page);

    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/^password$/i).fill("WrongPass1");
    await page.getByRole("button", { name: /^log in$/i }).click();

    await expect(
      page.getByText(/email or password is incorrect/i),
    ).toBeVisible();
  });

  test("navigates to register from login", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");
    await dismissCookieBanner(page);
    await page.getByRole("link", { name: /create an account/i }).click();

    await expect(page).toHaveURL(/register/);
  });
});

test.describe("Register Flow", () => {
  test("shows registration form", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/register");

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("submit is disabled without consent", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/register");

    const submitBtn = page.getByRole("button", { name: /create account/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("shows verification instructions after successful registration", async ({
    page,
  }) => {
    await mockAuthApi(page);
    await page.goto("/register");
    await dismissCookieBanner(page);

    await page.getByLabel(/first name/i).fill("Test");
    await page.getByLabel(/last name/i).fill("User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("TestPass1");
    await page.getByLabel(/confirm password/i).fill("TestPass1");

    const checkboxes = page.getByRole("checkbox");
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(
      page.getByText(/you'll be able to log in after verifying your email/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /resend verification email/i }),
    ).toHaveAttribute("href", "/resend-verification?email=test%40example.com");
  });
});

test.describe("Forgot Password", () => {
  test("shows forgot password form", async ({ page }) => {
    await page.route("**/api/v1/auth/refresh", (route) =>
      fulfillJson(route, 401, {}),
    );
    await page.goto("/forgot-password");

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
