'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * エラーの種類を定義
 */
type ErrorType =
  | 'database'
  | 'network'
  | 'validation'
  | 'insufficient_data'
  | 'session'
  | 'unknown';

/**
 * エラー情報の型定義
 */
interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  suggestions: string[];
  canRetry: boolean;
  severity: 'low' | 'medium' | 'high';
}

/**
 * エラーバウンダリーコンポーネント
 * アプリケーション全体で発生したエラーをキャッチし、ユーザーフレンドリーなエラー画面を表示する
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // エラーをコンソールに記録（本番環境でも重要なエラーは記録）
    console.error('アプリケーションエラーが発生しました:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      retryCount,
    });

    // 本番環境では外部エラー監視サービスに送信することも可能
    // 例: Sentry, LogRocket, Bugsnag など
    if (process.env.NODE_ENV === 'production') {
      // 外部サービスへのエラー送信ロジックをここに実装
      // sendErrorToMonitoringService(error);
    }
  }, [error, retryCount]);

  /**
   * エラーメッセージを解析してエラー情報を返す
   */
  const getErrorInfo = (
    errorMessage: string,
    errorName?: string
  ): ErrorInfo => {
    const message = errorMessage.toLowerCase();
    const name = errorName?.toLowerCase() || '';

    // データベース関連のエラー
    if (
      message.includes('データベース') ||
      message.includes('database') ||
      message.includes('prisma') ||
      message.includes('connection') ||
      name.includes('databaseerror')
    ) {
      return {
        type: 'database',
        title: 'データベース接続エラー',
        message: 'データベースへの接続に問題が発生しました。',
        suggestions: [
          'しばらく時間をおいてから再度お試しください',
          'インターネット接続を確認してください',
          '問題が続く場合は管理者にお問い合わせください',
        ],
        canRetry: true,
        severity: 'high',
      };
    }

    // ネットワーク関連のエラー
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('接続')
    ) {
      return {
        type: 'network',
        title: 'ネットワークエラー',
        message: 'ネットワークの接続に問題が発生しました。',
        suggestions: [
          'インターネット接続を確認してください',
          'ページを再読み込みしてください',
          'しばらく時間をおいてから再度お試しください',
        ],
        canRetry: true,
        severity: 'medium',
      };
    }

    // バリデーションエラー
    if (
      message.includes('validation') ||
      message.includes('バリデーション') ||
      message.includes('無効') ||
      name.includes('validationerror')
    ) {
      return {
        type: 'validation',
        title: '入力データエラー',
        message: '入力されたデータに問題があります。',
        suggestions: [
          '入力内容を確認してください',
          'ページを再読み込みしてやり直してください',
          '問題が続く場合はホームに戻ってください',
        ],
        canRetry: false,
        severity: 'low',
      };
    }

    // データ不足エラー
    if (
      message.includes('insufficient') ||
      message.includes('不足') ||
      message.includes('十分') ||
      name.includes('insufficientdataerror')
    ) {
      return {
        type: 'insufficient_data',
        title: 'データ不足エラー',
        message: 'システムに必要なデータが不足しています。',
        suggestions: [
          '管理者にお問い合わせください',
          'しばらく時間をおいてから再度お試しください',
          'ホームに戻って別の機能をお試しください',
        ],
        canRetry: false,
        severity: 'high',
      };
    }

    // セッション関連のエラー
    if (
      message.includes('セッション') ||
      message.includes('session') ||
      message.includes('認証')
    ) {
      return {
        type: 'session',
        title: 'セッションエラー',
        message: 'セッションの処理に問題が発生しました。',
        suggestions: [
          'ページを再読み込みしてください',
          'ブラウザのキャッシュをクリアしてください',
          'ホームに戻ってやり直してください',
        ],
        canRetry: true,
        severity: 'medium',
      };
    }

    // その他のエラー
    return {
      type: 'unknown',
      title: '予期しないエラー',
      message: '予期しないエラーが発生しました。',
      suggestions: [
        'ページを再読み込みしてください',
        'しばらく時間をおいてから再度お試しください',
        '問題が続く場合は管理者にお問い合わせください',
      ],
      canRetry: true,
      severity: 'medium',
    };
  };

  const errorInfo = getErrorInfo(error.message, error.name);

  /**
   * リトライ処理
   */
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // 少し待ってからリトライ（ユーザビリティ向上）
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      reset();
    } catch (retryError) {
      console.error('リトライ中にエラーが発生しました:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * 重要度に応じたバッジの色を取得
   */
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <Badge variant={getSeverityBadgeVariant(errorInfo.severity)}>
              {errorInfo.severity === 'high'
                ? '重要'
                : errorInfo.severity === 'medium'
                  ? '中程度'
                  : '軽微'}
            </Badge>
          </div>

          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {errorInfo.message}
          </CardDescription>

          {retryCount > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                再試行回数: {retryCount}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 対処法の提案 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">対処法</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col space-y-2">
            {errorInfo.canRetry && (
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="default"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    再試行中...
                  </>
                ) : (
                  'もう一度試す'
                )}
              </Button>
            )}

            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="w-full"
            >
              ホームに戻る
            </Button>

            {/* 追加のナビゲーションオプション */}
            <div className="flex space-x-2">
              <Button
                onClick={() => (window.location.href = '/quiz')}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                クイズに挑戦
              </Button>
              <Button
                onClick={() => (window.location.href = '/history')}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                履歴を見る
              </Button>
            </div>
          </div>

          {/* エラーID表示（サポート用） */}
          {error.digest && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-gray-500">
                エラーID:{' '}
                <code className="bg-gray-100 px-1 rounded">{error.digest}</code>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                サポートにお問い合わせの際は、このIDをお伝えください
              </p>
            </div>
          )}

          {/* 開発環境でのみエラー詳細を表示 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-3 bg-gray-100 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                エラー詳細（開発環境のみ）
              </summary>
              <div className="mt-2 text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                <div className="mb-2">
                  <strong>エラー名:</strong> {error.name}
                </div>
                <div className="mb-2">
                  <strong>メッセージ:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-2">
                    <strong>スタックトレース:</strong>
                    <pre className="mt-1 text-xs">{error.stack}</pre>
                  </div>
                )}
                {error.digest && (
                  <div>
                    <strong>エラーID:</strong> {error.digest}
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
