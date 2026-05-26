import { test, expect } from "@playwright/test";

test("homepage contains Ivy", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("Ivy");
});
