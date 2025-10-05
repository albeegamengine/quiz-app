import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuizQuestion } from './QuizQuestion';
import { Question } from '@/types/quiz';

// テスト用のサンプル質問データ
const mockQuestion: Question = {
  id: '1',
  text: 'JavaScriptで配列の最後に要素を追加するメソッドは？',
  type: 'MULTIPLE_CHOICE',
  options: ['push()', 'pop()', 'shift()', 'unshift()'],
  correctAnswer: '0',
  explanation: 'push()メソッドは配列の最後に1つ以上の要素を追加し、新しい配列の長さを返します。',
};

const mockQuestionWithoutExplanation: Question = {
  id: '2',
  text: 'CSSでテキストを中央揃えにするプロパティは？',
  type: 'MULTIPLE_CHOICE',
  options: ['text-align: center', 'align: center', 'center: true', 'text-center: true'],
  correctAnswer: '0',
};

describe('QuizQuestion', () => {
  const mockOnAnswer = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('質問の表示', () => {
    it('質問文が正しく表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
        />
      );

      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    it('すべての選択肢が表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
        />
      );

      mockQuestion.options.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('回答前は解説が表示されない', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
        />
      );

      expect(screen.queryByText('解説')).not.toBeInTheDocument();
      expect(screen.queryByText(mockQuestion.explanation!)).not.toBeInTheDocument();
    });

    it('回答前は次へボタンが表示されない', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
          onNext={mockOnNext}
        />
      );

      expect(screen.queryByText('次へ')).not.toBeInTheDocument();
    });
  });

  describe('選択肢の選択', () => {
    it('選択肢をクリックするとonAnswerが呼ばれる', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
        />
      );

      const firstOption = screen.getByLabelText(mockQuestion.options[0]);
      fireEvent.click(firstOption);

      expect(mockOnAnswer).toHaveBeenCalledWith('0');
    });

    it('回答済みの場合は選択肢をクリックしてもonAnswerが呼ばれない', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="1"
          correctAnswer="0"
        />
      );

      const firstOption = screen.getByLabelText(mockQuestion.options[0]);
      fireEvent.click(firstOption);

      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe('正解時のフィードバック', () => {
    it('正解の選択肢に緑色のスタイルと「正解」バッジが表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
        />
      );

      // 正解バッジが表示される
      expect(screen.getByText('正解')).toBeInTheDocument();
      
      // 正解の選択肢が緑色のスタイルを持つ
      const correctOptionContainer = screen.getByText(mockQuestion.options[0]).closest('div');
      expect(correctOptionContainer).toHaveClass('border-green-500', 'bg-green-50', 'text-green-800');
    });

    it('解説がある場合は表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
        />
      );

      expect(screen.getByText('解説')).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.explanation!)).toBeInTheDocument();
    });

    it('解説がない場合は解説セクションが表示されない', () => {
      render(
        <QuizQuestion
          question={mockQuestionWithoutExplanation}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
        />
      );

      expect(screen.queryByText('解説')).not.toBeInTheDocument();
    });
  });

  describe('不正解時のフィードバック', () => {
    it('不正解の選択肢に赤色のスタイルと「不正解」バッジが表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="1"
          correctAnswer="0"
        />
      );

      // 不正解バッジが表示される
      expect(screen.getByText('不正解')).toBeInTheDocument();
      
      // 選択した不正解の選択肢が赤色のスタイルを持つ
      const incorrectOptionContainer = screen.getByText(mockQuestion.options[1]).closest('div');
      expect(incorrectOptionContainer).toHaveClass('border-red-500', 'bg-red-50', 'text-red-800');
    });

    it('正解の選択肢も緑色で表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="1"
          correctAnswer="0"
        />
      );

      // 正解バッジが表示される
      expect(screen.getByText('正解')).toBeInTheDocument();
      
      // 正解の選択肢が緑色のスタイルを持つ
      const correctOptionContainer = screen.getByText(mockQuestion.options[0]).closest('div');
      expect(correctOptionContainer).toHaveClass('border-green-500', 'bg-green-50', 'text-green-800');
    });

    it('選択されていない選択肢は薄く表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="1"
          correctAnswer="0"
        />
      );

      // 選択されていない選択肢（インデックス2と3）が薄く表示される
      const unselectedOption1 = screen.getByText(mockQuestion.options[2]).closest('div');
      const unselectedOption2 = screen.getByText(mockQuestion.options[3]).closest('div');
      
      expect(unselectedOption1).toHaveClass('opacity-60');
      expect(unselectedOption2).toHaveClass('opacity-60');
    });
  });

  describe('次へボタン', () => {
    it('回答済みでonNextが提供されている場合、次へボタンが表示される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
          onNext={mockOnNext}
        />
      );

      expect(screen.getByText('次へ')).toBeInTheDocument();
    });

    it('次へボタンをクリックするとonNextが呼ばれる', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
          onNext={mockOnNext}
        />
      );

      const nextButton = screen.getByText('次へ');
      fireEvent.click(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('onNextが提供されていない場合、次へボタンは表示されない', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
        />
      );

      expect(screen.queryByText('次へ')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('各選択肢にラベルが正しく関連付けられている', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={false}
          correctAnswer="0"
        />
      );

      mockQuestion.options.forEach((option, index) => {
        const label = screen.getByLabelText(option);
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('value', index.toString());
      });
    });

    it('回答済みの場合、RadioGroupが無効化される', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          isAnswered={true}
          selectedAnswer="0"
          correctAnswer="0"
        />
      );

      // RadioGroupが無効化されていることを確認（data-disabled属性で確認）
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('data-disabled', '');
    });
  });
});