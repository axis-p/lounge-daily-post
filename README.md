# lounge-daily-post

パズルラウンジの「今日の一問」の予告カードを毎朝作り、Buffer を通して X に投稿する仕組みです。

## 毎日の流れ

1. 毎晩 0:20（日本時間）に GitHub Actions が動き、6 つのゲームの予告カードを `images/<日付>/` に作ります。
2. その画像をこのリポジトリに保存します。Buffer は画像を URL で受け取るので、リポジトリは公開にしています。
3. 実行画面に、6 枚の画像と投稿文を並べて止まります。**承認（Review deployments → Approve）を押すまで投稿されません。**
4. 承認すると、Buffer に「朝 7:00 に投稿」として予約を入れます（7:00 を過ぎていたら承認の 10 分後）。目玉の 1 枚を本投稿にし、残りの 5 枚はそのスレッドに続けます。目玉は曜日ごとに替わります（月 ナンプレ、火 マインスイーパー、水 ノノグラム、木 ループ、金 タングラム、土日 ジグソー）。

カードに載るのは、日付、問題の番号、難しさだけです。マインスイーパー、タングラム、ノノグラム、ループの今日の盤面はサーバーで秘密になっていて、カードにも出しません。先に解いておくズルでランキングが崩れないようにするためです。ジグソーだけは、今日の絵を載せます（遊ぶ前に誰でも見られる絵です）。

カードを作るときは、本番のページを読むだけで、何も書き込みません。読み込み以外の通信と、アクセス解析は止めています。

## 自動投稿を始めるまでの準備（あなたの作業）

毎晩の実行画面（Actions → morning）に、その日の画像と文面が並びます。

1. **Buffer**（https://buffer.com）のアカウントを作り、X の @puzzlelounge をつなぎます。
2. **Buffer の API キー**を作ります（https://publish.buffer.com/settings/api）。
3. GitHub のこのリポジトリの **Settings → Secrets and variables → Actions** に入れます。
   - **Secrets** に `BUFFER_API_KEY`（キーそのもの）。キーは Claude に見せないでください。
4. X のチャンネル ID を調べます。キーを入れたあと、Actions の「channels」を手で動かすと一覧が出ます。
5. 同じ画面の **Variables** に `BUFFER_X_CHANNEL`（4 で調べた X のチャンネル ID）を入れます。
6. 毎日の投稿は、承認したものだけが出ます（環境 `x-post`、承認する人は axis-p）。承認しなければその日は出ません。

## 手で動かす

- Actions → **morning** → Run workflow：日付を空にすると今日の分を作り、承認待ちで止まります。
- Actions → **channels** → Run workflow：Buffer につながっているチャンネルの一覧を出します。
- Actions → **cancel** → Run workflow：予約した投稿を ID で取り消します（ID は morning の記録の「scheduled on X:」の後ろ）。

手元で試すときは、`CHROME_PATH` に Chrome の場所を入れて `node src/morning.mjs`、文面だけなら `node src/post.mjs` を動かします。

## これから

- 前の日の盤面・答え・最速タイムの投稿（別の時間に、ふつうの投稿として）
- Instagram（6 枚をまとめた投稿）と YouTube ショート
- 毎週の数字のまとめ（Buffer の分析、GA、Search Console）
