# 技術規約

## フレームワーク・ライブラリ

### Next.js

- Next.js 15+ App Routerを使用する
- React Server Components (RSC) + Client Componentsのハイブリッド構成
- Server Actionsを使用してサーバーサイド処理を実装する
- ファイルベースルーティングを活用する

### React

- React 19+を使用する
- 関数コンポーネントとHooksを基本とする
- TypeScriptで型安全性を確保する
- アクセシビリティ（ARIA属性、キーボードナビゲーション）を考慮する

### TypeScript

- 厳密な型定義を行う
- インターフェースと型エイリアスを適切に使い分ける
- `src/types/`ディレクトリに型定義を集約する
- `any`型の使用は最小限に抑える

## データベース・ORM

### Prisma

- Prisma ORMを使用してデータベースアクセスを管理する
- `prisma/schema.prisma`でスキーマを定義する
- マイグレーションファイルでデータベース変更を管理する
- シードファイル（`prisma/seed.ts`）でテストデータを管理する

### Neon PostgreSQL

- Neon（PostgreSQL互換）を本番データベースとして使用する
- 環境変数`DATABASE_URL`で接続情報を管理する
- サーバーレスアーキテクチャに最適化されたコネクションプーリングを活用する

## UI・スタイリング

### Tailwind CSS

- Tailwind CSS v4を使用してスタイリングを行う
- レスポンシブデザインを必須とする（モバイル・タブレット・デスクトップ対応）
- カスタムCSSは最小限に抑え、Tailwindのユーティリティクラスを優先する

### shadcn/ui

- shadcn/uiコンポーネントライブラリを使用する
- `src/components/ui/`ディレクトリにコンポーネントを配置する
- Radix UIベースのアクセシブルなコンポーネントを活用する
- カスタマイズが必要な場合はshadcn/uiコンポーネントを拡張する

## 開発ツール

### ESLint・Prettier

- ESLint v9でコード品質を管理する
- Prettierでコードフォーマットを統一する
- Next.js推奨設定を基本とする
- TypeScript、React、Next.js固有のルールを適用する

### 環境変数管理

- `.env.local`ファイルで環境変数を管理する
- `.env.local`は`.gitignore`に含める
- 本番環境ではVercelの環境変数設定を使用する

## パフォーマンス・セキュリティ

### パフォーマンス

- React Server Componentsで初期ロードを最適化する
- 動的インポートでコード分割を行う
- Next.js Imageコンポーネントで画像最適化を行う

### セキュリティ

- Server Actionsでサーバーサイド処理を安全に実装する
- Prismaのパラメータ化クエリでSQLインジェクションを防ぐ
- 環境変数で機密情報を管理し、クライアントサイドに露出しない
- 入力値のバリデーションを必ず実装する

## ビルド・デプロイ

### Vercel

- Vercelを使用してデプロイする
- GitHubとの連携で自動デプロイを設定する
- プレビューデプロイメントでPR確認を行う
- 環境変数はVercelダッシュボードで管理する

### ビルド設定

- `npm run build`でプロダクションビルドを実行する
- Turbopackを使用してビルド速度を向上させる
- Prisma Clientの生成を自動化する
