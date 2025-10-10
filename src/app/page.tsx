import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-8">
        {/* アプリの説明 */}
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">クイズアプリ</CardTitle>
            <CardDescription className="text-lg">
              知識を試して楽しく学習しましょう！
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              様々なジャンルのクイズに挑戦できます。複数選択式と入力式の問題があり、
              回答後には詳しい解説も確認できます。
            </p>
            <p className="text-muted-foreground">
              あなたのスコアは自動的に記録され、過去の成績を履歴で確認することができます。
            </p>
          </CardContent>
        </Card>

        {/* ナビゲーションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild size="lg" className="flex-1">
            <Link href="/quiz">
              クイズを始める
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/history">
              履歴を見る
            </Link>
          </Button>
        </div>

        {/* 機能説明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 多様な問題形式</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                複数選択式と入力式の問題で、様々な角度から知識を確認できます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 詳細な結果表示</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                正解率や各問題の詳細な解説で、学習効果を最大化できます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
