# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "クイズアプリのホームページに移動" [ref=e6] [cursor=pointer]:
        - /url: /
        - text: クイズアプリ
      - navigation "メインナビゲーション" [ref=e7]:
        - link "ホームページに移動" [ref=e8] [cursor=pointer]:
          - /url: /
          - text: ホーム
        - link "クイズ履歴ページに移動" [ref=e9] [cursor=pointer]:
          - /url: /history
          - text: 履歴
  - main [ref=e10]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "クイズ履歴" [level=3] [ref=e14]
        - paragraph [ref=e15]: 過去のクイズ結果を確認できます
      - generic [ref=e18]: 読み込み中...
  - button "Open Next.js Dev Tools" [ref=e24] [cursor=pointer]:
    - img [ref=e25]
  - alert [ref=e29]
```