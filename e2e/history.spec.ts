import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('履歴機能のテスト', () => {
  test.beforeEach(async () => {
    // テスト前にデータベースをクリーンアップ
    await prisma.quizResult.deleteMany();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('履歴ページへの遷移をテストする', async ({ page }) => {
    // ホーム画面にアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 「履歴を見る」リンクをクリック
    await page.click('a[href="/history"]');

    // 履歴画面に遷移したことを確認
    await expect(page).toHaveURL('/history');

    // 履歴画面のタイトルが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'クイズ履歴' })
    ).toBeVisible();
  });

  test('空状態のメッセージが表示されることを確認する', async ({ page }) => {
    // 履歴画面に直接アクセス
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // 空状態のメッセージが表示されることを確認
    await expect(page.getByText('まだクイズに挑戦していません')).toBeVisible();
  });

  test('過去の結果が表示されることを確認する', async ({ page }) => {
    // データベースに直接テストデータを挿入
    const sessionId = 'test-session-123';
    await prisma.quizResult.create({
      data: {
        sessionId: sessionId,
        score: 8,
        totalQuestions: 10,
        correctCount: 8,
        incorrectCount: 2,
        accuracy: 80.0,
        answers: [
          { questionId: 'q1', userAnswer: 'A', isCorrect: true },
          { questionId: 'q2', userAnswer: 'B', isCorrect: false },
        ],
        completedAt: new Date(),
      },
    });

    // 履歴画面にアクセス
    await page.goto('/history');

    // セッションIDをlocalStorageに設定
    await page.evaluate((sessionId) => {
      localStorage.setItem('quiz-session-id', sessionId);
    }, sessionId);

    // ページをリロードして履歴を表示
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 履歴テーブルが表示されることを確認
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();

    // 履歴レコードが表示されることを確認
    await expect(page.locator('[data-testid="history-row"]')).toHaveCount(1);
  });
});
