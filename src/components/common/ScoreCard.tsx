import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScoreCardProps {
  correct: number;
  incorrect: number;
  total: number;
}

/**
 * ScoreCard コンポーネント
 * クイズの結果（正解数、不正解数、正解率）を視覚的に表示する
 */
export function ScoreCard({ correct, incorrect, total }: ScoreCardProps) {
  // 正解率を計算（パーセンテージ）
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // 正解率に基づいてバッジの色を決定
  const getAccuracyVariant = (accuracy: number) => {
    if (accuracy >= 80) return 'default'; // 緑系（良好）
    if (accuracy >= 60) return 'secondary'; // グレー系（普通）
    return 'destructive'; // 赤系（要改善）
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg sm:text-xl">クイズ結果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* スコア表示 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">正解数</p>
            <Badge
              variant="default"
              className="text-sm sm:text-lg px-2 sm:px-3 py-1"
            >
              {correct}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">不正解数</p>
            <Badge
              variant="destructive"
              className="text-sm sm:text-lg px-2 sm:px-3 py-1"
            >
              {incorrect}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">総問題数</p>
            <Badge
              variant="outline"
              className="text-sm sm:text-lg px-2 sm:px-3 py-1"
            >
              {total}
            </Badge>
          </div>
        </div>

        {/* 正解率表示 */}
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground">正解率</p>
          <Badge
            variant={getAccuracyVariant(accuracy)}
            className="text-xl sm:text-2xl px-3 sm:px-4 py-2 font-bold"
          >
            {accuracy}%
          </Badge>
        </div>

        {/* 結果メッセージ */}
        <div className="text-center mt-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {accuracy >= 80 && '素晴らしい結果です！'}
            {accuracy >= 60 && accuracy < 80 && 'よく頑張りました！'}
            {accuracy < 60 && 'もう一度挑戦してみましょう！'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
