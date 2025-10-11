'use client';

import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '@/lib/session';
import { getQuizHistory } from '@/lib/actions/quiz';
import { QuizResult } from '@/types/quiz';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/**
 * 履歴画面コンポーネント
 * セッションIDに紐づく過去のクイズ結果を表示する
 */
export default function HistoryPage() {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // セッションIDを取得
        const sessionId = getOrCreateSessionId();

        if (!sessionId) {
          setError('セッションIDの取得に失敗しました');
          return;
        }

        // 履歴データを取得
        const historyData = await getQuizHistory(sessionId);
        setHistory(historyData);
      } catch (err) {
        console.error('履歴の取得中にエラーが発生しました:', err);
        setError(
          err instanceof Error ? err.message : '履歴の取得に失敗しました'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  /**
   * 日時を日本語形式でフォーマットする
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  /**
   * 正解率に応じてBadgeの色を決定する
   */
  const getAccuracyBadgeVariant = (accuracy: number) => {
    if (accuracy >= 80) return 'default'; // 緑系
    if (accuracy >= 60) return 'secondary'; // グレー系
    return 'destructive'; // 赤系
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>クイズ履歴</CardTitle>
            <CardDescription>過去のクイズ結果を確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">読み込み中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>クイズ履歴</CardTitle>
            <CardDescription>過去のクイズ結果を確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  エラーが発生しました
                </h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  再試行
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Card>
        <CardHeader>
          <CardTitle>クイズ履歴</CardTitle>
          <CardDescription>過去のクイズ結果を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">
                  まだクイズに挑戦していません
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  ホーム画面から「クイズを始める」をクリックして挑戦してみましょう！
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* デスクトップ用テーブル表示 */}
              <div className="hidden md:block overflow-x-auto">
                <Table data-testid="history-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>日時</TableHead>
                      <TableHead>スコア</TableHead>
                      <TableHead>正解率</TableHead>
                      <TableHead>正解数</TableHead>
                      <TableHead>不正解数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((result) => (
                      <TableRow key={result.id} data-testid="history-row">
                        <TableCell
                          className="font-medium"
                          data-testid="history-date"
                        >
                          {formatDate(result.completedAt)}
                        </TableCell>
                        <TableCell data-testid="history-score">
                          <Badge variant="outline">
                            {result.score}/{result.totalQuestions}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid="history-accuracy">
                          <Badge
                            variant={getAccuracyBadgeVariant(result.accuracy)}
                          >
                            {result.accuracy}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {result.correctCount}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {result.incorrectCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* モバイル用カード表示 */}
              <div className="md:hidden space-y-4">
                {history.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">
                          {formatDate(result.completedAt)}
                        </div>
                        <Badge
                          variant={getAccuracyBadgeVariant(result.accuracy)}
                        >
                          {result.accuracy}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            スコア
                          </p>
                          <Badge variant="outline" className="text-sm">
                            {result.score}/{result.totalQuestions}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">正解</p>
                          <div className="text-green-600 font-semibold text-sm">
                            {result.correctCount}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            不正解
                          </p>
                          <div className="text-red-600 font-semibold text-sm">
                            {result.incorrectCount}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
