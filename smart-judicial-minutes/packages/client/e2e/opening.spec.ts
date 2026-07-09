import { test, expect } from '@playwright/test';

test.describe('Opening screen (pre-hearing)', () => {
  test('renders the official Ministry identity and RTL layout', async ({ page }) => {
    await page.goto('/');

    // Document shell is Arabic + right-to-left.
    await expect(page).toHaveTitle(/المحضر الذكي/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Ministry identity is present (header + opening card both show it).
    await expect(page.getByText('وزارة العدل').first()).toBeVisible();
    await expect(page.getByText('المحضر الذكي').first()).toBeVisible();

    // The large start-documentation button is the primary call to action.
    await expect(page.getByRole('button', { name: 'بدء التوثيق' })).toBeVisible();
  });

  test('shows all official hearing fields', async ({ page }) => {
    await page.goto('/');
    for (const label of [
      'رقم القضية',
      'اسم الدائرة',
      'القاضي',
      'كاتب الضبط',
      'تاريخ الجلسة',
      'وقت بدء الجلسة',
    ]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test('is keyboard accessible: the case number field accepts input', async ({ page }) => {
    await page.goto('/');
    const caseInput = page.getByPlaceholder('مثال: ٤٣٥/٢/ق');
    await caseInput.click();
    await caseInput.fill('٤٣٥/٢/ق');
    await expect(caseInput).toHaveValue('٤٣٥/٢/ق');
  });

  test('remains usable on a narrow side-panel width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'بدء التوثيق' })).toBeVisible();
    // No horizontal overflow of the document body.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 2,
    );
    expect(overflow).toBe(true);
  });
});
