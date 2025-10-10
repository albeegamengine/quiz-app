'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Answer, QuizResult } from '@/types/quiz';
import { saveQuizResult } from '@/lib/actions/quiz';
import { getOrCreateSessionId } from '@/lib/session';
import { ScoreCard } from '@/components/common/ScoreCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface QuizData {
  questions: Question[];
  answers: Answer[];
  completedAt: string;
}

/**
 * 結果画面コンポーネント
 * クイズ結果の表示、スコアの保存、詳細結果の表示を行う
 */
export default function ResultPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // クイズデータの取得とスコア保存
  useEffect(() => {
    const loadAndSaveResult = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // localStorageからクイズデータを取得
        const storedData = localStorage.getItem('quiz-result-data');
        if (!storedData) {
          throw new Error('クイズデータが見つかりません。もう一度クイズに挑戦してください。');
        }

        const parsedData: QuizData = JSON.parse(storedData);
        
        // データの妥当性チェック
        if (!parsedData.questions || !parsedData.answers || 
            parsedData.questions.length === 0 || parsedData.answers.length === 0) {
          throw new Error('無効なクイズデータです。');
        }

        if (parsedData.questions.length !== parsedData.answers.length) {
          throw new Error('質問数と回答数が一致しません。');
        }

        setQuizData(parsedData);

        // スコアをデータベースに保存
        setIsSaving(true);
        const sessionId = getOrCreateSessionId();
        
        if (!sessionId) {
          throw new Error('セッションIDの取得に失敗しました。');
        }

        const savedResult = await saveQuizResult(
          sessionId,
          parsedData.answers,
          parsedData.questions
        );

        setQuizResult(savedResult);

        // 保存後にlocalStorageからデータを削除
        localStorage.removeItem('quiz-result-data');

      } catch (err) {
        console.error('結果の処理中にエラーが発生しました:', err);
        setError(err instanceof Error ? err.message : '結果の処理中にエラーが発生しました');
      } finally {
        setIsLoading(false);
        setIsSaving(false);
      }
    };

    loadAndSaveResult();
  }, []);

  // もう一度挑戦ボタンのハンドラー
  const handleRetry = () => {
    router.push('/quiz');
  };

  // ホームに戻るボタンのハンドラー
  const handleGoHome = () => {
    router.push('/');
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                  {isSaving ? '結果を保存しています...' : '結果を読み込んでいます...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <h2 className="text-xl font-semibold text-destructive">エラーが発生しました</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="space-x-4">
                <Button onClick={handleRetry} variant="default">
                  クイズに挑戦する
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // データが存在しない場合
  if (!quizData || !quizResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <h2 className="text-xl font-semibold">結果が見つかりません</h2>
              <p className="text-muted-foreground">
                クイズの結果データが見つかりません。もう一度クイズに挑戦してください。
              </p>
              <div className="space-x-4">
                <Button onClick={handleRetry} variant="default">
                  クイズに挑戦する
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ページタイトル */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">クイズ結果</h1>
          <p className="text-muted-foreground mt-2">
            お疲れさまでした！あなたの結果をご確認ください。
          </p>
        </div>

        {/* スコアカード */}
        <ScoreCard
          correct={quizResult.correctCount}
          incorrect={quizResult.incorrectCount}
          total={quizResult.totalQuestions}
        />

        {/* 詳細結果テーブル */}
        <Card>
          <CardHeader>
            <CardTitle>回答詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">問題</TableHead>
                  <TableHead>質問</TableHead>
                  <TableHead className="w-32">あなたの回答</TableHead>
                  <TableHead className="w-32">正解</TableHead>
                  <TableHead className="w-20">結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizData.questions.map((question, index) => {
                  const answer = quizData.answers[index];
                  const isCorrect = answer?.isCorrect || false;
                  
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm">{question.text}</p>
                          {question.type === 'MULTIPLE_CHOICE' && question.options.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              選択肢: {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer?.userAnswer || '未回答'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-green-600 font-medium">
                          {question.correctAnswer}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCorrect ? 'default' : 'destructive'}>
                          {isCorrect ? '正解' : '不正解'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 解説セクション（解説がある問題のみ表示） */}
        {quizData.questions.some(q => q.explanation) && (
          <Card>
            <CardHeader>
              <CardTitle>解説</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizData.questions.map((question, index) => {
                if (!question.explanation) return null;
                
                const answer = quizData.answers[index];
                const isCorrect = answer?.isCorrect || false;
                
                return (
                  <div key={question.id} className="border-l-4 border-l-primary pl-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        問題 {index + 1}
                      </Badge>
                      <Badge variant={isCorrect ? 'default' : 'destructive'} className="text-xs">
                        {isCorrect ? '正解' : '不正解'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{question.text}</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetry} size="lg" className="min-w-48">
            もう一度挑戦
          </Button>
          <Button onClick={handleGoHome} variant="outline" size="lg" className="min-w-48">
            ホームに戻る
          </Button>
        </div>

        {/* 結果保存確認メッセージ */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            結果は履歴に保存されました。「履歴を見る」から過去の結果を確認できます。
          </p>
        </div>
      </div>
    </div>
  );
}