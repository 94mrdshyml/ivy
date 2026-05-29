import { test, expect, type Page } from "@playwright/test";

async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.fill(
    'input[type="email"]',
    process.env.E2E_TEST_EMAIL ?? "test@example.com",
  );
  await page.fill(
    'input[type="password"]',
    process.env.E2E_TEST_PASSWORD ?? "testpassword",
  );
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test("stays on /dashboard/settings/connections when navigated to", async ({
  page,
}) => {
  await loginAsTestUser(page);
  await page.goto("/dashboard/settings/connections");
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("/dashboard/settings/connections");
});
