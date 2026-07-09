import { test, expect } from '@playwright/test';

test.describe('Hearing workflow guards', () => {
  test('starting outside Teams surfaces a friendly error dialog (auth required)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByPlaceholder('مثال: ٤٣٥/٢/ق').fill('435/2/ق');
    await page.getByRole('button', { name: 'بدء التوثيق' }).click();

    // Without a Teams SSO token the app must fail closed with a clear dialog,
    // never silently proceed — this validates the auth-required path.
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'إغلاق' })).toBeVisible();
  });

  test('dark mode toggle is operable', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('switch', { name: 'الوضع الليلي' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toBeChecked();
  });
});
