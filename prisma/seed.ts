import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('シードデータの投入を開始します...')

  // データベース接続をテスト
  try {
    await prisma.$connect()
    console.log('データベースに接続しました')
  } catch (error) {
    console.error('データベース接続に失敗しました:', error)
    throw error
  }

  // 既存のデータをクリア（エラーが発生しても続行）
  try {
    await prisma.question.deleteMany()
    console.log('既存の質問データをクリアしました')
  } catch (error) {
    console.log('既存データのクリアをスキップしました（テーブルが存在しないか、データがない可能性があります）')
  }

  // サンプルクイズデータ
  const questions = [
    // 複数選択式の質問
    {
      text: 'JavaScriptで変数を宣言するキーワードはどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['var', 'let', 'const', 'すべて正解'],
      correctAnswer: 'すべて正解',
      explanation: 'JavaScript では var、let、const のすべてが変数宣言に使用できます。ES6以降では let と const の使用が推奨されています。'
    },
    {
      text: 'Reactでコンポーネントをレンダリングするためのメソッドはどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['render()', 'display()', 'show()', 'mount()'],
      correctAnswer: 'render()',
      explanation: 'React では render() メソッドを使用してコンポーネントをレンダリングします。'
    },
    {
      text: 'CSSでフレックスボックスを有効にするプロパティはどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['display: flex', 'flex: true', 'flexbox: on', 'layout: flex'],
      correctAnswer: 'display: flex',
      explanation: 'CSS でフレックスボックスレイアウトを有効にするには display: flex を使用します。'
    },
    {
      text: 'HTTPステータスコード404は何を意味しますか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['サーバーエラー', 'リソースが見つからない', '認証が必要', 'リクエストが無効'],
      correctAnswer: 'リソースが見つからない',
      explanation: 'HTTP ステータスコード 404 は「Not Found」を意味し、要求されたリソースがサーバー上に見つからないことを示します。'
    },
    {
      text: 'TypeScriptの主な利点はどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['静的型チェック', '実行速度の向上', 'ファイルサイズの削減', 'ブラウザ互換性'],
      correctAnswer: '静的型チェック',
      explanation: 'TypeScript の主な利点は静的型チェックにより、コンパイル時にエラーを検出できることです。'
    },
    {
      text: 'Next.jsのApp Routerで使用されるファイル名はどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['index.js', 'page.tsx', 'route.tsx', 'component.tsx'],
      correctAnswer: 'page.tsx',
      explanation: 'Next.js の App Router では page.tsx（または page.js）がページコンポーネントとして認識されます。'
    },
    {
      text: 'Gitでコミットを作成するコマンドはどれですか？',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['git add', 'git commit', 'git push', 'git merge'],
      correctAnswer: 'git commit',
      explanation: 'Git でコミットを作成するには git commit コマンドを使用します。'
    },

    // テキスト入力式の質問
    {
      text: 'HTMLで段落を表すタグ名を入力してください（<>は不要）',
      type: QuestionType.TEXT_INPUT,
      options: [], // テキスト入力式では選択肢は空配列
      correctAnswer: 'p',
      explanation: 'HTML で段落を表すタグは <p> です。paragraph の略です。'
    },
    {
      text: 'CSSで背景色を設定するプロパティ名を入力してください',
      type: QuestionType.TEXT_INPUT,
      options: [],
      correctAnswer: 'background-color',
      explanation: 'CSS で背景色を設定するプロパティは background-color です。'
    },
    {
      text: 'JavaScriptで配列の長さを取得するプロパティ名を入力してください',
      type: QuestionType.TEXT_INPUT,
      options: [],
      correctAnswer: 'length',
      explanation: 'JavaScript の配列で要素数を取得するには length プロパティを使用します。'
    },
    {
      text: 'SQLでデータを取得するコマンドを入力してください（大文字小文字は問いません）',
      type: QuestionType.TEXT_INPUT,
      options: [],
      correctAnswer: 'SELECT',
      explanation: 'SQL でデータを取得するには SELECT 文を使用します。'
    },
    {
      text: 'Reactでコンポーネントの状態を管理するフック名を入力してください',
      type: QuestionType.TEXT_INPUT,
      options: [],
      correctAnswer: 'useState',
      explanation: 'React でコンポーネントの状態を管理するには useState フックを使用します。'
    },
    {
      text: 'HTTPメソッドでデータを作成する際に使用するメソッド名を入力してください',
      type: QuestionType.TEXT_INPUT,
      options: [],
      correctAnswer: 'POST',
      explanation: 'HTTP でデータを作成する際は POST メソッドを使用します。'
    }
  ]

  // データベースに質問を挿入
  for (const question of questions) {
    await prisma.question.create({
      data: question
    })
  }

  console.log(`${questions.length}問のクイズデータを投入しました`)
  console.log('シードデータの投入が完了しました')
}

main()
  .catch((e) => {
    console.error('シードデータの投入中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })