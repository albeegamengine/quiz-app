import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Error from './error';

// Next.js routerをモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// window.location.hrefをモック
const mockLocation = {
  href: '',
};

// タイマーをモック
jest.useFakeTimers();

describe('Error Component', () => {
  const mockReset = jest.fn();
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // console.errorをモック
    mockLocation.href = '';

    // window.locationをモック
    delete (window as any).location;
    (window as any).location = mockLocation;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('エラーメッセージの表示', () => {
    it('基本的なエラーメッセージが表示される', () => {
      const mockError = {
        message: 'テストエラーメッセージ',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText('予期しないエラー')).toBeInTheDocument();
      expect(
        screen.getByText('予期しないエラーが発生しました。')
      ).toBeInTheDocument();
    });

    it('データベースエラーの場合、適切なメッセージが表示される', () => {
      const dbError = {
        message: 'データベースへの接続に失敗しました',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={dbError} reset={mockReset} />);

      expect(screen.getByText('データベース接続エラー')).toBeInTheDocument();
      expect(
        screen.getByText('データベースへの接続に問題が発生しました。')
      ).toBeInTheDocument();
    });

    it('ネットワークエラーの場合、適切なメッセージが表示される', () => {
      const networkError = {
        message: 'fetch failed',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={networkError} reset={mockReset} />);

      expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
      expect(
        screen.getByText('ネットワークの接続に問題が発生しました。')
      ).toBeInTheDocument();
    });

    it('バリデーションエラーの場合、適切なメッセージが表示される', () => {
      const validationError = {
        message: 'バリデーションに失敗しました',
        name: 'ValidationError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={validationError} reset={mockReset} />);

      expect(screen.getByText('入力データエラー')).toBeInTheDocument();
      expect(
        screen.getByText('入力されたデータに問題があります。')
      ).toBeInTheDocument();
    });

    it('データ不足エラーの場合、適切なメッセージが表示される', () => {
      const insufficientDataError = {
        message: '十分なデータがありません',
        name: 'InsufficientDataError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={insufficientDataError} reset={mockReset} />);

      expect(screen.getByText('データ不足エラー')).toBeInTheDocument();
      expect(
        screen.getByText('システムに必要なデータが不足しています。')
      ).toBeInTheDocument();
    });

    it('セッションエラーの場合、適切なメッセージが表示される', () => {
      const sessionError = {
        message: 'session error occurred',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={sessionError} reset={mockReset} />);

      expect(screen.getByText('セッションエラー')).toBeInTheDocument();
      expect(
        screen.getByText('セッションの処理に問題が発生しました。')
      ).toBeInTheDocument();
    });
  });

  describe('エラーの重要度表示', () => {
    it('高重要度エラーの場合、適切なバッジが表示される', () => {
      const highSeverityError = {
        message: 'データベースエラー',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={highSeverityError} reset={mockReset} />);

      expect(screen.getByText('重要')).toBeInTheDocument();
    });

    it('中重要度エラーの場合、適切なバッジが表示される', () => {
      const mediumSeverityError = {
        message: 'ネットワークエラー',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mediumSeverityError} reset={mockReset} />);

      expect(screen.getByText('中程度')).toBeInTheDocument();
    });

    it('低重要度エラーの場合、適切なバッジが表示される', () => {
      const lowSeverityError = {
        message: 'バリデーションエラー',
        name: 'ValidationError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={lowSeverityError} reset={mockReset} />);

      expect(screen.getByText('軽微')).toBeInTheDocument();
    });
  });

  describe('対処法の提案', () => {
    it('データベースエラーの対処法が表示される', () => {
      const dbError = {
        message: 'データベースエラー',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={dbError} reset={mockReset} />);

      expect(screen.getByText('対処法')).toBeInTheDocument();
      expect(
        screen.getByText('しばらく時間をおいてから再度お試しください')
      ).toBeInTheDocument();
      expect(
        screen.getByText('インターネット接続を確認してください')
      ).toBeInTheDocument();
    });

    it('バリデーションエラーの対処法が表示される', () => {
      const validationError = {
        message: 'バリデーションエラー',
        name: 'ValidationError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={validationError} reset={mockReset} />);

      expect(
        screen.getByText('入力内容を確認してください')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ページを再読み込みしてやり直してください')
      ).toBeInTheDocument();
    });
  });

  describe('ボタンの動作', () => {
    it('リトライ可能なエラーの場合、もう一度試すボタンが表示される', () => {
      const retryableError = {
        message: 'データベースエラー',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={retryableError} reset={mockReset} />);

      expect(screen.getByText('もう一度試す')).toBeInTheDocument();
    });

    it('リトライ不可能なエラーの場合、もう一度試すボタンが表示されない', () => {
      const nonRetryableError = {
        message: 'バリデーションエラー',
        name: 'ValidationError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={nonRetryableError} reset={mockReset} />);

      expect(screen.queryByText('もう一度試す')).not.toBeInTheDocument();
    });

    it('もう一度試すボタンがクリックされた時、リトライ処理が実行される', async () => {
      const retryableError = {
        message: 'データベースエラー',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={retryableError} reset={mockReset} />);

      const retryButton = screen.getByText('もう一度試す');
      fireEvent.click(retryButton);

      // ローディング状態の確認
      expect(screen.getByText('再試行中...')).toBeInTheDocument();

      // タイマーを進める
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledTimes(1);
      });
    });

    it('ホームに戻るボタンが表示される', () => {
      const mockError = {
        message: 'テストエラーメッセージ',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
    });

    it('クイズに挑戦ボタンが表示される', () => {
      const mockError = {
        message: 'テストエラーメッセージ',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText('クイズに挑戦')).toBeInTheDocument();
    });

    it('履歴を見るボタンが表示される', () => {
      const mockError = {
        message: 'テストエラーメッセージ',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText('履歴を見る')).toBeInTheDocument();
    });
  });

  describe('リトライ回数の表示', () => {
    it('初回表示時はリトライ回数が表示されない', () => {
      const mockError = {
        message: 'データベースエラー',
        name: 'DatabaseError',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.queryByText(/再試行回数:/)).not.toBeInTheDocument();
    });
  });

  describe('エラーIDの表示', () => {
    it('エラーIDがある場合、表示される', () => {
      const errorWithDigest = {
        message: 'テストエラー',
        name: 'Error',
        stack: '',
        digest: 'test-error-id-123',
      } as Error & { digest?: string };
      render(<Error error={errorWithDigest} reset={mockReset} />);

      expect(screen.getByText('エラーID:')).toBeInTheDocument();
      expect(screen.getByText('test-error-id-123')).toBeInTheDocument();
      expect(
        screen.getByText('サポートにお問い合わせの際は、このIDをお伝えください')
      ).toBeInTheDocument();
    });

    it('エラーIDがない場合、表示されない', () => {
      const errorWithoutDigest = {
        message: 'テストエラー',
        name: 'Error',
        stack: '',
      } as Error & { digest?: string };
      render(<Error error={errorWithoutDigest} reset={mockReset} />);

      expect(screen.queryByText('エラーID:')).not.toBeInTheDocument();
    });
  });

  describe('開発環境での詳細表示', () => {
    // 開発環境のテストはデフォルトのtest環境で実行されるため、
    // 実際の環境変数の変更ではなく、コンポーネントの動作を確認する
    it('エラー詳細セクションの存在確認（test環境）', () => {
      const mockError = {
        message: 'テストエラー',
        name: 'TestError',
        stack: 'Error: テストエラー\n    at test.js:1:1',
        digest: 'test-digest',
      } as Error & { digest?: string };

      render(<Error error={mockError} reset={mockReset} />);

      // test環境では開発環境の詳細は表示されないが、エラーIDは表示される
      expect(screen.getByText('エラーID:')).toBeInTheDocument();
      expect(screen.getByText('test-digest')).toBeInTheDocument();
      expect(
        screen.getByText('サポートにお問い合わせの際は、このIDをお伝えください')
      ).toBeInTheDocument();
    });

    it('エラーIDがない場合は詳細セクションが表示されない', () => {
      const mockError = {
        message: 'テストエラー',
        name: 'TestError',
        stack: 'Error: テストエラー\n    at test.js:1:1',
      } as Error & { digest?: string };

      render(<Error error={mockError} reset={mockReset} />);

      // エラーIDがない場合は詳細セクションが表示されない
      expect(screen.queryByText('エラーID:')).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'サポートにお問い合わせの際は、このIDをお伝えください'
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('エラーログの記録', () => {
    it('エラーが発生した時、コンソールにログが記録される', () => {
      const mockError = {
        message: 'テストエラー',
        name: 'Error',
        stack: 'test stack',
      } as Error & { digest?: string };
      render(<Error error={mockError} reset={mockReset} />);

      expect(console.error).toHaveBeenCalledWith(
        'アプリケーションエラーが発生しました:',
        expect.objectContaining({
          message: 'テストエラー',
          stack: 'test stack',
          timestamp: expect.any(String),
          retryCount: 0,
        })
      );
    });
  });
});
