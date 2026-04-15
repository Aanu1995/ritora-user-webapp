import { test, expect } from '@playwright/test';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  preferredLanguage: 'en',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function mockAuthApi(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/v1/auth/login', async (route) => {
      const body = route.request().postDataJSON();
      if (
        body.email === 'test@example.com' &&
        body.password === 'TestPass1'
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: 'mock-token',
            user: mockUser,
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    }),

    page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-token',
          user: { ...mockUser, emailVerified: false },
        }),
      });
    }),

    page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No refresh token' }),
      });
    }),

    page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    }),
  ]);
}

test.describe('Login Flow', () => {
  test('shows login form', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^log in$/i }),
    ).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/^password$/i).fill('WrongPass1');
    await page.getByRole('button', { name: /^log in$/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('navigates to register from login', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/login');
    // Dismiss cookie consent banner so it does not intercept clicks on mobile
    const reject = page.getByRole('button', { name: /reject/i });
    if (await reject.isVisible()) {
      await reject.click();
    }
    await page.getByRole('link', { name: /create an account/i }).click();

    await expect(page).toHaveURL(/register/);
  });
});

test.describe('Register Flow', () => {
  test('shows registration form', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/register');

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('submit is disabled without consent', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/register');

    const submitBtn = page.getByRole('button', { name: /create account/i });
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('Forgot Password', () => {
  test('shows forgot password form', async ({ page }) => {
    await page.route('**/api/v1/auth/refresh', (route) =>
      route.fulfill({ status: 401, body: '{}' }),
    );
    await page.goto('/forgot-password');

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
