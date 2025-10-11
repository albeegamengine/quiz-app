'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Answer } from '@/types/quiz';
import { getQuizQuestions } from '@/lib/actions/quiz';
import { QuestionProgress } from '@/components/quiz/QuestionProgress';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * クイズ画面コンポーネント
 * クイズの表示、回答の受付、進捗管理を行う
 */
export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // クイズデータを取得
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quizData = await getQuizQuestions();
        setQuestions(quizData);

        // 回答配列を初期化
        const initialAnswers: Answer[] = quizData.map((question) => ({
          questionId: question.id,
          userAnswer: '',
          isCorrect: false,
        }));
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('クイズデータの取得に失敗しました:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'クイズデータの取得に失敗しました'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, []);

  // 回答処理
  const handleAnswer = (userAnswer: string) => {
    if (isAnswered || questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];

    // 正誤判定
    let isCorrect = false;
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      // 複数選択式：選択肢のインデックスで判定
      isCorrect = currentQuestion.correctAnswer === userAnswer;
    } else {
      // テキスト入力式：大文字小文字を区別しない
      isCorrect =
        currentQuestion.correctAnswer.toLowerCase().trim() ===
        userAnswer.toLowerCase().trim();
    }

    // 回答を更新
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect,
    };
    setAnswers(updatedAnswers);
    setIsAnswered(true);
  };

  // 次の質問に進む
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // 次の質問に進む
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsAnswered(false);
    } else {
      // 最後の質問の場合は結果画面に遷移
      // 回答データをlocalStorageに保存
      const quizData = {
        questions,
        answers,
        completedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('quiz-result-data', JSON.stringify(quizData));
        router.push('/result');
      } catch (error) {
        console.error('結果データの保存に失敗しました:', error);
        // localStorageが使えない場合はクエリパラメータで渡す（簡易版）
        router.push('/result?completed=true');
      }
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                  クイズを読み込んでいます...
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <h2 className="text-xl font-semibold text-destructive">
                エラーが発生しました
              </h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="space-x-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  再試行
                </Button>
                <Button onClick={() => router.push('/')} variant="default">
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 質問が存在しない場合
  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <h2 className="text-xl font-semibold">クイズが見つかりません</h2>
              <p className="text-muted-foreground">
                現在利用可能なクイズがありません。
              </p>
              <Button onClick={() => router.push('/')}>ホームに戻る</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* 進捗表示 */}
        <QuestionProgress
          current={currentQuestionIndex + 1}
          total={questions.length}
        />

        {/* 質問表示 */}
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          isAnswered={isAnswered}
          selectedAnswer={currentAnswer?.userAnswer}
          correctAnswer={currentQuestion.correctAnswer}
          onNext={handleNext}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
        />

        {/* デバッグ情報（開発時のみ表示） */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">デバッグ情報</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  現在の質問: {currentQuestionIndex + 1} / {questions.length}
                </p>
                <p>回答済み: {isAnswered ? 'はい' : 'いいえ'}</p>
                <p>質問タイプ: {currentQuestion.type}</p>
                <p>正解: {currentQuestion.correctAnswer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
