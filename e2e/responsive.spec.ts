import { test, expect } from '@playwright/test';

test.describe('レスポンシブデザインのテスト', () => {
  // 各ビューポートサイズの定義
  const viewports = [
    { name: 'モバイル', width: 375, height: 667 },
    { name: 'タブレット', width: 768, height: 1024 },
    { name: 'デスクトップ', width: 1280, height: 720 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test.describe(`${name}ビューポート (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        // ビューポートサイズを設定
        await page.setViewportSize({ width, height });
      });

      test('ホーム画面のレスポンシブ表示をテストする', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ヘッダーが表示されることを確認
        const header = page.locator('header');
        await expect(header).toBeVisible();

        // メインコンテンツが表示されることを確認
        const mainContent = page.locator('main[role="main"]');
        await expect(mainContent).toBeVisible();

        // ボタンが表示されることを確認
        const startButton = page.getByRole('link', { name: /クイズを始める/ });
        const historyButton = page.getByRole('link', { name: /履歴を見る/ });
        await expect(startButton).toBeVisible();
        await expect(historyButton).toBeVisible();

        // 要素がビューポート内に収まっていることを確認
        const startButtonBox = await startButton.boundingBox();
        const historyButtonBox = await historyButton.boundingBox();

        if (startButtonBox && historyButtonBox) {
          expect(startButtonBox.x).toBeGreaterThanOrEqual(0);
          expect(startButtonBox.x + startButtonBox.width).toBeLessThanOrEqual(
            width
          );
          expect(historyButtonBox.x).toBeGreaterThanOrEqual(0);
          expect(
            historyButtonBox.x + historyButtonBox.width
          ).toBeLessThanOrEqual(width);
        }
      });

      test('クイズ画面のレスポンシブ表示をテストする', async ({ page }) => {
        await page.goto('/quiz');
        await page.waitForLoadState('networkidle');

        // 進捗バーが表示されることを確認
        const progressBar = page.locator('[data-testid="question-progress"]');
        await expect(progressBar).toBeVisible();

        // 質問テキストが表示されることを確認
        const questionText = page.locator('[data-testid="question-text"]');
        await expect(questionText).toBeVisible();

        // 選択肢が表示されることを確認
        const options = page.locator('[data-testid="quiz-option"]');
        await expect(options.first()).toBeVisible();

        // 要素がビューポート内に収まっていることを確認
        const questionTextBox = await questionText.boundingBox();
        if (questionTextBox) {
          expect(questionTextBox.x).toBeGreaterThanOrEqual(0);
          expect(questionTextBox.x + questionTextBox.width).toBeLessThanOrEqual(
            width
          );
        }
      });

      test('履歴画面のレスポンシブ表示をテストする', async ({ page }) => {
        await page.goto('/history');
        await page.waitForLoadState('networkidle');

        // ページタイトルが表示されることを確認
        const title = page.getByRole('heading', { name: /クイズ履歴/ });
        await expect(title).toBeVisible();

        // 空状態メッセージまたは履歴テーブルが表示されることを確認
        const emptyMessage = page.getByText('まだクイズに挑戦していません');
        const historyTable = page.locator('[data-testid="history-table"]');

        // どちらか一方が表示されていることを確認
        const isEmptyVisible = await emptyMessage.isVisible();
        const isTableVisible = await historyTable.isVisible();
        expect(isEmptyVisible || isTableVisible).toBeTruthy();

        // 要素がビューポート内に収まっていることを確認
        const titleBox = await title.boundingBox();
        if (titleBox) {
          expect(titleBox.x).toBeGreaterThanOrEqual(0);
          expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(width);
        }
      });
    });
  });

  test.describe('ビューポートサイズ変更時のテスト', () => {
    test('ビューポートサイズ変更時にレイアウトが崩れないことを確認する', async ({
      page,
    }) => {
      // デスクトップサイズで開始
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 初期状態でボタンが表示されることを確認
      const startButton = page.getByRole('link', { name: /クイズを始める/ });
      const historyButton = page.getByRole('link', { name: /履歴を見る/ });
      await expect(startButton).toBeVisible();
      await expect(historyButton).toBeVisible();

      // タブレットサイズに変更
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500); // レイアウト調整を待機

      // ボタンが引き続き表示されることを確認
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
        expect(startButtonBox.x + startButtonBox.width).toBeLessThanOrEqual(
          375
        );
        expect(historyButtonBox.x).toBeGreaterThanOrEqual(0);
        expect(historyButtonBox.x + historyButtonBox.width).toBeLessThanOrEqual(
          375
        );
      }
    });
  });

  test.describe('タッチターゲットサイズテスト', () => {
    test('モバイルでのタッチターゲットサイズをテストする', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // ボタンのタッチターゲットサイズが適切であることを確認（44px以上推奨）
      const startButton = page.getByRole('link', { name: /クイズを始める/ });
      const buttonBox = await startButton.boundingBox();

      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      }

      // クイズ画面でのタッチターゲットテスト
      await page.goto('/quiz');
      await page.waitForLoadState('networkidle');

      const options = page.locator('[data-testid="quiz-option"]');
      const optionCount = await options.count();

      for (let i = 0; i < Math.min(optionCount, 3); i++) {
        const option = options.nth(i);
        const optionBox = await option.boundingBox();

        if (optionBox) {
          expect(optionBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});
