import { test, expect } from '@playwright/test';

test.describe('レスポンシブデザインのテスト', () => {
  test('モバイルビューポートでのホーム画面表示テスト', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ヘッダーが表示されることを確認
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // メインコンテンツが表示されることを確認
    const mainContent = page.locator('main[role="main"]');
    await expect(mainContent).toBeVisible();

    // ボタンが表示されることを確認
    const startButton = page.getByRole('link', {
      name: /新しいクイズを開始する/,
    });
    const historyButton = page.getByRole('link', {
      name: /過去のクイズ結果を確認する/,
    });
    await expect(startButton).toBeVisible();
    await expect(historyButton).toBeVisible();

    // 要素がビューポート内に収まっていることを確認
    const startButtonBox = await startButton.boundingBox();
    const historyButtonBox = await historyButton.boundingBox();

    if (startButtonBox && historyButtonBox) {
      expect(startButtonBox.x).toBeGreaterThanOrEqual(0);
      expect(startButtonBox.x + startButtonBox.width).toBeLessThanOrEqual(375);
      expect(historyButtonBox.x).toBeGreaterThanOrEqual(0);
      expect(historyButtonBox.x + historyButtonBox.width).toBeLessThanOrEqual(
        375
      );
    }
  });

  test('タブレットビューポートでのホーム画面表示テスト', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ヘッダーが表示されることを確認
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // メインコンテンツが表示されることを確認
    const mainContent = page.locator('main[role="main"]');
    await expect(mainContent).toBeVisible();

    // ボタンが表示されることを確認
    const startButton = page.getByRole('link', {
      name: /新しいクイズを開始する/,
    });
    const historyButton = page.getByRole('link', {
      name: /過去のクイズ結果を確認する/,
    });
    await expect(startButton).toBeVisible();
    await expect(historyButton).toBeVisible();
  });

  test('デスクトップビューポートでのホーム画面表示テスト', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ヘッダーが表示されることを確認
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // メインコンテンツが表示されることを確認
    const mainContent = page.locator('main[role="main"]');
    await expect(mainContent).toBeVisible();

    // ボタンが表示されることを確認
    const startButton = page.getByRole('link', {
      name: /新しいクイズを開始する/,
    });
    const historyButton = page.getByRole('link', {
      name: /過去のクイズ結果を確認する/,
    });
    await expect(startButton).toBeVisible();
    await expect(historyButton).toBeVisible();
  });

  test('ビューポートサイズ変更時のレイアウト確認', async ({ page }) => {
    // デスクトップサイズで開始
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 初期状態でボタンが表示されることを確認
    const startButton = page.getByRole('link', {
      name: /新しいクイズを開始する/,
    });
    const historyButton = page.getByRole('link', {
      name: /過去のクイズ結果を確認する/,
    });
    await expect(startButton).toBeVisible();
    await expect(historyButton).toBeVisible();

    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // レイアウト調整を待機

    // ボタンが引き続き表示されることを確認
    await expect(startButton).toBeVisible();
    await expect(historyButton).toBeVisible();

    // 要素がビューポート内に収まっていることを確認
    const startButtonBox = await startButton.boundingBox();
    const historyButtonBox = await historyButton.boundingBox();

    if (startButtonBox && historyButtonBox) {
      expect(startButtonBox.x).toBeGreaterThanOrEqual(0);
      expect(startButtonBox.x + startButtonBox.width).toBeLessThanOrEqual(375);
      expect(historyButtonBox.x).toBeGreaterThanOrEqual(0);
      expect(historyButtonBox.x + historyButtonBox.width).toBeLessThanOrEqual(
        375
      );
    }
  });

  test('モバイルでのタッチターゲットサイズテスト', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ボタンのタッチターゲットサイズが適切であることを確認（44px以上推奨）
    const startButton = page.getByRole('link', {
      name: /新しいクイズを開始する/,
    });
    const buttonBox = await startButton.boundingBox();

    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
    }
  });
});
