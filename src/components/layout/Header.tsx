import Link from 'next/link';

/**
 * アプリケーション共通のヘッダーコンポーネント
 * アプリタイトルとホームへのリンクを提供する
 * レスポンシブデザインに対応
 */
export default function Header() {
  return (
    <header
      className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="クイズアプリのホームページに移動"
            >
              クイズアプリ
            </Link>
          </div>
          <nav
            className="flex space-x-2 sm:space-x-4"
            role="navigation"
            aria-label="メインナビゲーション"
          >
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="ホームページに移動"
            >
              ホーム
            </Link>
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="クイズ履歴ページに移動"
            >
              履歴
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
