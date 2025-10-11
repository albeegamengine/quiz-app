import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('クイズフロー全体のテスト', () => {
  test.beforeEach(async () => {
    // テスト前にデータベースをクリーンアップ
    await prisma.quizResult.deleteMany();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('ホーム画面からクイズ開始、全問回答、結果画面確認、スコア保存の一連のフロー', async ({
    page,
  }) => {
    // ホーム画面にアクセス
    await page.goto('/');

    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');

    // ホーム画面の要素を確認
    await expect(
      page.getByRole('heading', { name: 'クイズアプリ' })
    ).toBeVisible();
    await expect(page.getByText('クイズを始める')).toBeVisible();
    await expect(page.getByText('履歴を見る')).toBeVisible();

    // クイズを始めるリンクをクリック
    await page.getByText('クイズを始める').click();

    // クイズ画面に遷移したことを確認
    await expect(page).toHaveURL('/quiz');

    // 最初の質問が表示されることを確認
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="question-progress"]')
    ).toContainText('1/10');

    // 全10問に回答する
    for (let i = 1; i <= 10; i++) {
      // 進捗表示を確認
      await expect(
        page.locator('[data-testid="question-progress"]')
      ).toContainText(`${i}/10`);

      // 質問が表示されていることを確認
      await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

      // 質問のタイプを確認して適切に回答
      const questionType = await page
        .locator('[data-testid="question-type"]')
        .textContent();

      if (questionType === 'MULTIPLE_CHOICE') {
        // 複数選択式の場合：最初の選択肢を選択
        const firstOption = page.locator('[data-testid="quiz-option"]').first();
        await firstOption.click();
      } else if (questionType === 'TEXT_INPUT') {
        // 入力式の場合：テキストを入力
        const input = page.locator('[data-testid="text-input"]');
        await input.fill('テスト回答');
      }

      // 回答後にフィードバックが表示されることを確認
      await expect(
        page.locator('[data-testid="answer-feedback"]')
      ).toBeVisible();

      if (i < 10) {
        // 最後の問題でない場合は「次へ」ボタンをクリック
        await page.getByRole('button', { name: '次へ' }).click();
      } else {
        // 最後の問題の場合は「結果を見る」ボタンをクリック
        await page.getByRole('button', { name: '結果を見る' }).click();
      }
    }

    // 結果画面に遷移したことを確認
    await expect(page).toHaveURL('/result');

    // 結果画面の要素を確認
    await expect(page.locator('[data-testid="score-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="correct-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="incorrect-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy"]')).toBeVisible();

    // 詳細結果テーブルが表示されることを確認
    await expect(page.locator('[data-testid="result-table"]')).toBeVisible();

    // 「もう一度挑戦」と「ホームに戻る」ボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'もう一度挑戦' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'ホームに戻る' })
    ).toBeVisible();

    // データベースにスコアが保存されていることを確認
    const savedResults = await prisma.quizResult.findMany();
    expect(savedResults).toHaveLength(1);

    const result = savedResults[0];
    expect(result.totalQuestions).toBe(10);
    expect(result.correctCount + result.incorrectCount).toBe(10);
    expect(result.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.accuracy).toBeLessThanOrEqual(100);
    expect(result.sessionId).toBeTruthy();
    expect(result.completedAt).toBeInstanceOf(Date);

    // 回答詳細が保存されていることを確認
    const answers = result.answers as any[];
    expect(answers).toHaveLength(10);

    answers.forEach((answer, index) => {
      expect(answer).toHaveProperty('questionId');
      expect(answer).toHaveProperty('userAnswer');
      expect(answer).toHaveProperty('isCorrect');
      expect(typeof answer.isCorrect).toBe('boolean');
    });

    // ホームに戻るボタンをクリック
    await page.getByRole('button', { name: 'ホームに戻る' }).click();

    // ホーム画面に戻ったことを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('クイズアプリ');
  });

  test('履歴画面でスコアが表示されることを確認', async ({ page }) => {
    // まずクイズを1回完了させる（上記のテストと同様の流れ）
    await page.goto('/');
    await page.getByRole('button', { name: 'クイズを始める' }).click();

    // 簡単に全問回答（詳細は省略）
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

    // 結果画面からホームに戻る
    await page.getByRole('button', { name: 'ホームに戻る' }).click();

    // 履歴を見るリンクをクリック
    await page.getByText('履歴を見る').click();

    // 履歴画面に遷移したことを確認
    await expect(page).toHaveURL('/history');

    // 履歴テーブルが表示されることを確認
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();

    // 少なくとも1つの履歴レコードが表示されることを確認
    await expect(page.locator('[data-testid="history-row"]')).toHaveCount(1);

    // 履歴の詳細が表示されることを確認
    await expect(page.locator('[data-testid="history-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-score"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="history-accuracy"]')
    ).toBeVisible();
  });

  test('エラーハンドリング: データベース接続エラー時の表示', async ({
    page,
  }) => {
    // データベース接続を一時的に無効にするためのモック
    // 実際の実装では、環境変数やモックを使用してエラー状態をシミュレート

    // 無効なURLでアクセスしてエラー状態をテスト
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/quiz');

    // エラーメッセージまたはエラー画面が表示されることを確認
    // 実際の実装に応じて調整が必要
    await expect(page.locator('text=エラーが発生しました')).toBeVisible({
      timeout: 10000,
    });
  });
});
