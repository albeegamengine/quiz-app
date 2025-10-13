# 設計書

## 概要

本ドキュメントは、Webブラウザ上で動作するクイズアプリケーションの技術設計を定義します。Next.jsをフルスタックフレームワークとして採用し、TypeScript、React、Tailwind CSS、shadcn/uiを使用してモダンなUIを構築します。データベースにはNeonを使用し、Prisma ORMでデータアクセスを管理します。

### 技術スタック

- **フロントエンド**: React 19+ with Next.js 15+ (App Router)
- **スタイリング**: Tailwind CSS + shadcn/ui
- **バックエンド**: Next.js API Routes (Server Actions)
- **データベース**: Neon (PostgreSQL互換、無料プラン対応)
- **ORM**: Prisma
- **言語**: TypeScript
- **バージョン管理**: Git
- **テスト**:
  - E2E: Playwright
  - 単体テスト: Jest + React Testing Library
  - 結合テスト: Jest
- **リンター**: ESLint + Prettier
- **デプロイ**: Vercel

### データベース選定理由

- **Neon**: PostgreSQL互換で無料プランが充実、Next.jsとの統合が容易、サーバーレスアーキテクチャに最適

### ユーザー管理方針

現バージョンでは**ユーザー認証機能は実装しない**方針とします。スコア履歴は以下の方法で管理します：

- **セッションID**: ブラウザのlocalStorageまたはcookieでセッションIDを生成・保持
- **匿名ユーザー**: セッションIDに紐づけてスコアを保存
- **履歴表示**: 同一セッションIDの履歴のみ表示

この設計により、ユーザー登録なしでシンプルに動作し、将来的にユーザー認証を追加する際もマイグレーションが容易です。

## アーキテクチャ

### システム構成

```
quiz-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # ホーム画面
│   │   ├── quiz/
│   │   │   └── page.tsx       # クイズ画面
│   │   ├── result/
│   │   │   └── page.tsx       # 結果画面
│   │   ├── history/
│   │   │   └── page.tsx       # 履歴画面
│   │   ├── layout.tsx         # 共通レイアウト
│   │   └── api/               # API Routes (必要に応じて)
│   ├── components/            # Reactコンポーネント
│   │   ├── ui/               # shadcn/ui コンポーネント
│   │   ├── quiz/             # クイズ関連コンポーネント
│   │   ├── layout/           # レイアウトコンポーネント
│   │   └── common/           # 共通コンポーネント
│   ├── lib/                   # ユーティリティ・ヘルパー
│   │   ├── db.ts             # Prismaクライアント
│   │   ├── utils.ts          # 汎用ユーティリティ
│   │   └── actions/          # Server Actions
│   ├── types/                 # TypeScript型定義
│   └── styles/                # グローバルスタイル
├── prisma/
│   ├── schema.prisma         # データベーススキーマ
│   └── seed.ts               # シードデータ
├── e2e/                       # Playwrightテスト
├── public/                    # 静的ファイル
└── .env.local                # 環境変数（gitignore対象）
```

### アーキテクチャパターン

- **フロントエンド**: React Server Components (RSC) + Client Components
- **データフェッチング**: Next.js Server Actions
- **状態管理**: React useState/useReducer (クライアント側)、Server Actionsでサーバー側処理
- **ルーティング**: Next.js App Router (ファイルベースルーティング)

## コンポーネントとインターフェース

### ページコンポーネント

#### 1. ホーム画面 (`app/page.tsx`)

**責務**: アプリのエントリーポイント、クイズ開始と履歴閲覧への導線

**主要機能**:

- クイズ開始ボタン
- 履歴閲覧ボタン
- アプリの説明表示

**使用するshadcn/uiコンポーネント**: Button, Card

#### 2. クイズ画面 (`app/quiz/page.tsx`)

**責務**: クイズの表示、回答の受付、正誤判定のフィードバック

**主要機能**:

- 質問と選択肢の表示
- 進捗表示（現在の質問番号/総質問数）
- 回答選択・入力
- 正誤フィードバック表示
- 次の質問への遷移
- ローディング状態の表示

**状態管理**:

```typescript
interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  isAnswered: boolean;
  isLoading: boolean;
}
```

**使用するshadcn/uiコンポーネント**: Button, Card, RadioGroup, Input, Progress, Badge

#### 3. 結果画面 (`app/result/page.tsx`)

**責務**: クイズ結果の表示、スコアの保存

**主要機能**:

- スコア表示（正解数、不正解数、正解率）
- 各質問の正誤詳細表示
- もう一度挑戦ボタン
- ホームに戻るボタン

**使用するshadcn/uiコンポーネント**: Button, Card, Table, Badge

#### 4. 履歴画面 (`app/history/page.tsx`)

**責務**: 過去のクイズ結果一覧の表示

**主要機能**:

- 過去の結果一覧表示（日時、スコア、正解率）
- 最新順でソート
- 空状態の表示

**使用するshadcn/uiコンポーネント**: Card, Table, Badge

### UIコンポーネント

#### QuizQuestion コンポーネント

**責務**: 単一の質問と選択肢を表示

**Props**:

```typescript
interface QuizQuestionProps {
  question: Question;
  onAnswer: (answerId: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string;
  correctAnswer: string;
}
```

#### QuestionProgress コンポーネント

**責務**: クイズの進捗を表示

**Props**:

```typescript
interface QuestionProgressProps {
  current: number;
  total: number;
}
```

#### ScoreCard コンポーネント

**責務**: スコア情報を視覚的に表示

**Props**:

```typescript
interface ScoreCardProps {
  correct: number;
  incorrect: number;
  total: number;
}
```

### レイアウトコンポーネント

#### Header コンポーネント

**責務**: 全ページ共通のヘッダー、ナビゲーション

**機能**:

- アプリタイトル
- ホームへのリンク

#### Layout (`app/layout.tsx`)

**責務**: 全ページ共通のレイアウト、メタデータ

**機能**:

- HTMLメタタグ設定
- グローバルスタイル適用
- フォント設定

## データモデル

### Prismaスキーマ

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Question {
  id          String   @id @default(cuid())
  text        String
  type        QuestionType @default(MULTIPLE_CHOICE)
  options     String[]
  correctAnswer String
  explanation String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("questions")
}

enum QuestionType {
  MULTIPLE_CHOICE
  TEXT_INPUT
}

model QuizResult {
  id          String   @id @default(cuid())
  sessionId   String   // ブラウザセッションID（匿名ユーザー識別用）
  score       Int
  totalQuestions Int
  correctCount Int
  incorrectCount Int
  accuracy    Float
  answers     Json     // 各質問の回答詳細を保存
  completedAt DateTime @default(now())

  @@index([sessionId])
  @@map("quiz_results")
}
```

### TypeScript型定義

```typescript
// src/types/quiz.ts

export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  answers: Answer[];
  completedAt: Date;
}

export interface QuizSession {
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
}
```

## Server Actions

### クイズデータ取得

```typescript
// src/lib/actions/quiz.ts

'use server';

export async function getQuizQuestions(): Promise<Question[]> {
  // データベースからランダムに10問取得
  // エラーハンドリング含む
}
```

### 結果保存

```typescript
'use server';

export async function saveQuizResult(
  answers: Answer[],
  questions: Question[]
): Promise<QuizResult> {
  // スコア計算
  // データベースに保存
  // 結果を返す
}
```

### 履歴取得

```typescript
'use server';

export async function getQuizHistory(sessionId: string): Promise<QuizResult[]> {
  // セッションIDに紐づく履歴を取得（最新順）
  // 最大50件まで
}
```

### セッションID管理

```typescript
// src/lib/session.ts

export function getOrCreateSessionId(): string {
  // localStorageからセッションIDを取得
  // 存在しない場合は新規生成（UUID）
  // localStorageに保存
}
```

## エラーハンドリング

### エラーの種類と対応

1. **データベース接続エラー**
   - エラーバウンダリーでキャッチ
   - ユーザーフレンドリーなメッセージ表示
   - リトライボタンの提供

2. **データ取得エラー**
   - Server Actionでtry-catchによるエラーハンドリング
   - エラーメッセージをクライアントに返す
   - フォールバック表示

3. **バリデーションエラー**
   - Zodを使用した入力検証
   - フォームフィードバックの表示

### エラーコンポーネント

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

## テスト戦略

### 単体テスト (Jest + React Testing Library)

**対象**:

- Reactコンポーネント（UIロジック）
- ユーティリティ関数
- Server Actions（モック使用）

**テストケース例**:

1. **QuizQuestionコンポーネント**
   - 質問と選択肢が正しく表示される
   - 選択肢クリック時にonAnswerが呼ばれる
   - 正解時に緑色のフィードバックが表示される
   - 不正解時に赤色のフィードバックが表示される

2. **ScoreCardコンポーネント**
   - スコア情報が正しく表示される
   - 正解率が正しく計算される

3. **セッション管理関数**
   - セッションIDが正しく生成される
   - localStorageへの保存・取得が正しく動作する

**テストファイル構成**:

```
src/
├── components/
│   └── quiz/
│       ├── QuizQuestion.tsx
│       └── QuizQuestion.test.tsx
└── lib/
    ├── session.ts
    └── session.test.ts
```

### 結合テスト (Jest)

**対象**:

- Server Actionsとデータベースの統合
- 複数コンポーネント間の連携

**テストケース例**:

1. **クイズデータ取得フロー**
   - データベースから質問が正しく取得される
   - ランダム取得が機能する
   - エラー時に適切なエラーが返される

2. **スコア保存フロー**
   - 回答データが正しく計算される
   - データベースに正しく保存される
   - セッションIDが正しく紐づけられる

**テスト環境**:

- テスト用データベース（Neon BranchまたはローカルPostgreSQL）
- Prismaのテストヘルパー使用

### E2Eテスト (Playwright)

**テストシナリオ**:

1. **クイズフロー全体**
   - ホーム画面からクイズ開始
   - 全問回答
   - 結果画面の確認
   - スコアがデータベースに保存されることを確認

2. **回答フィードバック**
   - 正解時に緑色のフィードバック表示
   - 不正解時に赤色のフィードバック表示
   - 解説の表示

3. **履歴機能**
   - 履歴ページへの遷移
   - 過去の結果が表示されること
   - 空状態の表示

4. **レスポンシブデザイン**
   - モバイル、タブレット、デスクトップでの表示確認
   - ビューポートサイズ変更時のレイアウト崩れチェック

5. **エラーハンドリング**
   - データベース接続エラー時の表示
   - ネットワークエラー時の挙動

### テストファイル構成

```
e2e/
├── quiz-flow.spec.ts
├── history.spec.ts
├── responsive.spec.ts
└── error-handling.spec.ts
```

### テスト実行コマンド

```bash
# 単体テスト
npm run test

# 単体テスト（watch mode）
npm run test:watch

# カバレッジ
npm run test:coverage

# 結合テスト
npm run test:integration

# E2Eテスト
npx playwright test

# E2Eテスト（UI mode）
npx playwright test --ui
```

## セキュリティとパフォーマンス

### セキュリティ

- 環境変数による機密情報管理（`.env.local`）
- `.gitignore`に`.env.local`を追加
- Server Actionsによるサーバーサイド処理（クライアントにDBアクセス情報を露出しない）
- Prismaによるパラメータ化クエリ（SQLインジェクション対策）

### パフォーマンス

- React Server Componentsによる初期ロード最適化
- 画像最適化（Next.js Image コンポーネント）
- 動的インポートによるコード分割
- Neonのコネクションプーリング活用

## デプロイメント

### デプロイ先: Vercel

**選定理由**:

- Next.jsの開発元が提供するプラットフォーム
- ゼロコンフィグでNext.jsアプリをデプロイ可能
- 自動的にプレビューデプロイメント生成
- 無料プランで十分な機能
- Neonとの統合が容易
- Edge Functionsサポート

### デプロイ手順

1. GitHubリポジトリと連携
2. Vercelプロジェクト作成
3. 環境変数設定（DATABASE_URL）
4. 自動デプロイ設定（mainブランチへのpush時）

### 環境変数

```bash
# .env.local (ローカル開発用)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]

# Vercel環境変数（本番環境）
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
```

### CI/CD

- **自動デプロイ**: GitHubへのpush時に自動デプロイ
- **プレビュー環境**: プルリクエスト作成時に自動生成
- **本番デプロイ**: mainブランチマージ時

## 開発フロー

### 初期セットアップ

1. Next.jsプロジェクト作成
2. 依存パッケージインストール（Prisma、shadcn/ui、Tailwind CSS等）
3. Neonデータベース作成
4. Prismaスキーマ定義
5. マイグレーション実行
6. シードデータ投入
7. 環境変数設定

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Prismaマイグレーション
npx prisma migrate dev

# シードデータ投入
npx prisma db seed

# 単体テスト
npm run test

# E2Eテスト実行
npx playwright test

# リンター
npm run lint

# フォーマット
npm run format

# ビルド
npm run build

# 本番環境で起動
npm run start
```

## 今後の拡張性

- 要件定義・技術スタックにbunを追加
- 問題追加
- 動作確認と修正
- 4択クイズで正解を選択しても必ず不正解になってしまう
- デザイン改善
- UI改善
- アイコン作成
- アイコン実装
- ユーザー認証機能（NextAuth.js）
- クイズカテゴリー機能
- 難易度設定
- タイマー機能
- ランキング機能
- クイズ作成機能（管理画面）
