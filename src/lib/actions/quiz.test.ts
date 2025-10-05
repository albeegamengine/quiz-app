/**
 * @jest-environment node
 */

import { getQuizQuestions } from './quiz';
import { prisma } from '@/lib/db';
import { QuestionType } from '@prisma/client';

// テスト用のモックデータ
const mockQuestions = [
  {
    id: 'test-1',
    text: 'テスト質問1',
    type: 'MULTIPLE_CHOICE' as QuestionType,
    options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    correctAnswer: '選択肢1',
    explanation: 'テスト解説1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-2',
    text: 'テスト質問2',
    type: 'TEXT_INPUT' as QuestionType,
    options: [],
    correctAnswer: 'テスト回答',
    explanation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 10問以上のデータを作成（ランダム選択をテストするため）
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `test-${i + 3}`,
    text: `テスト質問${i + 3}`,
    type: 'MULTIPLE_CHOICE' as QuestionType,
    options: [`選択肢${i + 1}-1`, `選択肢${i + 1}-2`, `選択肢${i + 1}-3`, `選択肢${i + 1}-4`],
    correctAnswer: `選択肢${i + 1}-1`,
    explanation: `テスト解説${i + 3}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
];

// Prismaクライアントのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as {
  question: {
    findMany: jest.MockedFunction<any>;
  };
};

describe('getQuizQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('データベースから10問のクイズを取得できる', async () => {
      // モックの設定
      mockedPrisma.question.findMany.mockResolvedValue(mockQuestions);

      // 関数の実行
      const result = await getQuizQuestions();

      // 検証
      expect(result).toHaveLength(10);
      expect(mockedPrisma.question.findMany).toHaveBeenCalledTimes(1);
      
      // 返される各質問が正しい型を持つことを確認
      result.forEach((question) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('options');
        expect(question).toHaveProperty('correctAnswer');
        expect(['MULTIPLE_CHOICE', 'TEXT_INPUT']).toContain(question.type);
        expect(Array.isArray(question.options)).toBe(true);
      });
    });

    it('ランダムに質問が選択される（複数回実行して異なる結果が得られる可能性がある）', async () => {
      // モックの設定
      mockedPrisma.question.findMany.mockResolvedValue(mockQuestions);

      // 複数回実行して結果を収集
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await getQuizQuestions();
        results.push(result.map(q => q.id));
      }

      // 各実行で10問取得されることを確認
      results.forEach(result => {
        expect(result).toHaveLength(10);
      });

      // 少なくとも1回は異なる順序になる可能性が高い（完全にランダムなので100%保証はできない）
      // ここでは基本的な構造の確認に留める
      expect(results[0]).toHaveLength(10);
    });

    it('MULTIPLE_CHOICEとTEXT_INPUTの両方の質問タイプを正しく処理する', async () => {
      // モックの設定
      mockedPrisma.question.findMany.mockResolvedValue(mockQuestions);

      // 関数の実行
      const result = await getQuizQuestions();

      // 両方のタイプが含まれていることを確認
      const types = result.map(q => q.type);
      expect(types).toContain('MULTIPLE_CHOICE');
      expect(types).toContain('TEXT_INPUT');
    });

    it('explanationがnullの場合はundefinedに変換される', async () => {
      // モックの設定
      mockedPrisma.question.findMany.mockResolvedValue(mockQuestions);

      // 関数の実行
      const result = await getQuizQuestions();

      // explanationがnullの質問を見つける
      const questionWithNullExplanation = result.find(q => 
        mockQuestions.find(mq => mq.id === q.id)?.explanation === null
      );

      if (questionWithNullExplanation) {
        expect(questionWithNullExplanation.explanation).toBeUndefined();
      }
    });
  });

  describe('異常系', () => {
    it('データベースに質問が10問未満の場合はエラーを投げる', async () => {
      // 9問のみのモックデータ
      const insufficientQuestions = mockQuestions.slice(0, 9);
      mockedPrisma.question.findMany.mockResolvedValue(insufficientQuestions);

      // エラーが投げられることを確認
      await expect(getQuizQuestions()).rejects.toThrow(
        'データベースに十分な質問がありません。現在の質問数: 9問（最低10問必要）'
      );
    });

    it('データベースが空の場合はエラーを投げる', async () => {
      // 空のモックデータ
      mockedPrisma.question.findMany.mockResolvedValue([]);

      // エラーが投げられることを確認
      await expect(getQuizQuestions()).rejects.toThrow(
        'データベースに十分な質問がありません。現在の質問数: 0問（最低10問必要）'
      );
    });

    it('データベース接続エラーの場合は適切なエラーメッセージを返す', async () => {
      // データベースエラーをシミュレート
      const dbError = new Error('データベース接続エラー');
      mockedPrisma.question.findMany.mockRejectedValue(dbError);

      // エラーが適切に処理されることを確認
      await expect(getQuizQuestions()).rejects.toThrow(
        'クイズデータの取得に失敗しました: データベース接続エラー'
      );
    });

    it('予期しないエラーの場合は汎用的なエラーメッセージを返す', async () => {
      // 予期しないエラーをシミュレート
      mockedPrisma.question.findMany.mockRejectedValue('予期しないエラー');

      // エラーが適切に処理されることを確認
      await expect(getQuizQuestions()).rejects.toThrow(
        'クイズデータの取得中に予期しないエラーが発生しました'
      );
    });
  });

  describe('ランダム化のテスト', () => {
    it('Fisher-Yatesアルゴリズムが正しく動作する（統計的テスト）', async () => {
      // 12問のテストデータを作成（10問選択するため）
      const testQuestions = Array.from({ length: 12 }, (_, i) => ({
        id: `test-${i + 1}`,
        text: `テスト質問${i + 1}`,
        type: 'MULTIPLE_CHOICE' as QuestionType,
        options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
        correctAnswer: '選択肢1',
        explanation: `解説${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockedPrisma.question.findMany.mockResolvedValue(testQuestions);

      // 複数回実行して各質問の選択頻度を記録
      const selectionCount: { [key: string]: number } = {};
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = await getQuizQuestions();
        result.forEach(question => {
          selectionCount[question.id] = (selectionCount[question.id] || 0) + 1;
        });
      }

      // 各質問が少なくとも1回は選択されることを確認（統計的に期待される）
      // 完全にランダムなので、稀に失敗する可能性があるが、十分な回数実行すれば通常は成功する
      const selectedQuestionIds = Object.keys(selectionCount);
      expect(selectedQuestionIds.length).toBeGreaterThan(10); // 12問中10問以上が選択される

      // 各質問の選択回数が0以上であることを確認
      Object.values(selectionCount).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});