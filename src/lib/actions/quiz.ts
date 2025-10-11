'use server';

import { prisma } from '@/lib/db';
import { Question, Answer, QuizResult } from '@/types/quiz';
import {
  DatabaseError,
  ValidationError,
  InsufficientDataError,
} from '@/lib/errors';

/**
 * エラーログを構造化して記録する
 */
function logError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    operation,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context,
    environment: process.env.NODE_ENV,
  };

  console.error('Server Action Error:', JSON.stringify(errorInfo, null, 2));

  // 本番環境では外部監視サービスに送信
  if (process.env.NODE_ENV === 'production') {
    // 例: Sentry, DataDog, CloudWatch Logs など
    // sendToMonitoringService(errorInfo);
  }
}

/**
 * Prismaエラーを解析してカスタムエラーに変換する
 */
function handlePrismaError(error: unknown, operation: string): never {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as {
      code: string;
      message: string;
      meta?: unknown;
    };

    switch (prismaError.code) {
      case 'P1001':
        throw new DatabaseError(
          'データベースサーバーに接続できません。ネットワーク接続を確認してください。',
          error,
          prismaError.code,
          true
        );
      case 'P1008':
        throw new DatabaseError(
          'データベース操作がタイムアウトしました。しばらく時間をおいてから再度お試しください。',
          error,
          prismaError.code,
          true
        );
      case 'P1017':
        throw new DatabaseError(
          'データベースサーバーが応答しません。管理者にお問い合わせください。',
          error,
          prismaError.code,
          false
        );
      case 'P2002':
        throw new DatabaseError(
          'データベースの制約違反が発生しました（重複データ）。',
          error,
          prismaError.code,
          false
        );
      case 'P2003':
        throw new DatabaseError(
          '関連するデータが見つからないため、操作を完了できません。',
          error,
          prismaError.code,
          false
        );
      case 'P2025':
        throw new DatabaseError(
          '指定されたデータが見つかりません。',
          error,
          prismaError.code,
          false
        );
      default:
        throw new DatabaseError(
          `データベースエラーが発生しました: ${prismaError.message}`,
          error,
          prismaError.code,
          true
        );
    }
  }

  throw new DatabaseError(
    `${operation}中に予期しないデータベースエラーが発生しました`,
    error,
    undefined,
    true
  );
}

/**
 * データベースからランダムに10問のクイズを取得する
 * @returns Promise<Question[]> - 取得したクイズの配列
 * @throws Error - データベースエラーまたはデータが不足している場合
 */
export async function getQuizQuestions(): Promise<Question[]> {
  const operation = 'getQuizQuestions';

  try {
    // データベースから全ての質問を取得
    const allQuestions = await prisma.question.findMany({
      select: {
        id: true,
        text: true,
        type: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      },
    });

    logError(operation, new Error('Debug: Questions fetched'), {
      questionCount: allQuestions.length,
    });

    // 質問が10問未満の場合はエラーを投げる
    if (allQuestions.length < 10) {
      const error = new InsufficientDataError(
        `データベースに十分な質問がありません。現在の質問数: ${allQuestions.length}問（最低10問必要）`,
        10,
        allQuestions.length
      );
      logError(operation, error, {
        required: 10,
        actual: allQuestions.length,
      });
      throw error;
    }

    // データの整合性チェック
    const invalidQuestions = allQuestions.filter(
      (q) =>
        !q.text ||
        !q.correctAnswer ||
        !Array.isArray(q.options) ||
        (q.type === 'MULTIPLE_CHOICE' && q.options.length === 0)
    );

    if (invalidQuestions.length > 0) {
      const error = new ValidationError(
        `無効な質問データが見つかりました: ${invalidQuestions.length}件`,
        'questions',
        invalidQuestions.map((q) => q.id)
      );
      logError(operation, error, {
        invalidQuestionIds: invalidQuestions.map((q) => q.id),
      });
      throw error;
    }

    // Fisher-Yatesアルゴリズムを使用してランダムに10問を選択
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 最初の10問を取得
    const selectedQuestions = shuffled.slice(0, 10);

    // Prismaの結果をQuestion型に変換
    const questions = selectedQuestions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type as 'MULTIPLE_CHOICE' | 'TEXT_INPUT',
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || undefined,
    }));

    // 成功ログ
    console.log(
      `${operation}: Successfully retrieved ${questions.length} questions`
    );

    return questions;
  } catch (error) {
    // カスタムエラーの場合はそのまま再スロー
    if (
      error instanceof InsufficientDataError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

    // Prismaエラーの処理
    if (error && typeof error === 'object' && 'code' in error) {
      logError(operation, error, { operation: 'database_query' });
      handlePrismaError(error, operation);
    }

    // その他のエラー
    logError(operation, error, { operation: 'unknown_error' });

    if (error instanceof Error) {
      throw new DatabaseError(
        `クイズデータの取得に失敗しました: ${error.message}`,
        error,
        undefined,
        true
      );
    } else {
      throw new DatabaseError(
        'クイズデータの取得中に予期しないエラーが発生しました',
        error,
        undefined,
        true
      );
    }
  }
}
/*
 *
 * クイズ結果を計算してデータベースに保存する
 * @param sessionId - ユーザーのセッションID
 * @param answers - ユーザーの回答データ
 * @param questions - クイズの質問データ
 * @returns Promise<QuizResult> - 保存されたクイズ結果
 * @throws Error - データベースエラーまたは計算エラーの場合
 */
export async function saveQuizResult(
  sessionId: string,
  answers: Answer[],
  questions: Question[]
): Promise<QuizResult> {
  const operation = 'saveQuizResult';

  try {
    // 入力値の詳細検証
    if (!sessionId || sessionId.trim() === '') {
      const error = new ValidationError(
        'セッションIDが無効です',
        'sessionId',
        sessionId
      );
      logError(operation, error, { sessionId });
      throw error;
    }

    // セッションIDの形式チェック（UUID）
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId.trim())) {
      const error = new ValidationError(
        'セッションIDの形式が正しくありません',
        'sessionId',
        sessionId
      );
      logError(operation, error, { sessionId });
      throw error;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      const error = new ValidationError(
        '回答データが無効です',
        'answers',
        answers
      );
      logError(operation, error, {
        answersType: typeof answers,
        answersLength: Array.isArray(answers) ? answers.length : 'N/A',
      });
      throw error;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      const error = new ValidationError(
        '質問データが無効です',
        'questions',
        questions
      );
      logError(operation, error, {
        questionsType: typeof questions,
        questionsLength: Array.isArray(questions) ? questions.length : 'N/A',
      });
      throw error;
    }

    if (answers.length !== questions.length) {
      const error = new ValidationError(
        `回答数と質問数が一致しません（回答: ${answers.length}問、質問: ${questions.length}問）`,
        'answers_questions_mismatch',
        { answersLength: answers.length, questionsLength: questions.length }
      );
      logError(operation, error, {
        answersLength: answers.length,
        questionsLength: questions.length,
      });
      throw error;
    }

    // スコア計算
    const totalQuestions = questions.length;
    let correctCount = 0;
    let incorrectCount = 0;

    // 各回答の正誤を確認
    const validatedAnswers: Answer[] = answers.map((answer, index) => {
      // 回答データの詳細検証
      if (!answer.questionId || typeof answer.questionId !== 'string') {
        const error = new ValidationError(
          `${index + 1}番目の回答の質問IDが無効です`,
          `answers[${index}].questionId`,
          answer.questionId
        );
        logError(operation, error, {
          answerIndex: index,
          questionId: answer.questionId,
        });
        throw error;
      }

      if (
        answer.userAnswer === undefined ||
        answer.userAnswer === null ||
        answer.userAnswer === ''
      ) {
        const error = new ValidationError(
          `${index + 1}番目の回答が空です`,
          `answers[${index}].userAnswer`,
          answer.userAnswer
        );
        logError(operation, error, {
          answerIndex: index,
          userAnswer: answer.userAnswer,
        });
        throw error;
      }

      const question = questions.find((q) => q.id === answer.questionId);

      if (!question) {
        const error = new ValidationError(
          `質問ID ${answer.questionId} が見つかりません`,
          `answers[${index}].questionId`,
          answer.questionId
        );
        logError(operation, error, {
          answerIndex: index,
          questionId: answer.questionId,
          availableQuestionIds: questions.map((q) => q.id),
        });
        throw error;
      }

      // 正誤判定（大文字小文字を区別しない、前後の空白を除去）
      const userAnswerNormalized = String(answer.userAnswer)
        .toLowerCase()
        .trim();
      const correctAnswerNormalized = question.correctAnswer
        .toLowerCase()
        .trim();
      const isCorrect = correctAnswerNormalized === userAnswerNormalized;

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionId: answer.questionId,
        userAnswer: String(answer.userAnswer).trim(),
        isCorrect,
      };
    });

    // 正解率を計算（小数点第1位まで）
    const accuracy = Math.round((correctCount / totalQuestions) * 1000) / 10;

    // スコア計算（正解数をそのままスコアとする）
    const score = correctCount;

    // 計算結果の検証
    if (correctCount + incorrectCount !== totalQuestions) {
      const error = new ValidationError(
        '正解数と不正解数の合計が総質問数と一致しません',
        'score_calculation',
        { correctCount, incorrectCount, totalQuestions }
      );
      logError(operation, error, {
        correctCount,
        incorrectCount,
        totalQuestions,
      });
      throw error;
    }

    // データベースに保存
    const savedResult = await prisma.quizResult.create({
      data: {
        sessionId: sessionId.trim(),
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        accuracy,
        answers: JSON.parse(JSON.stringify(validatedAnswers)), // JSONとして保存
        completedAt: new Date(),
      },
    });

    // QuizResult型に変換して返す
    const result: QuizResult = {
      id: savedResult.id,
      sessionId: savedResult.sessionId,
      score: savedResult.score,
      totalQuestions: savedResult.totalQuestions,
      correctCount: savedResult.correctCount,
      incorrectCount: savedResult.incorrectCount,
      accuracy: savedResult.accuracy,
      answers: validatedAnswers,
      completedAt: savedResult.completedAt,
    };

    // 成功ログ
    console.log(`${operation}: Successfully saved quiz result`, {
      resultId: result.id,
      sessionId: result.sessionId,
      score: result.score,
      accuracy: result.accuracy,
    });

    return result;
  } catch (error) {
    // カスタムエラーの場合はそのまま再スロー
    if (error instanceof ValidationError) {
      throw error;
    }

    // Prismaエラーの処理
    if (error && typeof error === 'object' && 'code' in error) {
      logError(operation, error, {
        operation: 'database_save',
        sessionId,
        answersCount: answers.length,
        questionsCount: questions.length,
      });
      handlePrismaError(error, operation);
    }

    // その他のエラー
    logError(operation, error, {
      operation: 'unknown_error',
      sessionId,
      answersCount: answers.length,
      questionsCount: questions.length,
    });

    if (error instanceof Error) {
      throw new DatabaseError(
        `クイズ結果の保存に失敗しました: ${error.message}`,
        error,
        undefined,
        true
      );
    } else {
      throw new DatabaseError(
        'クイズ結果の保存中に予期しないエラーが発生しました',
        error,
        undefined,
        true
      );
    }
  }
}
/**
 * 
セッションIDに紐づくクイズ履歴を取得する
 * @param sessionId - ユーザーのセッションID
 * @returns Promise<QuizResult[]> - 取得した履歴データ（最新順、最大50件）
 * @throws Error - データベースエラーまたは無効なセッションIDの場合
 */
export async function getQuizHistory(sessionId: string): Promise<QuizResult[]> {
  const operation = 'getQuizHistory';

  try {
    // 入力値の詳細検証
    if (!sessionId || sessionId.trim() === '') {
      const error = new ValidationError(
        'セッションIDが無効です',
        'sessionId',
        sessionId
      );
      logError(operation, error, { sessionId });
      throw error;
    }

    // セッションIDの形式チェック（UUIDの基本的な形式）
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId.trim())) {
      const error = new ValidationError(
        'セッションIDの形式が正しくありません',
        'sessionId',
        sessionId
      );
      logError(operation, error, { sessionId });
      throw error;
    }

    // データベースから履歴を取得（最新順、最大50件）
    const historyData = await prisma.quizResult.findMany({
      where: {
        sessionId: sessionId.trim(),
      },
      orderBy: {
        completedAt: 'desc', // 最新順でソート
      },
      take: 50, // 最大50件まで取得
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
      },
    });

    // Prismaの結果をQuizResult型に変換
    const results: QuizResult[] = historyData.map((record, index) => {
      try {
        // データの整合性チェック
        if (typeof record.score !== 'number' || record.score < 0) {
          throw new Error(`無効なスコア: ${record.score}`);
        }

        if (
          typeof record.totalQuestions !== 'number' ||
          record.totalQuestions <= 0
        ) {
          throw new Error(`無効な総質問数: ${record.totalQuestions}`);
        }

        if (
          typeof record.accuracy !== 'number' ||
          record.accuracy < 0 ||
          record.accuracy > 100
        ) {
          throw new Error(`無効な正解率: ${record.accuracy}`);
        }

        // answersデータの検証
        let answers: Answer[] = [];
        if (record.answers) {
          try {
            const parsedAnswers = record.answers as unknown as Answer[];
            if (Array.isArray(parsedAnswers)) {
              answers = parsedAnswers;
            } else {
              console.warn(
                `履歴データの回答形式が配列ではありません (ID: ${record.id})`
              );
            }
          } catch (parseError) {
            console.warn(
              `履歴データの回答解析に失敗しました (ID: ${record.id}):`,
              parseError
            );
          }
        }

        return {
          id: record.id,
          sessionId: record.sessionId,
          score: record.score,
          totalQuestions: record.totalQuestions,
          correctCount: record.correctCount,
          incorrectCount: record.incorrectCount,
          accuracy: record.accuracy,
          answers,
          completedAt: record.completedAt,
        };
      } catch (parseError) {
        const error = new DatabaseError(
          `履歴データの形式が正しくありません (ID: ${record.id})`,
          parseError,
          undefined,
          false
        );
        logError(operation, error, {
          recordId: record.id,
          recordIndex: index,
          parseError:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        });
        throw error;
      }
    });

    // 成功ログ
    console.log(
      `${operation}: Successfully retrieved ${results.length} history records for session ${sessionId}`
    );

    return results;
  } catch (error) {
    // カスタムエラーの場合はそのまま再スロー
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }

    // Prismaエラーの処理
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string };

      // データが見つからない場合は空配列を返す（エラーではない）
      if (prismaError.code === 'P2025') {
        console.log(`${operation}: No history found for session ${sessionId}`);
        return [];
      }

      logError(operation, error, {
        operation: 'database_query',
        sessionId,
      });
      handlePrismaError(error, operation);
    }

    // その他のエラー
    logError(operation, error, {
      operation: 'unknown_error',
      sessionId,
    });

    if (error instanceof Error) {
      throw new DatabaseError(
        `クイズ履歴の取得に失敗しました: ${error.message}`,
        error,
        undefined,
        true
      );
    } else {
      throw new DatabaseError(
        'クイズ履歴の取得中に予期しないエラーが発生しました',
        error,
        undefined,
        true
      );
    }
  }
}
