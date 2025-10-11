'use client';

import React, { useState } from 'react';
import { Question } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (answerId: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string;
  correctAnswer: string;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

/**
 * クイズの質問と選択肢を表示するコンポーネント
 * 複数選択式とテキスト入力式の質問に対応し、回答後に正誤フィードバックを表示する
 */
export function QuizQuestion({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  correctAnswer,
  onNext,
  isLastQuestion = false,
}: QuizQuestionProps) {
  const [textInput, setTextInput] = useState('');

  const handleValueChange = (value: string) => {
    if (!isAnswered) {
      onAnswer(value);
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAnswered) {
      setTextInput(e.target.value);
    }
  };

  const handleTextSubmit = () => {
    if (!isAnswered && textInput.trim()) {
      onAnswer(textInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    }
  };

  // キーボードナビゲーション用のハンドラー
  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    optionIndex: string
  ) => {
    if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleValueChange(optionIndex);
    }
  };

  // 次へボタンのキーボードハンドラー
  const handleNextKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNext?.();
    }
  };

  // テキスト入力式の正誤判定（大文字小文字を区別しない）
  const isTextAnswerCorrect = () => {
    if (question.type !== 'TEXT_INPUT' || !selectedAnswer) {
      return false;
    }
    return selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();
  };

  const getOptionStyle = (optionIndex: string) => {
    if (!isAnswered) {
      return '';
    }

    const isSelected = selectedAnswer === optionIndex;
    const isCorrect = correctAnswer === optionIndex;

    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-800';
    }

    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-800';
    }

    return 'opacity-60';
  };

  const getOptionBadge = (optionIndex: string) => {
    if (!isAnswered) {
      return null;
    }

    const isSelected = selectedAnswer === optionIndex;
    const isCorrect = correctAnswer === optionIndex;

    if (isCorrect) {
      return (
        <Badge variant="default" className="bg-green-500 text-white ml-2">
          正解
        </Badge>
      );
    }

    if (isSelected && !isCorrect) {
      return (
        <Badge variant="destructive" className="ml-2">
          不正解
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" role="main" aria-live="polite">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle
          className="text-base sm:text-lg font-semibold leading-relaxed"
          id="question-title"
          data-testid="question-text"
        >
          {question.text}
        </CardTitle>
        <div data-testid="question-type" className="sr-only">
          {question.type}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {question.type === 'MULTIPLE_CHOICE' ? (
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={handleValueChange}
            disabled={isAnswered}
            className="space-y-3"
            aria-labelledby="question-title"
            aria-describedby={isAnswered ? 'answer-feedback' : undefined}
          >
            {question.options.map((option, index) => {
              const optionIndex = index.toString();
              const isSelected = selectedAnswer === optionIndex;
              const isCorrect = correctAnswer === optionIndex;

              return (
                <div
                  key={optionIndex}
                  className={cn(
                    'flex items-center space-x-3 p-3 sm:p-4 rounded-lg border transition-all duration-200',
                    getOptionStyle(optionIndex),
                    !isAnswered && [
                      'hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm cursor-pointer',
                      'focus-within:bg-blue-50 focus-within:border-blue-300 focus-within:shadow-sm',
                      'group',
                    ]
                  )}
                  role="option"
                  aria-selected={isSelected}
                  aria-describedby={
                    isAnswered ? `option-${optionIndex}-feedback` : undefined
                  }
                  tabIndex={!isAnswered ? 0 : -1}
                  onKeyDown={(e) => handleOptionKeyDown(e, optionIndex)}
                  data-testid="quiz-option"
                >
                  <RadioGroupItem
                    value={optionIndex}
                    id={`option-${optionIndex}`}
                    className={cn(
                      'flex-shrink-0 transition-colors duration-200',
                      !isAnswered &&
                        'group-hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                      isAnswered &&
                        correctAnswer === optionIndex &&
                        'border-green-500 text-green-500',
                      isAnswered &&
                        selectedAnswer === optionIndex &&
                        correctAnswer !== optionIndex &&
                        'border-red-500 text-red-500'
                    )}
                    aria-describedby={`option-${optionIndex}-label`}
                  />
                  <Label
                    htmlFor={`option-${optionIndex}`}
                    id={`option-${optionIndex}-label`}
                    className={cn(
                      'flex-1 cursor-pointer text-sm sm:text-base leading-relaxed transition-colors duration-200',
                      !isAnswered && 'group-hover:text-blue-700'
                    )}
                  >
                    {option}
                  </Label>
                  {getOptionBadge(optionIndex)}
                  {/* スクリーンリーダー用の追加情報 */}
                  {isAnswered && (
                    <span
                      id={`option-${optionIndex}-feedback`}
                      className="sr-only"
                      aria-live="polite"
                    >
                      {isCorrect ? '正解です' : isSelected ? '不正解です' : ''}
                    </span>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          // テキスト入力式の質問
          <div
            className="space-y-4"
            role="group"
            aria-labelledby="question-title"
          >
            <div className="space-y-2">
              <Label
                htmlFor="text-input"
                className="text-sm sm:text-base font-medium"
              >
                回答を入力してください
              </Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  id="text-input"
                  type="text"
                  value={isAnswered ? selectedAnswer || '' : textInput}
                  onChange={handleTextInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isAnswered}
                  placeholder="回答を入力..."
                  aria-describedby={
                    isAnswered ? 'text-answer-feedback' : 'text-input-help'
                  }
                  aria-invalid={isAnswered && !isTextAnswerCorrect()}
                  className={cn(
                    'flex-1 transition-all duration-200',
                    !isAnswered && [
                      'hover:border-blue-300 hover:shadow-sm',
                      'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                    ],
                    isAnswered &&
                      isTextAnswerCorrect() &&
                      'border-green-500 bg-green-50',
                    isAnswered &&
                      !isTextAnswerCorrect() &&
                      'border-red-500 bg-red-50'
                  )}
                  data-testid="text-input"
                />
                {!isAnswered && (
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className={cn(
                      'px-4 sm:px-6 w-full sm:w-auto transition-all duration-200',
                      'hover:shadow-md focus:ring-2 focus:ring-blue-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-describedby="submit-help"
                  >
                    回答
                  </Button>
                )}
              </div>
              {/* スクリーンリーダー用のヘルプテキスト */}
              <div className="sr-only">
                <span id="text-input-help">
                  テキストを入力してEnterキーを押すか、回答ボタンをクリックしてください
                </span>
                <span id="submit-help">回答を送信します</span>
              </div>
            </div>

            {/* テキスト入力式の正誤フィードバック */}
            {isAnswered && (
              <div
                className="space-y-2"
                id="text-answer-feedback"
                aria-live="polite"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">あなたの回答:</span>
                  <Badge
                    variant={isTextAnswerCorrect() ? 'default' : 'destructive'}
                    className={cn(
                      isTextAnswerCorrect() && 'bg-green-500 text-white'
                    )}
                    aria-label={`あなたの回答: ${selectedAnswer}`}
                  >
                    {selectedAnswer}
                  </Badge>
                  <Badge
                    variant={isTextAnswerCorrect() ? 'default' : 'secondary'}
                    className={cn(
                      isTextAnswerCorrect() && 'bg-green-500 text-white',
                      !isTextAnswerCorrect() && 'bg-gray-500 text-white'
                    )}
                    aria-label={
                      isTextAnswerCorrect() ? '正解です' : '不正解です'
                    }
                  >
                    {isTextAnswerCorrect() ? '正解' : '不正解'}
                  </Badge>
                </div>
                {!isTextAnswerCorrect() && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">正解:</span>
                    <Badge
                      variant="default"
                      className="bg-green-500 text-white"
                      aria-label={`正解: ${correctAnswer}`}
                    >
                      {correctAnswer}
                    </Badge>
                  </div>
                )}
                {/* スクリーンリーダー用の詳細フィードバック */}
                <div className="sr-only" aria-live="polite">
                  {isTextAnswerCorrect()
                    ? `正解です。あなたの回答「${selectedAnswer}」は正しいです。`
                    : `不正解です。あなたの回答「${selectedAnswer}」は間違いです。正解は「${correctAnswer}」です。`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 解説の表示 */}
        {isAnswered && question.explanation && (
          <div
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200 hover:bg-blue-100"
            role="region"
            aria-labelledby="explanation-title"
            data-testid="answer-feedback"
          >
            <h4
              id="explanation-title"
              className="font-semibold text-blue-800 mb-2"
            >
              解説
            </h4>
            <p
              className="text-blue-700 text-sm"
              aria-describedby="explanation-title"
            >
              {question.explanation}
            </p>
          </div>
        )}

        {/* 回答済みの場合のフィードバック表示（解説がない場合） */}
        {isAnswered && !question.explanation && (
          <div
            className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
            data-testid="answer-feedback"
          >
            <p className="text-gray-700 text-sm">
              {question.type === 'MULTIPLE_CHOICE'
                ? selectedAnswer === correctAnswer
                  ? '正解です！'
                  : '不正解です。'
                : isTextAnswerCorrect()
                  ? '正解です！'
                  : '不正解です。'}
            </p>
          </div>
        )}

        {/* 次へボタン */}
        {isAnswered && onNext && (
          <div className="flex justify-center sm:justify-end mt-6">
            <Button
              onClick={onNext}
              onKeyDown={handleNextKeyDown}
              className={cn(
                'px-6 sm:px-8 w-full sm:w-auto transition-all duration-200',
                'hover:shadow-md hover:scale-105 focus:ring-2 focus:ring-blue-200',
                'active:scale-95'
              )}
              aria-label={isLastQuestion ? '結果を見る' : '次の質問に進む'}
              autoFocus
            >
              {isLastQuestion ? '結果を見る' : '次へ'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
