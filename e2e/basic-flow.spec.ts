import { test, expect } from '@playwright/test';

test.describe('基本的なクイズフロー', () => {
  test('ホーム画面からクイズ画面への遷移', async ({ page }) => {
    // ホーム画面にアクセス
    await page.goto('/');

    // ホーム画面の要素を確認
    await expect(
      page.getByRole('heading', { name: 'クイズアプリ' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'クイズを始める' })
    ).toBeVisible();

    // クイズを始めるリンクをクリック
    await page.getByRole('link', { name: 'クイズを始める' }).click();

    // クイズ画面に遷移したことを確認
    await expect(page).toHaveURL('/quiz');

    // 最初の質問が表示されることを確認（ローディング後）
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('[data-testid="question-progress"]')
    ).toContainText('1/10');
  });

  test('履歴画面への遷移', async ({ page }) => {
    // ホーム画面にアクセス
    await page.goto('/');

    // 履歴を見るリンクをクリック
    await page.getByRole('link', { name: '履歴を見る' }).click();

    // 履歴画面に遷移したことを確認
    await expect(page).toHaveURL('/history');

    // 履歴画面のタイトルが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'クイズ履歴' })
    ).toBeVisible();
  });
});
