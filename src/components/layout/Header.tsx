import Link from 'next/link';

/**
 * アプリケーション共通のヘッダーコンポーネント
 * アプリタイトルとホームへのリンクを提供する
 * レスポンシブデザインに対応
 */
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              クイズアプリ
            </Link>
          </div>
          <nav className="flex space-x-2 sm:space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              ホーム
            </Link>
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              履歴
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
