'use server';

import { prisma } from '@/lib/db';
import { Question, Answer, QuizResult } from '@/types/quiz';

/**
 * データベースからランダムに10問のクイズを取得する
 * @returns Promise<Question[]> - 取得したクイズの配列
 * @throws Error - データベースエラーまたはデータが不足している場合
 */
export async function getQuizQuestions(): Promise<Question[]> {
  try {
    // データベースから全ての質問を取得
    const allQuestions = await prisma.question.findMany();
    
    // 質問が10問未満の場合はエラーを投げる
    if (allQuestions.length < 10) {
      throw new Error(`データベースに十分な質問がありません。現在の質問数: ${allQuestions.length}問（最低10問必要）`);
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
    return selectedQuestions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type as 'MULTIPLE_CHOICE' | 'TEXT_INPUT',
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || undefined,
    }));
    
  } catch (error) {
    // エラーログを出力
    console.error('クイズデータの取得中にエラーが発生しました:', error);
    
    // エラーの種類に応じて適切なメッセージを設定
    if (error instanceof Error) {
      throw new Error(`クイズデータの取得に失敗しました: ${error.message}`);
    } else {
      throw new Error('クイズデータの取得中に予期しないエラーが発生しました');
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
  try {
    // 入力値の検証
    if (!sessionId || sessionId.trim() === '') {
      throw new Error('セッションIDが無効です');
    }
    
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new Error('回答データが無効です');
    }
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('質問データが無効です');
    }
    
    if (answers.length !== questions.length) {
      throw new Error('回答数と質問数が一致しません');
    }

    // スコア計算
    const totalQuestions = questions.length;
    let correctCount = 0;
    let incorrectCount = 0;

    // 各回答の正誤を確認
    const validatedAnswers: Answer[] = answers.map((answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        throw new Error(`質問ID ${answer.questionId} が見つかりません`);
      }

      // 正誤判定（大文字小文字を区別しない）
      const isCorrect = question.correctAnswer.toLowerCase().trim() === 
                       answer.userAnswer.toLowerCase().trim();
      
      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect
      };
    });

    // 正解率を計算（小数点第1位まで）
    const accuracy = Math.round((correctCount / totalQuestions) * 1000) / 10;
    
    // スコア計算（正解数をそのままスコアとする）
    const score = correctCount;

    // データベースに保存
    const savedResult = await prisma.quizResult.create({
      data: {
        sessionId: sessionId.trim(),
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        accuracy,
        answers: validatedAnswers as any, // JSONとして保存
        completedAt: new Date()
      }
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
      completedAt: savedResult.completedAt
    };

    return result;

  } catch (error) {
    // エラーログを出力
    console.error('クイズ結果の保存中にエラーが発生しました:', error);
    
    // エラーの種類に応じて適切なメッセージを設定
    if (error instanceof Error) {
      throw new Error(`クイズ結果の保存に失敗しました: ${error.message}`);
    } else {
      throw new Error('クイズ結果の保存中に予期しないエラーが発生しました');
    }
  }
}