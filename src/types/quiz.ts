// TypeScript type definitions for the quiz application

export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  answers: Answer[];
  completedAt: Date;
}

export interface QuizSession {
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
}