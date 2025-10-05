import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuestionProgress } from './QuestionProgress';

describe('QuestionProgress', () => {
  it('現在の質問番号と総質問数を正しく表示する', () => {
    render(<QuestionProgress current={3} total={10} />);
    
    expect(screen.getByText('質問 3 / 10')).toBeInTheDocument();
  });

  it('進捗率を正しく計算して表示する', () => {
    render(<QuestionProgress current={5} total={10} />);
    
    // 50%の進捗率が表示されることを確認
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('進捗率を四捨五入して表示する', () => {
    render(<QuestionProgress current={1} total={3} />);
    
    // 1/3 = 33.33... → 33%に四捨五入
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('最初の質問の場合の進捗を正しく表示する', () => {
    render(<QuestionProgress current={1} total={10} />);
    
    expect(screen.getByText('質問 1 / 10')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('最後の質問の場合の進捗を正しく表示する', () => {
    render(<QuestionProgress current={10} total={10} />);
    
    expect(screen.getByText('質問 10 / 10')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('総質問数が0の場合でもエラーにならない', () => {
    render(<QuestionProgress current={0} total={0} />);
    
    expect(screen.getByText('質問 0 / 0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('進捗バーにアクセシビリティ属性が設定されている', () => {
    render(<QuestionProgress current={3} total={10} />);
    
    const progressBar = screen.getByLabelText('質問 3 / 10の進捗');
    expect(progressBar).toBeInTheDocument();
  });

  it('進捗バーが存在し、適切にレンダリングされている', () => {
    render(<QuestionProgress current={7} total={10} />);
    
    // Progressコンポーネントが存在することを確認
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // 進捗バーのインジケーターが存在することを確認
    const indicator = progressBar.querySelector('[style*="translateX"]');
    expect(indicator).toBeInTheDocument();
  });
});