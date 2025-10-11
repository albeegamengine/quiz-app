import { Card, CardContent } from '@/components/ui/card';

/**
 * グローバルローディングコンポーネント
 * ページ遷移時やデータ読み込み時に表示される
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              {/* スピナーアニメーション */}
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-primary/30 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              {/* ローディングテキスト */}
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">読み込み中...</p>
                <p className="text-sm text-gray-500">しばらくお待ちください</p>
              </div>
              
              {/* プログレスバー風のアニメーション */}
              <div className="w-48 mx-auto">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}