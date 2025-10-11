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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-base sm:text-lg font-semibold leading-relaxed">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {question.type === 'MULTIPLE_CHOICE' ? (
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
                    'flex items-center space-x-3 p-3 sm:p-4 rounded-lg border transition-colors',
                    getOptionStyle(optionIndex),
                    !isAnswered && 'hover:bg-gray-50 cursor-pointer'
                  )}
                >
                  <RadioGroupItem
                    value={optionIndex}
                    id={`option-${optionIndex}`}
                    className={cn(
                      'flex-shrink-0',
                      isAnswered &&
                        correctAnswer === optionIndex &&
                        'border-green-500 text-green-500',
                      isAnswered &&
                        selectedAnswer === optionIndex &&
                        correctAnswer !== optionIndex &&
                        'border-red-500 text-red-500'
                    )}
                  />
                  <Label
                    htmlFor={`option-${optionIndex}`}
                    className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed"
                  >
                    {option}
                  </Label>
                  {getOptionBadge(optionIndex)}
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          // テキスト入力式の質問
          <div className="space-y-4">
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
                  className={cn(
                    'flex-1',
                    isAnswered &&
                      isTextAnswerCorrect() &&
                      'border-green-500 bg-green-50',
                    isAnswered &&
                      !isTextAnswerCorrect() &&
                      'border-red-500 bg-red-50'
                  )}
                />
                {!isAnswered && (
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="px-4 sm:px-6 w-full sm:w-auto"
                  >
                    回答
                  </Button>
                )}
              </div>
            </div>

            {/* テキスト入力式の正誤フィードバック */}
            {isAnswered && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">あなたの回答:</span>
                  <Badge
                    variant={isTextAnswerCorrect() ? 'default' : 'destructive'}
                    className={cn(
                      isTextAnswerCorrect() && 'bg-green-500 text-white'
                    )}
                  >
                    {selectedAnswer}
                  </Badge>
                  <Badge
                    variant={isTextAnswerCorrect() ? 'default' : 'secondary'}
                    className={cn(
                      isTextAnswerCorrect() && 'bg-green-500 text-white',
                      !isTextAnswerCorrect() && 'bg-gray-500 text-white'
                    )}
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
                    >
                      {correctAnswer}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 解説の表示 */}
        {isAnswered && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">解説</h4>
            <p className="text-blue-700 text-sm">{question.explanation}</p>
          </div>
        )}

        {/* 次へボタン */}
        {isAnswered && onNext && (
          <div className="flex justify-center sm:justify-end mt-6">
            <Button onClick={onNext} className="px-6 sm:px-8 w-full sm:w-auto">
              次へ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
