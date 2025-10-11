/**
 * @jest-environment node
 */

import { getQuizQuestions, saveQuizResult, getQuizHistory } from './quiz';
import { DatabaseError, ValidationError, InsufficientDataError } from '@/lib/errors';
import { Question, Answer } from '@/types/quiz';

// Prismaクライアントをモック
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

// mockPrismaは削除（使用されていないため）

describe('Quiz Actions Error Handling', () => {
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    // コンソールログをモック
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('getQuizQuestions', () => {
    it('データベースに十分な質問がない場合、InsufficientDataErrorを投げる', async () => {
      // 5問しかない状態をモック
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.question.findMany.mockResolvedValue([
        { id: '1', text: 'Q1', type: 'MULTIPLE_CHOICE', options: ['A', 'B'], correctAnswer: 'A', explanation: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', text: 'Q2', type: 'MULTIPLE_CHOICE', options: ['A', 'B'], correctAnswer: 'B', explanation: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', text: 'Q3', type: 'TEXT_INPUT', options: [], correctAnswer: 'answer', explanation: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', text: 'Q4', type: 'MULTIPLE_CHOICE', options: ['A', 'B'], correctAnswer: 'A', explanation: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '5', text: 'Q5', type: 'TEXT_INPUT', options: [], correctAnswer: 'test', explanation: null, createdAt: new Date(), updatedAt: new Date() },
      ]);

      await expect(getQuizQuestions()).rejects.toThrow(InsufficientDataError);
      await expect(getQuizQuestions()).rejects.toThrow('データベースに十分な質問がありません');
    });

    it('データベース接続エラーの場合、DatabaseErrorを投げる', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.question.findMany.mockRejectedValue({
        code: 'P1001',
        message: 'Can\'t reach database server'
      });

      await expect(getQuizQuestions()).rejects.toThrow(DatabaseError);
      await expect(getQuizQuestions()).rejects.toThrow('データベースサーバーに接続できません');
    });

    it('予期しないエラーの場合、DatabaseErrorを投げる', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.question.findMany.mockRejectedValue(new Error('Unexpected error'));

      await expect(getQuizQuestions()).rejects.toThrow(DatabaseError);
      await expect(getQuizQuestions()).rejects.toThrow('クイズデータの取得に失敗しました');
    });

    it('正常に10問以上ある場合、10問を返す', async () => {
      const mockQuestions = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        text: `Question ${i + 1}`,
        type: 'MULTIPLE_CHOICE' as const,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await getQuizQuestions();
      expect(result).toHaveLength(10);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('type');
    });
  });

  describe('saveQuizResult', () => {
    const mockQuestions: Question[] = [
      { id: '1', text: 'Q1', type: 'MULTIPLE_CHOICE', options: ['A', 'B'], correctAnswer: 'A' },
      { id: '2', text: 'Q2', type: 'TEXT_INPUT', options: [], correctAnswer: 'test' },
    ];

    const mockAnswers: Answer[] = [
      { questionId: '1', userAnswer: 'A', isCorrect: true },
      { questionId: '2', userAnswer: 'test', isCorrect: true },
    ];

    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('無効なセッションIDの場合、ValidationErrorを投げる', async () => {
      await expect(saveQuizResult('', mockAnswers, mockQuestions)).rejects.toThrow(ValidationError);
      await expect(saveQuizResult('   ', mockAnswers, mockQuestions)).rejects.toThrow(ValidationError);
      await expect(saveQuizResult('', mockAnswers, mockQuestions)).rejects.toThrow('セッションIDが無効です');
    });

    it('無効な回答データの場合、ValidationErrorを投げる', async () => {
      await expect(saveQuizResult(validUuid, [], mockQuestions)).rejects.toThrow(ValidationError);
      await expect(saveQuizResult(validUuid, [], mockQuestions)).rejects.toThrow('回答データが無効です');
    });

    it('無効な質問データの場合、ValidationErrorを投げる', async () => {
      await expect(saveQuizResult(validUuid, mockAnswers, [])).rejects.toThrow(ValidationError);
      await expect(saveQuizResult(validUuid, mockAnswers, [])).rejects.toThrow('質問データが無効です');
    });

    it('回答数と質問数が一致しない場合、ValidationErrorを投げる', async () => {
      const mismatchedAnswers = [mockAnswers[0]]; // 1つだけ
      await expect(saveQuizResult(validUuid, mismatchedAnswers, mockQuestions)).rejects.toThrow(ValidationError);
      await expect(saveQuizResult(validUuid, mismatchedAnswers, mockQuestions)).rejects.toThrow('回答数と質問数が一致しません');
    });

    it('存在しない質問IDの場合、ValidationErrorを投げる', async () => {
      const invalidAnswers: Answer[] = [
        { questionId: 'invalid-id', userAnswer: 'A', isCorrect: false },
        { questionId: '2', userAnswer: 'test', isCorrect: true },
      ];

      await expect(saveQuizResult(validUuid, invalidAnswers, mockQuestions)).rejects.toThrow(ValidationError);
      await expect(saveQuizResult(validUuid, invalidAnswers, mockQuestions)).rejects.toThrow('質問ID invalid-id が見つかりません');
    });

    it('データベースエラーの場合、DatabaseErrorを投げる', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.quizResult.create.mockRejectedValue({
        code: 'P1001',
        message: 'Can\'t reach database server'
      });

      await expect(saveQuizResult(validUuid, mockAnswers, mockQuestions)).rejects.toThrow(DatabaseError);
      await expect(saveQuizResult(validUuid, mockAnswers, mockQuestions)).rejects.toThrow('データベースサーバーに接続できません');
    });

    it('正常な場合、結果を保存して返す', async () => {
      const mockSavedResult = {
        id: 'result-123',
        sessionId: validUuid,
        score: 2,
        totalQuestions: 2,
        correctCount: 2,
        incorrectCount: 0,
        accuracy: 100.0,
        answers: mockAnswers,
        completedAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma.quizResult.create.mockResolvedValue(mockSavedResult as any);

      const result = await saveQuizResult(validUuid, mockAnswers, mockQuestions);
      
      expect(result.score).toBe(2);
      expect(result.correctCount).toBe(2);
      expect(result.accuracy).toBe(100.0);
      expect(prisma.quizResult.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sessionId: validUuid,
          score: 2,
          totalQuestions: 2,
          correctCount: 2,
          incorrectCount: 0,
          accuracy: 100.0,
        }),
      });
    });
  });

  describe('getQuizHistory', () => {
    it('無効なセッションIDの場合、ValidationErrorを投げる', async () => {
      await expect(getQuizHistory('')).rejects.toThrow(ValidationError);
      await expect(getQuizHistory('   ')).rejects.toThrow(ValidationError);
      await expect(getQuizHistory('')).rejects.toThrow('セッションIDが無効です');
    });

    it('無効なUUID形式の場合、ValidationErrorを投げる', async () => {
      await expect(getQuizHistory('invalid-uuid')).rejects.toThrow(ValidationError);
      await expect(getQuizHistory('invalid-uuid')).rejects.toThrow('セッションIDの形式が正しくありません');
    });

    it('データベースエラーの場合、DatabaseErrorを投げる', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.quizResult.findMany.mockRejectedValue({
        code: 'P1001',
        message: 'Can\'t reach database server'
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      await expect(getQuizHistory(validUuid)).rejects.toThrow(DatabaseError);
      await expect(getQuizHistory(validUuid)).rejects.toThrow('データベースサーバーに接続できません');
    });

    it('データが見つからない場合、空配列を返す', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      prisma.quizResult.findMany.mockRejectedValue({
        code: 'P2025',
        message: 'Record not found'
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await getQuizHistory(validUuid);
      expect(result).toEqual([]);
    });

    it('正常な場合、履歴データを返す', async () => {
      const mockHistoryData = [
        {
          id: 'result-1',
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          score: 8,
          totalQuestions: 10,
          correctCount: 8,
          incorrectCount: 2,
          accuracy: 80.0,
          answers: [],
          completedAt: new Date(),
        },
        {
          id: 'result-2',
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          score: 6,
          totalQuestions: 10,
          correctCount: 6,
          incorrectCount: 4,
          accuracy: 60.0,
          answers: [],
          completedAt: new Date(),
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { prisma } = require('@/lib/db');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma.quizResult.findMany.mockResolvedValue(mockHistoryData as any);

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await getQuizHistory(validUuid);
      
      expect(result).toHaveLength(2);
      expect(result[0].score).toBe(8);
      expect(result[1].score).toBe(6);
      expect(prisma.quizResult.findMany).toHaveBeenCalledWith({
        where: { sessionId: validUuid },
        orderBy: { completedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          sessionId: true,
          score: true,
          totalQuestions: true,
          correctCount: true,
          incorrectCount: true,
          accuracy: true,
          answers: true,
          completedAt: true,
        }
      });
    });
  });
});