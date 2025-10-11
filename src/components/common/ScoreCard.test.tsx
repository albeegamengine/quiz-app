import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreCard } from './ScoreCard';

describe('ScoreCard', () => {
  it('正解数、不正解数、総問題数が正しく表示される', () => {
    render(<ScoreCard correct={8} incorrect={2} total={10} />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('正解率が正しく計算され表示される', () => {
    render(<ScoreCard correct={7} incorrect={3} total={10} />);

    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('正解率100%の場合に正しく表示される', () => {
    render(<ScoreCard correct={10} incorrect={0} total={10} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('正解率0%の場合に正しく表示される', () => {
    render(<ScoreCard correct={0} incorrect={10} total={10} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('総問題数が0の場合に正解率0%が表示される', () => {
    render(<ScoreCard correct={0} incorrect={0} total={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('正解率80%以上の場合に励ましメッセージが表示される', () => {
    render(<ScoreCard correct={9} incorrect={1} total={10} />);

    expect(screen.getByText('素晴らしい結果です！')).toBeInTheDocument();
  });

  it('正解率60%以上80%未満の場合に励ましメッセージが表示される', () => {
    render(<ScoreCard correct={7} incorrect={3} total={10} />);

    expect(screen.getByText('よく頑張りました！')).toBeInTheDocument();
  });

  it('正解率60%未満の場合に励ましメッセージが表示される', () => {
    render(<ScoreCard correct={5} incorrect={5} total={10} />);

    expect(
      screen.getByText('もう一度挑戦してみましょう！')
    ).toBeInTheDocument();
  });

  it('小数点を含む正解率が正しく四捨五入される', () => {
    // 7/9 = 77.777...% → 78%
    render(<ScoreCard correct={7} incorrect={2} total={9} />);

    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('必要なラベルが表示される', () => {
    render(<ScoreCard correct={8} incorrect={2} total={10} />);

    expect(screen.getByText('正解数')).toBeInTheDocument();
    expect(screen.getByText('不正解数')).toBeInTheDocument();
    expect(screen.getByText('総問題数')).toBeInTheDocument();
    expect(screen.getByText('正解率')).toBeInTheDocument();
    expect(screen.getByText('クイズ結果')).toBeInTheDocument();
  });

  it('正解率に応じて適切なバッジバリアントが使用される', () => {
    const { rerender } = render(
      <ScoreCard correct={9} incorrect={1} total={10} />
    );

    // 90%の場合（80%以上）- defaultバリアント
    let accuracyBadge = screen.getByText('90%');
    expect(accuracyBadge).toHaveClass('bg-primary');

    // 70%の場合（60%以上80%未満）- secondaryバリアント
    rerender(<ScoreCard correct={7} incorrect={3} total={10} />);
    accuracyBadge = screen.getByText('70%');
    expect(accuracyBadge).toHaveClass('bg-secondary');

    // 50%の場合（60%未満）- destructiveバリアント
    rerender(<ScoreCard correct={5} incorrect={5} total={10} />);
    accuracyBadge = screen.getByText('50%');
    expect(accuracyBadge).toHaveClass('bg-destructive');
  });
});
