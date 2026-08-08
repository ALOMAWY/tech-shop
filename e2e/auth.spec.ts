import { test, expect } from "@playwright/test";

test("owner can log in and reach the dashboard", async ({ page }) => {
  await page.goto("/ar");
  await page.goto("/ar/login");

  await expect(page.getByRole("heading", { name: /تسجيل الدخول/i })).toBeVisible();

  await page.getByLabel(/البريد الإلكتروني/i).fill("owner@techshop.iq");
  await page.getByLabel(/كلمة المرور/i).fill("Owner-Admin-123");
  await page.getByRole("button", { name: /دخول/i }).click();

  await expect(page).toHaveURL(/\/ar\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /owner/i })).toBeVisible();
});

test("customer is redirected from owner-only area", async ({ page }) => {
  await page.goto("/ar/dashboard");
  await page.waitForURL(/\/ar\/login/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: /تسجيل الدخول/i })).toBeVisible();
});