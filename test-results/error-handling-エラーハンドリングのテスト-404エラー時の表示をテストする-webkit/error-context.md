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
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic:
          - img
        - heading "404 - ページが見つかりません" [level=3] [ref=e15]
        - paragraph [ref=e16]: お探しのページは存在しないか、移動された可能性があります。
      - generic [ref=e17]:
        - generic [ref=e18]:
          - link "ホームに戻る" [ref=e19]:
            - /url: /
          - link "クイズに挑戦する" [ref=e20]:
            - /url: /quiz
          - link "履歴を見る" [ref=e21]:
            - /url: /history
        - paragraph [ref=e23]: 問題が解決しない場合は、ブラウザを再読み込みしてください。
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e35]
```