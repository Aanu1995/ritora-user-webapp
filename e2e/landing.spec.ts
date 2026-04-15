import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with headline', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible();
  });

  test('renders navigation header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.getByRole('link', { name: /ritora/i }).first()).toBeVisible();
  });

  test('renders footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/privacy/i)).toBeVisible();
    await expect(footer.getByText(/terms/i)).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('ritora');
  });

  test('CTA links to login page', async ({ page }) => {
    const cta = page.getByRole('link', { name: /log in/i }).first();
    await expect(cta).toHaveAttribute('href', /login/);
  });

  test('primary CTA has visible text', async ({ page }) => {
    const cta = page.getByRole('link', { name: /log in/i }).first();
    const contrast = await cta.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { color: style.color, bg: style.backgroundColor };
    });
    expect(contrast.color).not.toBe(contrast.bg);
  });

  test('is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('opens mobile nav on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const trigger = page.getByRole('button', { name: /open menu/i });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: /open menu/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: /why ritora/i })).toBeVisible();
  });
});

test.describe('Legal Pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toBeVisible();
  });
});
