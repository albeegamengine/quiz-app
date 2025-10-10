'use client';

import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '@/lib/session';
import { getQuizHistory } from '@/lib/actions/quiz';
import { QuizResult } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
        setError(err instanceof Error ? err.message : '履歴の取得に失敗しました');
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
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">エラー: {error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>クイズ履歴</CardTitle>
          <CardDescription>過去のクイズ結果を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">まだクイズに挑戦していません</p>
                <p className="text-muted-foreground text-sm mt-2">
                  ホーム画面から「クイズを始める」をクリックして挑戦してみましょう！
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
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
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {formatDate(result.completedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {result.score}/{result.totalQuestions}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAccuracyBadgeVariant(result.accuracy)}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}