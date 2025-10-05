'use client';

import React from 'react';
import { Question } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (answerId: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string;
  correctAnswer: string;
  onNext?: () => void;
}

/**
 * クイズの質問と選択肢を表示するコンポーネント
 * 複数選択式の質問に対応し、回答後に正誤フィードバックを表示する
 */
export function QuizQuestion({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  correctAnswer,
  onNext,
}: QuizQuestionProps) {
  const handleValueChange = (value: string) => {
    if (!isAnswered) {
      onAnswer(value);
    }
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer || ''}
          onValueChange={handleValueChange}
          disabled={isAnswered}
          className="space-y-3"
        >
          {question.options.map((option, index) => {
            const optionIndex = index.toString();
            return (
              <div
                key={optionIndex}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border transition-colors',
                  getOptionStyle(optionIndex),
                  !isAnswered && 'hover:bg-gray-50 cursor-pointer'
                )}
              >
                <RadioGroupItem
                  value={optionIndex}
                  id={`option-${optionIndex}`}
                  className={cn(
                    isAnswered && correctAnswer === optionIndex && 'border-green-500 text-green-500',
                    isAnswered && selectedAnswer === optionIndex && correctAnswer !== optionIndex && 'border-red-500 text-red-500'
                  )}
                />
                <Label
                  htmlFor={`option-${optionIndex}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </Label>
                {getOptionBadge(optionIndex)}
              </div>
            );
          })}
        </RadioGroup>

        {/* 解説の表示 */}
        {isAnswered && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">解説</h4>
            <p className="text-blue-700 text-sm">{question.explanation}</p>
          </div>
        )}

        {/* 次へボタン */}
        {isAnswered && onNext && (
          <div className="flex justify-end mt-6">
            <Button onClick={onNext} className="px-6">
              次へ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}