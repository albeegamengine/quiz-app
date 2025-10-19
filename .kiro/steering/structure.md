# プロジェクト構造規約

## ディレクトリ構成

### 基本構造

```
quiz-app/
├── src/                    # ソースコード
│   ├── app/               # Next.js App Router（ページ）
│   ├── components/        # Reactコンポーネント
│   ├── lib/              # ユーティリティ・ヘルパー
│   └── types/            # TypeScript型定義
├── prisma/               # データベース関連
├── e2e/                  # E2Eテスト
├── public/               # 静的ファイル
└── 設定ファイル群
```

## src/app/ ディレクトリ（Next.js App Router）

### ページ構成

- `page.tsx` - ホーム画面
- `quiz/page.tsx` - クイズ画面
- `result/page.tsx` - 結果画面
- `history/page.tsx` - 履歴画面
- `layout.tsx` - 共通レイアウト
- `loading.tsx` - ローディング画面
- `error.tsx` - エラー画面
- `not-found.tsx` - 404画面

### ファイル命名規則

- ページファイル: `page.tsx`
- レイアウトファイル: `layout.tsx`
- ローディングファイル: `loading.tsx`
- エラーファイル: `error.tsx`
- 404ファイル: `not-found.tsx`

## src/components/ ディレクトリ

### 階層構造

```
components/
├── ui/                   # shadcn/uiコンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── quiz/                 # クイズ関連コンポーネント
│   ├── QuizQuestion.tsx
│   ├── QuestionProgress.tsx
│   └── ...
├── layout/               # レイアウトコンポーネント
│   ├── Header.tsx
│   └── ...
└── common/               # 共通コンポーネント
    ├── ScoreCard.tsx
    └── ...
```

### コンポーネント命名規則

- PascalCaseを使用する（例: `QuizQuestion.tsx`）
- 機能を明確に表す名前を付ける
- ディレクトリ名は小文字を使用する（例: `quiz/`, `layout/`）

## src/lib/ ディレクトリ

### 構成

```
lib/
├── actions/              # Server Actions
│   └── quiz.ts
├── db.ts                # Prismaクライアント
├── utils.ts             # 汎用ユーティリティ
├── session.ts           # セッション管理
└── errors.ts            # カスタムエラークラス
```

### ファイルの役割

- `actions/` - Next.js Server Actionsを配置
- `db.ts` - Prismaクライアントのシングルトンインスタンス
- `utils.ts` - shadcn/uiのcn関数など汎用ユーティリティ
- `session.ts` - セッションID管理機能
- `errors.ts` - カスタムエラークラス定義

## src/types/ ディレクトリ

### 型定義の分類

```
types/
├── quiz.ts              # クイズ関連の型定義
└── index.ts             # 共通型定義（必要に応じて）
```

### 型定義規則

- 機能ごとにファイルを分ける
- インターフェースは`interface`キーワードを使用
- 型エイリアスは`type`キーワードを使用
- エクスポートは名前付きエクスポートを使用

## prisma/ ディレクトリ

### 構成

```
prisma/
├── schema.prisma         # データベーススキーマ
├── seed.ts              # シードデータ
└── migrations/          # マイグレーションファイル
    └── [timestamp]_[name]/
        └── migration.sql
```

### ファイルの役割

- `schema.prisma` - データベーススキーマ定義
- `seed.ts` - 初期データ・テストデータの投入
- `migrations/` - データベース変更履歴

## テストファイル配置

### 単体テスト

- コンポーネントと同じディレクトリに配置
- ファイル名: `[ComponentName].test.tsx`
- 例: `src/components/quiz/QuizQuestion.test.tsx`

### E2Eテスト

- `e2e/` ディレクトリに配置
- ファイル名: `[feature].spec.ts`
- 例: `e2e/quiz-flow.spec.ts`

## 設定ファイル

### 主要設定ファイル

- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - TypeScript設定
- `next.config.ts` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `components.json` - shadcn/ui設定
- `eslint.config.mjs` - ESLint設定
- `jest.config.js` - Jest設定
- `playwright.config.ts` - Playwright設定

### 環境設定ファイル

- `.env.local` - ローカル環境変数（gitignore対象）
- `.gitignore` - Git除外設定
- `.prettierrc` - Prettier設定

## インポート規則

### パスエイリアス

- `@/` - `src/` ディレクトリのエイリアス
- 例: `import { Button } from '@/components/ui/button'`

### インポート順序

1. React関連
2. 外部ライブラリ
3. 内部コンポーネント（@/components）
4. 内部ユーティリティ（@/lib）
5. 型定義（@/types）
6. 相対パス

## ファイル命名規則

### 一般規則

- TypeScriptファイル: `.ts`, `.tsx`
- コンポーネントファイル: PascalCase（例: `QuizQuestion.tsx`）
- ユーティリティファイル: camelCase（例: `session.ts`）
- 設定ファイル: kebab-case（例: `next.config.ts`）

### 特殊ファイル

- Next.jsページ: `page.tsx`
- Next.jsレイアウト: `layout.tsx`
- テストファイル: `[name].test.tsx` または `[name].spec.ts`
