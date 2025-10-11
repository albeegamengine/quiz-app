/**
 * カスタムエラークラス - データベースエラー
 */
export class DatabaseError extends Error {
  constructor(
    message: string, 
    public originalError?: unknown,
    public errorCode?: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * カスタムエラークラス - バリデーションエラー
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * カスタムエラークラス - データ不足エラー
 */
export class InsufficientDataError extends Error {
  constructor(
    message: string,
    public requiredCount?: number,
    public actualCount?: number
  ) {
    super(message);
    this.name = 'InsufficientDataError';
  }
}

/**
 * カスタムエラークラス - ネットワークエラー
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}