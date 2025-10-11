import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * 404 Not Found ページ
 * 存在しないページにアクセスした際に表示される
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.935-6.072-2.456M15 21H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            404 - ページが見つかりません
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            お探しのページは存在しないか、移動された可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/">ホームに戻る</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/quiz">クイズに挑戦する</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/history">履歴を見る</Link>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              問題が解決しない場合は、ブラウザを再読み込みしてください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
