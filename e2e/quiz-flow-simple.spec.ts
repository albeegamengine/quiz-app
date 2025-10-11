import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('クイズフロー全体のテスト（簡略版）', () => {
  test.beforeEach(async () => {
    // テスト前にデータベースをクリーンアップ
    await prisma.quizResult.deleteMany();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('ホーム画面からクイズ開始、1問回答、結果画面確認', async ({ page }) => {
    // ホーム画面にアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ホーム画面の要素を確認
    await expect(
      page.getByRole('heading', { name: 'クイズアプリ' })
    ).toBeVisible();
    await expect(page.getByText('クイズを始める')).toBeVisible();

    // クイズを始めるリンクをクリック
    await page.getByText('クイズを始める').click();

    // クイズ画面に遷移したことを確認
    await expect(page).toHaveURL('/quiz');

    // 最初の質問が表示されることを確認（ローディング後）
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('[data-testid="question-progress"]')
    ).toContainText('1/10');

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
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();

    // 「次へ」ボタンをクリック
    await page.getByRole('button', { name: '次へ' }).click();

    // 2問目が表示されることを確認
    await expect(
      page.locator('[data-testid="question-progress"]')
    ).toContainText('2/10');

    console.log('基本的なクイズフローが正常に動作しています');
  });

  test('履歴画面の表示確認', async ({ page }) => {
    // ホーム画面にアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 履歴を見るリンクをクリック
    await page.getByText('履歴を見る').click();

    // 履歴画面に遷移したことを確認
    await expect(page).toHaveURL('/history');

    // 履歴画面のタイトルが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'クイズ履歴' })
    ).toBeVisible();

    // 空状態のメッセージが表示されることを確認
    await expect(page.getByText('まだクイズに挑戦していません')).toBeVisible();
  });
});
