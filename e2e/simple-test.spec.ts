import { test, expect } from '@playwright/test';

test('ホーム画面が表示される', async ({ page }) => {
  await page.goto('/');

  // ページが読み込まれるまで待機
  await page.waitForLoadState('networkidle');

  // ページのタイトルを確認
  await expect(page).toHaveTitle(/クイズアプリ/);

  // ヘッダーが表示されることを確認
  await expect(
    page.getByRole('heading', { name: 'クイズアプリ' })
  ).toBeVisible();

  // ボタンが表示されることを確認
  await expect(page.getByText('クイズを始める')).toBeVisible();
  await expect(page.getByText('履歴を見る')).toBeVisible();
});
