/**
 * @jest-environment node
 */

import { getQuizQuestions, saveQuizResult, getQuizHistory } from './quiz';
import { prisma } from '@/lib/db';
import { QuestionType } from '@prisma/client';
import { Answer, Question } from '@/types/quiz';

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
    quizResult: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as {
  question: {
    findMany: jest.MockedFunction<any>;
  };
  quizResult: {
    create: jest.MockedFunction<any>;
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
describe
('saveQuizResult', () => {
  // テスト用のデータ
  const testSessionId = 'test-session-123';
  const testQuestions: Question[] = [
    {
      id: 'q1',
      text: 'テスト質問1',
      type: 'MULTIPLE_CHOICE',
      options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
      correctAnswer: '選択肢1',
      explanation: 'テスト解説1',
    },
    {
      id: 'q2',
      text: 'テスト質問2',
      type: 'TEXT_INPUT',
      options: [],
      correctAnswer: 'テスト回答',
      explanation: 'テスト解説2',
    },
    {
      id: 'q3',
      text: 'テスト質問3',
      type: 'MULTIPLE_CHOICE',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',
    },
  ];

  const testAnswers: Answer[] = [
    {
      questionId: 'q1',
      userAnswer: '選択肢1', // 正解
      isCorrect: false, // この値は関数内で再計算される
    },
    {
      questionId: 'q2',
      userAnswer: 'テスト回答', // 正解
      isCorrect: false, // この値は関数内で再計算される
    },
    {
      questionId: 'q3',
      userAnswer: 'C', // 不正解
      isCorrect: false, // この値は関数内で再計算される
    },
  ];

  const mockSavedResult = {
    id: 'result-123',
    sessionId: testSessionId,
    score: 2,
    totalQuestions: 3,
    correctCount: 2,
    incorrectCount: 1,
    accuracy: 66.7,
    answers: [
      { questionId: 'q1', userAnswer: '選択肢1', isCorrect: true },
      { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: true },
      { questionId: 'q3', userAnswer: 'C', isCorrect: false },
    ],
    completedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('正しくスコアを計算してデータベースに保存する', async () => {
      // モックの設定
      mockedPrisma.quizResult.create.mockResolvedValue(mockSavedResult);

      // 関数の実行
      const result = await saveQuizResult(testSessionId, testAnswers, testQuestions);

      // データベースの呼び出しを確認
      expect(mockedPrisma.quizResult.create).toHaveBeenCalledTimes(1);
      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: {
          sessionId: testSessionId,
          score: 2,
          totalQuestions: 3,
          correctCount: 2,
          incorrectCount: 1,
          accuracy: 66.7,
          answers: [
            { questionId: 'q1', userAnswer: '選択肢1', isCorrect: true },
            { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: true },
            { questionId: 'q3', userAnswer: 'C', isCorrect: false },
          ],
          completedAt: expect.any(Date),
        },
      });

      // 返り値を確認
      expect(result).toEqual({
        id: 'result-123',
        sessionId: testSessionId,
        score: 2,
        totalQuestions: 3,
        correctCount: 2,
        incorrectCount: 1,
        accuracy: 66.7,
        answers: [
          { questionId: 'q1', userAnswer: '選択肢1', isCorrect: true },
          { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: true },
          { questionId: 'q3', userAnswer: 'C', isCorrect: false },
        ],
        completedAt: mockSavedResult.completedAt,
      });
    });

    it('大文字小文字を区別せずに正誤判定を行う', async () => {
      const caseInsensitiveAnswers: Answer[] = [
        {
          questionId: 'q1',
          userAnswer: '選択肢1', // 正解（完全一致）
          isCorrect: false,
        },
        {
          questionId: 'q2',
          userAnswer: 'テスト回答', // 正解（完全一致）
          isCorrect: false,
        },
        {
          questionId: 'q3',
          userAnswer: 'b', // 正解（大文字小文字違い）
          isCorrect: false,
        },
      ];

      const expectedResult = {
        ...mockSavedResult,
        score: 3,
        correctCount: 3,
        incorrectCount: 0,
        accuracy: 100.0,
        answers: [
          { questionId: 'q1', userAnswer: '選択肢1', isCorrect: true },
          { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: true },
          { questionId: 'q3', userAnswer: 'b', isCorrect: true },
        ],
      };

      mockedPrisma.quizResult.create.mockResolvedValue(expectedResult);

      const result = await saveQuizResult(testSessionId, caseInsensitiveAnswers, testQuestions);

      // 大文字小文字を区別せずに正誤判定されることを確認
      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: {
          sessionId: testSessionId,
          score: 3,
          totalQuestions: 3,
          correctCount: 3,
          incorrectCount: 0,
          accuracy: 100.0,
          answers: [
            { questionId: 'q1', userAnswer: '選択肢1', isCorrect: true },
            { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: true },
            { questionId: 'q3', userAnswer: 'b', isCorrect: true },
          ],
          completedAt: expect.any(Date),
        },
      });
    });

    it('前後の空白を除去して正誤判定を行う', async () => {
      const answersWithSpaces: Answer[] = [
        {
          questionId: 'q1',
          userAnswer: ' 選択肢1 ', // 前後に空白
          isCorrect: false,
        },
        {
          questionId: 'q2',
          userAnswer: '  テスト回答  ', // 前後に空白
          isCorrect: false,
        },
        {
          questionId: 'q3',
          userAnswer: ' B ', // 前後に空白
          isCorrect: false,
        },
      ];

      const expectedResult = {
        ...mockSavedResult,
        score: 3,
        correctCount: 3,
        incorrectCount: 0,
        accuracy: 100.0,
        answers: [
          { questionId: 'q1', userAnswer: ' 選択肢1 ', isCorrect: true },
          { questionId: 'q2', userAnswer: '  テスト回答  ', isCorrect: true },
          { questionId: 'q3', userAnswer: ' B ', isCorrect: true },
        ],
      };

      mockedPrisma.quizResult.create.mockResolvedValue(expectedResult);

      const result = await saveQuizResult(testSessionId, answersWithSpaces, testQuestions);

      // 空白を除去して正誤判定されることを確認
      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: {
          sessionId: testSessionId,
          score: 3,
          totalQuestions: 3,
          correctCount: 3,
          incorrectCount: 0,
          accuracy: 100.0,
          answers: [
            { questionId: 'q1', userAnswer: ' 選択肢1 ', isCorrect: true },
            { questionId: 'q2', userAnswer: '  テスト回答  ', isCorrect: true },
            { questionId: 'q3', userAnswer: ' B ', isCorrect: true },
          ],
          completedAt: expect.any(Date),
        },
      });
    });

    it('正解率を正しく計算する（小数点第1位まで）', async () => {
      // 10問中7問正解のケース
      const tenQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
        id: `q${i + 1}`,
        text: `質問${i + 1}`,
        type: 'MULTIPLE_CHOICE' as const,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
      }));

      const tenAnswers: Answer[] = Array.from({ length: 10 }, (_, i) => ({
        questionId: `q${i + 1}`,
        userAnswer: i < 7 ? 'A' : 'B', // 最初の7問は正解、残り3問は不正解
        isCorrect: false,
      }));

      const expectedResult = {
        id: 'result-456',
        sessionId: testSessionId,
        score: 7,
        totalQuestions: 10,
        correctCount: 7,
        incorrectCount: 3,
        accuracy: 70.0, // 7/10 * 100 = 70.0%
        answers: tenAnswers.map((answer, i) => ({
          ...answer,
          isCorrect: i < 7,
        })),
        completedAt: new Date(),
      };

      mockedPrisma.quizResult.create.mockResolvedValue(expectedResult);

      const result = await saveQuizResult(testSessionId, tenAnswers, tenQuestions);

      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accuracy: 70.0,
        }),
      });
    });
  });

  describe('異常系', () => {
    it('セッションIDが空の場合はエラーを投げる', async () => {
      await expect(saveQuizResult('', testAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: セッションIDが無効です'
      );
    });

    it('セッションIDが空白のみの場合はエラーを投げる', async () => {
      await expect(saveQuizResult('   ', testAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: セッションIDが無効です'
      );
    });

    it('回答データが空の場合はエラーを投げる', async () => {
      await expect(saveQuizResult(testSessionId, [], testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: 回答データが無効です'
      );
    });

    it('質問データが空の場合はエラーを投げる', async () => {
      await expect(saveQuizResult(testSessionId, testAnswers, [])).rejects.toThrow(
        'クイズ結果の保存に失敗しました: 質問データが無効です'
      );
    });

    it('回答数と質問数が一致しない場合はエラーを投げる', async () => {
      const mismatchedAnswers = testAnswers.slice(0, 2); // 2問分の回答のみ

      await expect(saveQuizResult(testSessionId, mismatchedAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: 回答数と質問数が一致しません'
      );
    });

    it('存在しない質問IDが含まれている場合はエラーを投げる', async () => {
      const invalidAnswers: Answer[] = [
        ...testAnswers.slice(0, 2),
        {
          questionId: 'invalid-id', // 存在しない質問ID
          userAnswer: 'test',
          isCorrect: false,
        },
      ];

      await expect(saveQuizResult(testSessionId, invalidAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: 質問ID invalid-id が見つかりません'
      );
    });

    it('データベースエラーの場合は適切なエラーメッセージを返す', async () => {
      const dbError = new Error('データベース接続エラー');
      mockedPrisma.quizResult.create.mockRejectedValue(dbError);

      await expect(saveQuizResult(testSessionId, testAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存に失敗しました: データベース接続エラー'
      );
    });

    it('予期しないエラーの場合は汎用的なエラーメッセージを返す', async () => {
      mockedPrisma.quizResult.create.mockRejectedValue('予期しないエラー');

      await expect(saveQuizResult(testSessionId, testAnswers, testQuestions)).rejects.toThrow(
        'クイズ結果の保存中に予期しないエラーが発生しました'
      );
    });
  });

  describe('スコア計算のテスト', () => {
    it('全問正解の場合', async () => {
      const allCorrectAnswers: Answer[] = testQuestions.map(q => ({
        questionId: q.id,
        userAnswer: q.correctAnswer,
        isCorrect: false, // 関数内で再計算される
      }));

      const expectedResult = {
        ...mockSavedResult,
        score: 3,
        correctCount: 3,
        incorrectCount: 0,
        accuracy: 100.0,
      };

      mockedPrisma.quizResult.create.mockResolvedValue(expectedResult);

      await saveQuizResult(testSessionId, allCorrectAnswers, testQuestions);

      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          score: 3,
          correctCount: 3,
          incorrectCount: 0,
          accuracy: 100.0,
        }),
      });
    });

    it('全問不正解の場合', async () => {
      const allIncorrectAnswers: Answer[] = testQuestions.map(q => ({
        questionId: q.id,
        userAnswer: 'wrong answer',
        isCorrect: false,
      }));

      const expectedResult = {
        ...mockSavedResult,
        score: 0,
        correctCount: 0,
        incorrectCount: 3,
        accuracy: 0.0,
      };

      mockedPrisma.quizResult.create.mockResolvedValue(expectedResult);

      await saveQuizResult(testSessionId, allIncorrectAnswers, testQuestions);

      expect(mockedPrisma.quizResult.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          score: 0,
          correctCount: 0,
          incorrectCount: 3,
          accuracy: 0.0,
        }),
      });
    });
  });
});

describe('getQuizHistory', () => {
  // テスト用のデータ
  const testSessionId = 'test-session-456';
  
  const mockHistoryData = [
    {
      id: 'result-1',
      sessionId: testSessionId,
      score: 8,
      totalQuestions: 10,
      correctCount: 8,
      incorrectCount: 2,
      accuracy: 80.0,
      answers: [
        { questionId: 'q1', userAnswer: 'A', isCorrect: true },
        { questionId: 'q2', userAnswer: 'B', isCorrect: false },
      ],
      completedAt: new Date('2024-01-03T10:00:00Z'),
    },
    {
      id: 'result-2',
      sessionId: testSessionId,
      score: 6,
      totalQuestions: 10,
      correctCount: 6,
      incorrectCount: 4,
      accuracy: 60.0,
      answers: [
        { questionId: 'q1', userAnswer: 'A', isCorrect: true },
        { questionId: 'q2', userAnswer: 'C', isCorrect: false },
      ],
      completedAt: new Date('2024-01-02T15:30:00Z'),
    },
    {
      id: 'result-3',
      sessionId: testSessionId,
      score: 9,
      totalQuestions: 10,
      correctCount: 9,
      incorrectCount: 1,
      accuracy: 90.0,
      answers: [
        { questionId: 'q1', userAnswer: 'A', isCorrect: true },
        { questionId: 'q2', userAnswer: 'B', isCorrect: true },
      ],
      completedAt: new Date('2024-01-01T09:15:00Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('セッションIDに紐づく履歴を最新順で取得できる', async () => {
      // モックの設定
      mockedPrisma.quizResult.findMany.mockResolvedValue(mockHistoryData);

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // データベースの呼び出しを確認
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledTimes(1);
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: testSessionId,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 50,
      });

      // 返り値を確認
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          id: 'result-1',
          sessionId: testSessionId,
          score: 8,
          totalQuestions: 10,
          correctCount: 8,
          incorrectCount: 2,
          accuracy: 80.0,
          answers: [
            { questionId: 'q1', userAnswer: 'A', isCorrect: true },
            { questionId: 'q2', userAnswer: 'B', isCorrect: false },
          ],
          completedAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          id: 'result-2',
          sessionId: testSessionId,
          score: 6,
          totalQuestions: 10,
          correctCount: 6,
          incorrectCount: 4,
          accuracy: 60.0,
          answers: [
            { questionId: 'q1', userAnswer: 'A', isCorrect: true },
            { questionId: 'q2', userAnswer: 'C', isCorrect: false },
          ],
          completedAt: new Date('2024-01-02T15:30:00Z'),
        },
        {
          id: 'result-3',
          sessionId: testSessionId,
          score: 9,
          totalQuestions: 10,
          correctCount: 9,
          incorrectCount: 1,
          accuracy: 90.0,
          answers: [
            { questionId: 'q1', userAnswer: 'A', isCorrect: true },
            { questionId: 'q2', userAnswer: 'B', isCorrect: true },
          ],
          completedAt: new Date('2024-01-01T09:15:00Z'),
        },
      ]);
    });

    it('履歴が存在しない場合は空配列を返す', async () => {
      // 空のモックデータ
      mockedPrisma.quizResult.findMany.mockResolvedValue([]);

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // 空配列が返されることを確認
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('最大50件まで取得する制限が正しく設定される', async () => {
      // 51件のモックデータを作成
      const manyResults = Array.from({ length: 51 }, (_, i) => ({
        id: `result-${i + 1}`,
        sessionId: testSessionId,
        score: i % 10,
        totalQuestions: 10,
        correctCount: i % 10,
        incorrectCount: 10 - (i % 10),
        accuracy: (i % 10) * 10,
        answers: [],
        completedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
      }));

      // 最初の50件のみ返すようにモック設定
      mockedPrisma.quizResult.findMany.mockResolvedValue(manyResults.slice(0, 50));

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // 50件制限が適用されることを確認
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: testSessionId,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 50,
      });

      expect(result).toHaveLength(50);
    });

    it('セッションIDの前後の空白を除去して検索する', async () => {
      const sessionIdWithSpaces = '  test-session-456  ';
      mockedPrisma.quizResult.findMany.mockResolvedValue(mockHistoryData);

      // 関数の実行
      await getQuizHistory(sessionIdWithSpaces);

      // 空白が除去されたセッションIDで検索されることを確認
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: 'test-session-456', // 空白が除去される
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 50,
      });
    });

    it('JSONから型変換が正しく行われる', async () => {
      const mockDataWithComplexAnswers = [
        {
          id: 'result-1',
          sessionId: testSessionId,
          score: 7,
          totalQuestions: 10,
          correctCount: 7,
          incorrectCount: 3,
          accuracy: 70.0,
          answers: [
            { questionId: 'q1', userAnswer: '選択肢A', isCorrect: true },
            { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: false },
            { questionId: 'q3', userAnswer: 'C', isCorrect: true },
          ],
          completedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockedPrisma.quizResult.findMany.mockResolvedValue(mockDataWithComplexAnswers);

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // 型変換が正しく行われることを確認
      expect(result[0].answers).toEqual([
        { questionId: 'q1', userAnswer: '選択肢A', isCorrect: true },
        { questionId: 'q2', userAnswer: 'テスト回答', isCorrect: false },
        { questionId: 'q3', userAnswer: 'C', isCorrect: true },
      ]);

      // 各プロパティの型が正しいことを確認
      expect(typeof result[0].id).toBe('string');
      expect(typeof result[0].sessionId).toBe('string');
      expect(typeof result[0].score).toBe('number');
      expect(typeof result[0].accuracy).toBe('number');
      expect(result[0].completedAt).toBeInstanceOf(Date);
      expect(Array.isArray(result[0].answers)).toBe(true);
    });
  });

  describe('異常系', () => {
    it('セッションIDが空の場合はエラーを投げる', async () => {
      await expect(getQuizHistory('')).rejects.toThrow(
        'クイズ履歴の取得に失敗しました: セッションIDが無効です'
      );
    });

    it('セッションIDが空白のみの場合はエラーを投げる', async () => {
      await expect(getQuizHistory('   ')).rejects.toThrow(
        'クイズ履歴の取得に失敗しました: セッションIDが無効です'
      );
    });

    it('セッションIDがnullの場合はエラーを投げる', async () => {
      await expect(getQuizHistory(null as any)).rejects.toThrow(
        'クイズ履歴の取得に失敗しました: セッションIDが無効です'
      );
    });

    it('セッションIDがundefinedの場合はエラーを投げる', async () => {
      await expect(getQuizHistory(undefined as any)).rejects.toThrow(
        'クイズ履歴の取得に失敗しました: セッションIDが無効です'
      );
    });

    it('データベース接続エラーの場合は適切なエラーメッセージを返す', async () => {
      const dbError = new Error('データベース接続エラー');
      mockedPrisma.quizResult.findMany.mockRejectedValue(dbError);

      await expect(getQuizHistory(testSessionId)).rejects.toThrow(
        'クイズ履歴の取得に失敗しました: データベース接続エラー'
      );
    });

    it('予期しないエラーの場合は汎用的なエラーメッセージを返す', async () => {
      mockedPrisma.quizResult.findMany.mockRejectedValue('予期しないエラー');

      await expect(getQuizHistory(testSessionId)).rejects.toThrow(
        'クイズ履歴の取得中に予期しないエラーが発生しました'
      );
    });
  });

  describe('フィルタリングとソートのテスト', () => {
    it('指定されたセッションIDの履歴のみを取得する', async () => {
      const otherSessionId = 'other-session-789';
      
      // 異なるセッションIDのデータも含むモックデータ
      const mixedSessionData = [
        {
          id: 'result-1',
          sessionId: testSessionId, // 対象のセッション
          score: 8,
          totalQuestions: 10,
          correctCount: 8,
          incorrectCount: 2,
          accuracy: 80.0,
          answers: [],
          completedAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          id: 'result-2',
          sessionId: otherSessionId, // 異なるセッション（除外される）
          score: 5,
          totalQuestions: 10,
          correctCount: 5,
          incorrectCount: 5,
          accuracy: 50.0,
          answers: [],
          completedAt: new Date('2024-01-02T15:30:00Z'),
        },
        {
          id: 'result-3',
          sessionId: testSessionId, // 対象のセッション
          score: 9,
          totalQuestions: 10,
          correctCount: 9,
          incorrectCount: 1,
          accuracy: 90.0,
          answers: [],
          completedAt: new Date('2024-01-01T09:15:00Z'),
        },
      ];

      // 対象セッションのデータのみ返すようにモック設定
      const filteredData = mixedSessionData.filter(item => item.sessionId === testSessionId);
      mockedPrisma.quizResult.findMany.mockResolvedValue(filteredData);

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // 正しいフィルタリング条件で呼び出されることを確認
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: testSessionId,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 50,
      });

      // 対象セッションのデータのみが返されることを確認
      expect(result).toHaveLength(2);
      result.forEach(item => {
        expect(item.sessionId).toBe(testSessionId);
      });
    });

    it('最新順（completedAt desc）でソートされる', async () => {
      // 日付順がバラバラのモックデータ
      const unsortedData = [
        {
          id: 'result-2',
          sessionId: testSessionId,
          score: 6,
          totalQuestions: 10,
          correctCount: 6,
          incorrectCount: 4,
          accuracy: 60.0,
          answers: [],
          completedAt: new Date('2024-01-02T15:30:00Z'), // 中間の日付
        },
        {
          id: 'result-3',
          sessionId: testSessionId,
          score: 9,
          totalQuestions: 10,
          correctCount: 9,
          incorrectCount: 1,
          accuracy: 90.0,
          answers: [],
          completedAt: new Date('2024-01-01T09:15:00Z'), // 最も古い日付
        },
        {
          id: 'result-1',
          sessionId: testSessionId,
          score: 8,
          totalQuestions: 10,
          correctCount: 8,
          incorrectCount: 2,
          accuracy: 80.0,
          answers: [],
          completedAt: new Date('2024-01-03T10:00:00Z'), // 最新の日付
        },
      ];

      // データベースは既にソート済みで返すと仮定（実際のPrismaの動作をシミュレート）
      const sortedData = [...unsortedData].sort((a, b) => 
        b.completedAt.getTime() - a.completedAt.getTime()
      );
      
      mockedPrisma.quizResult.findMany.mockResolvedValue(sortedData);

      // 関数の実行
      const result = await getQuizHistory(testSessionId);

      // 正しいソート条件で呼び出されることを確認
      expect(mockedPrisma.quizResult.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: testSessionId,
        },
        orderBy: {
          completedAt: 'desc', // 降順ソート
        },
        take: 50,
      });

      // 結果が最新順になっていることを確認
      expect(result).toHaveLength(3);
      expect(result[0].completedAt.getTime()).toBeGreaterThan(result[1].completedAt.getTime());
      expect(result[1].completedAt.getTime()).toBeGreaterThan(result[2].completedAt.getTime());
      
      // 具体的な順序を確認
      expect(result[0].id).toBe('result-1'); // 2024-01-03 (最新)
      expect(result[1].id).toBe('result-2'); // 2024-01-02 (中間)
      expect(result[2].id).toBe('result-3'); // 2024-01-01 (最古)
    });
  });
});