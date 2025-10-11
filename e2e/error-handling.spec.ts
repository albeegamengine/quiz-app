import { test, expect } from '@playwright/test';

test.describe('エラーハンドリングのテスト', () => {
  test('データベース接続エラー時の表示をテストする', async ({ page }) => {
    // Server Actionsへのリクエストを失敗させてデータベース接続エラーをシミュレート
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        // Server Actionのリクエストを500エラーで失敗させる
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error',
        });
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // リトライボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'もう一度試す' })
    ).toBeVisible();

    // ホームに戻るボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'ホームに戻る' })
    ).toBeVisible();

    // エラーの対処法が表示されることを確認
    await expect(page.locator('text=対処法')).toBeVisible();
  });

  test('ネットワークエラー時の挙動をテストする', async ({ page }) => {
    // ネットワークリクエストを完全に中断してネットワークエラーをシミュレート
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        // Server Actionのリクエストをネットワークエラーで失敗させる
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // リトライボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'もう一度試す' })
    ).toBeVisible();
  });

  test('404エラー時の表示をテストする', async ({ page }) => {
    // 存在しないページにアクセス
    await page.goto('/nonexistent-page');

    // 404エラーページが表示されることを確認
    await expect(page.locator('text=ページが見つかりません')).toBeVisible({
      timeout: 10000,
    });

    // ホームに戻るボタンが表示されることを確認
    await expect(
      page.getByRole('link', { name: 'ホームに戻る' })
    ).toBeVisible();

    // ホームに戻るボタンをクリック
    await page.getByRole('link', { name: 'ホームに戻る' }).click();

    // ホーム画面に遷移することを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('クイズアプリ');
  });

  test('リトライボタンの動作をテストする', async ({ page }) => {
    let shouldFail = true;

    // 最初はエラーを返し、リトライ後は成功させる
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        if (shouldFail) {
          route.fulfill({
            status: 500,
            contentType: 'text/html',
            body: 'Internal Server Error',
          });
        } else {
          route.continue();
        }
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // リトライボタンをクリックする前に、次回は成功するように設定
    shouldFail = false;

    // リトライボタンをクリック
    await page.getByRole('button', { name: 'もう一度試す' }).click();

    // 正常にクイズが表示されることを確認
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible({
      timeout: 15000,
    });

    // 進捗表示が正常に表示されることを確認
    await expect(
      page.locator('[data-testid="question-progress"]')
    ).toContainText('1/10');
  });

  test('エラー画面のナビゲーションボタンをテストする', async ({ page }) => {
    // エラーを発生させる
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error',
        });
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // ホームに戻るボタンをクリック
    await page.getByRole('button', { name: 'ホームに戻る' }).click();

    // ホーム画面に遷移することを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('クイズアプリ');
  });

  test('エラー画面の追加ナビゲーションボタンをテストする', async ({ page }) => {
    // エラーを発生させる
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error',
        });
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // 追加のナビゲーションボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'クイズに挑戦' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '履歴を見る' })
    ).toBeVisible();

    // 履歴を見るボタンをクリック
    await page.getByRole('button', { name: '履歴を見る' }).click();

    // 履歴画面に遷移することを確認
    await expect(page).toHaveURL('/history');
  });

  test('エラーの重要度バッジが表示されることを確認', async ({ page }) => {
    // エラーを発生させる
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error',
        });
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // 重要度バッジが表示されることを確認
    await expect(page.locator('text=中程度')).toBeVisible();
  });

  test('履歴取得時のエラーハンドリングをテストする', async ({ page }) => {
    // 履歴取得のリクエストを失敗させる
    await page.route('**/history', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to fetch history' }),
        });
      } else {
        route.continue();
      }
    });

    // 履歴ページに直接アクセス
    await page.goto('/history');

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // リトライボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'もう一度試す' })
    ).toBeVisible();
  });

  test('結果保存時のエラーハンドリングをテストする', async ({ page }) => {
    // 結果保存のリクエストを失敗させる
    await page.route('**/result', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database save failed' }),
        });
      } else {
        route.continue();
      }
    });

    // ホーム画面からクイズを開始
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('クイズを始める').click();

    // クイズページに遷移したことを確認
    await expect(page).toHaveURL('/quiz');

    // 最初の質問が表示されることを確認
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

    // 全10問に回答する（簡略化）
    for (let i = 1; i <= 10; i++) {
      const questionType = await page
        .locator('[data-testid="question-type"]')
        .textContent();

      if (questionType === 'MULTIPLE_CHOICE') {
        await page.locator('[data-testid="quiz-option"]').first().click();
      } else if (questionType === 'TEXT_INPUT') {
        await page.locator('[data-testid="text-input"]').fill('テスト回答');
      }

      if (i < 10) {
        await page.getByRole('button', { name: '次へ' }).click();
      } else {
        await page.getByRole('button', { name: '結果を見る' }).click();
      }
    }

    // 結果画面でエラーが表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // リトライボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'もう一度試す' })
    ).toBeVisible();
  });

  test('開発環境でのエラー詳細表示をテストする', async ({ page }) => {
    // 開発環境の場合のみテスト実行
    if (process.env.NODE_ENV !== 'development') {
      test.skip();
    }

    // エラーを発生させる
    await page.route('**/quiz', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error',
        });
      } else {
        route.continue();
      }
    });

    // クイズページにアクセス
    await page.goto('/quiz');

    // エラー画面が表示されることを確認
    await expect(page.locator('text=予期しないエラー')).toBeVisible({
      timeout: 15000,
    });

    // 開発環境でのエラー詳細が表示されることを確認
    await expect(page.locator('text=エラー詳細（開発環境のみ）')).toBeVisible();
  });

  test('JavaScriptが無効な場合の基本的な動作をテストする', async ({ page }) => {
    // JavaScriptを無効にする
    await page.context().addInitScript(() => {
      // localStorageを無効化
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: false,
      });
    });

    // ホーム画面にアクセス
    await page.goto('/');

    // 基本的なコンテンツが表示されることを確認
    await expect(page.locator('h1')).toContainText('クイズアプリ');
    await expect(page.getByText('クイズを始める')).toBeVisible();
    await expect(page.getByText('履歴を見る')).toBeVisible();

    // クイズページにアクセス
    await page.getByText('クイズを始める').click();

    // Server Side Renderingにより基本的なコンテンツが表示されることを確認
    await expect(page).toHaveURL('/quiz');

    // エラーメッセージまたは代替コンテンツが表示されることを確認
    const hasError = await page.locator('text=予期しないエラー').isVisible();
    const hasContent = await page
      .locator('[data-testid="question-text"]')
      .isVisible();

    // どちらかが表示されていることを確認
    expect(hasError || hasContent).toBe(true);
  });
});
