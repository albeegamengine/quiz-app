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
    - generic [ref=e14]:
      - heading "エラーが発生しました" [level=2] [ref=e15]
      - paragraph [ref=e16]: Failed to fetch
      - generic [ref=e17]:
        - button "再試行" [ref=e18]
        - button "ホームに戻る" [ref=e19]
  - generic [ref=e24] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e25]:
      - img [ref=e26]
    - generic [ref=e29]:
      - button "Open issues overlay" [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: "0"
          - generic [ref=e33]: "1"
        - generic [ref=e34]: Issue
      - button "Collapse issues badge" [ref=e35]:
        - img [ref=e36]
  - alert [ref=e38]
```