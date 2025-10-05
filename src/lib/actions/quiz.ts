'use server';

import { prisma } from '@/lib/db';
import { Question } from '@/types/quiz';

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