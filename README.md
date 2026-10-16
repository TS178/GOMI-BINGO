# 海ゴミBINGO！

GitHubへの登録・配布用フォルダーです。2026年10月16日時点のアプリを収録しています。

## 使用方法

このフォルダーの**中身すべて**をリポジトリのルートへ入れてください。`index.html`と`assets/`・`fonts/`を同じ階層に保ってください。

```text
index.html
ui.css
opening.css
opening.js
tile-icons.js
logo-assets.js
game-effects.js
quiz-visuals.js
player-profile.js
assets/
  badges/
  categories/
  logo/
  photos/
  quiz/
fonts/
  NotoSansJP-Variable.ttf
  OFL.txt
.gitignore
README.md
```

`index.html`をブラウザーで開くと起動します。ビルドやパッケージのインストールは不要です。

ごみずかんには、指定HTMLから取り出した実写写真8点（`assets/photos/`）を使用しています。ビンゴ盤面・問題・解説のイラストもすべて同梱しています。

画像とフォントを含むため、フォルダー全体で約150MBあります。確認用スクリーンショットや開発用テストは含めていません。

名前と進行状況は各利用者のブラウザーへ保存され、配布ファイルには書き込まれません。異なる端末・URLでは保存内容が共有されません。

フォントはNoto Sans JPです。配布時には`fonts/OFL.txt`も含めてください。
