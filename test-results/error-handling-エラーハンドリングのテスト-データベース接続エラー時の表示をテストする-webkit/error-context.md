# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "クイズアプリのホームページに移動" [ref=e6]:
        - /url: /
        - text: クイズアプリ
      - navigation "メインナビゲーション" [ref=e7]:
        - link "ホームページに移動" [ref=e8]:
          - /url: /
          - text: ホーム
        - link "クイズ履歴ページに移動" [ref=e9]:
          - /url: /history
          - text: 履歴
  - main [ref=e10]:
    - generic [ref=e14]:
      - heading "エラーが発生しました" [level=2] [ref=e15]
      - paragraph [ref=e16]: An unexpected response was received from the server.
      - generic [ref=e17]:
        - button "再試行" [ref=e18]
        - button "ホームに戻る" [ref=e19]
  - generic [ref=e24] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e25]:
      - img [ref=e26]
    - generic [ref=e31]:
      - button "Open issues overlay" [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: "0"
          - generic [ref=e35]: "1"
        - generic [ref=e36]: Issue
      - button "Collapse issues badge" [ref=e37]:
        - img [ref=e38]
  - alert [ref=e40]
```