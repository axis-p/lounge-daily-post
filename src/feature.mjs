// The one card a morning leads with, drawn to stop a puzzle solver's thumb: tall (4:5) so it fills
// a phone's timeline, the day and how hard in the largest type, a line a solver answers to, and
// what the game is for those who have not met the Lounge. Only things that are true of the
// game are claimed (mines is the one checked to need no guess); never a rate or a count we have
// not measured.
import { GAMES, dateLabel } from "./games.mjs";
import { ART, jigsawArt } from "./cards.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** The line under the headline: a challenge to a solver, in their words. */
export function challenge(game, day, jigsaw) {
  switch (game) {
    case "nanpure":
      return { やさしい: "目標 5 分 解けたら次は「ふつう」へ", ふつう: "目標 10 分 テクニックはヒントで", むずかしい: "目標 20 分 仮置きせずに解ける？", 鬼: "30 分切れたら上級者" }[day.headline] ?? "何分で解けた？";
    case "mines":
      return "地雷 99 個 二択なし 推理だけで全部見抜ける？";
    case "nonogram":
      return "15×15 数字から 何の模様が出てくる？";
    case "loop":
      return "数字をたよりに 一本の輪にできる？";
    case "tangram":
      return "7 枚の板で 今日のかたちを作れる？";
    case "jigsaw":
      return `${(jigsaw.conditions.match(/\d+/) ?? ["108"])[0]} ピース 何分で組める？`;
  }
}

/** What the game is, for someone who has never played it here. */
const PITCH = {
  nanpure: "毎日 0 時に変わる みんな同じ一問",
  mines: "推理だけで解けるマインスイーパー",
  nonogram: "数字から絵を描き出すロジックパズル",
  loop: "点と点をつなぐロジックパズル",
  tangram: "シルエットパズル・毎日新しいかたち",
  jigsaw: "名画や絶景を ブラウザで組むジグソー",
};

export function featureHtml(game, date, day, jigsaw) {
  const g = GAMES[game];
  const isJigsaw = game === "jigsaw";
  const headline = isJigsaw ? jigsaw.title : day.headline;
  // The headline as large as its width allows: one line for a level or a No., two for a title.
  const size = headline.length <= 6 ? Math.min(190, Math.floor(920 / headline.length)) : 92;
  const ink = g.color === "#f5b83d" ? "#9a6a06" : g.color;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700;900&family=M+PLUS+Rounded+1c:wght@800&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1080px; height: 1350px; }
  body { background: #f6f5f2; color: #1e222a; font-family: "Noto Sans JP", "Noto Sans CJK JP", sans-serif; position: relative; overflow: hidden; }
  .round { font-family: "M PLUS Rounded 1c", "Noto Sans JP", sans-serif; font-weight: 800; }
  .band { position: absolute; left: 0; right: 0; top: 0; height: 420px; background: ${g.wash}; }
  .blob { position: absolute; border-radius: 50%; background: #fff; opacity: .55; }
  .top { position: absolute; left: 72px; right: 72px; top: 64px; display: flex; align-items: center; justify-content: space-between; }
  .kicker { font-size: 44px; color: ${ink}; letter-spacing: .04em; }
  .date { font-size: 34px; font-weight: 700; color: #4d5361; }
  .column { position: absolute; left: 72px; right: 72px; top: 150px; display: flex; flex-direction: column; gap: 22px; }
  .game { display: flex; align-items: center; gap: 26px; }
  .tile { width: 120px; height: 120px; border-radius: 26px; background: ${g.color}; color: #fff; display: grid; place-items: center; font-size: 74px; box-shadow: 0 8px 0 rgb(0 0 0 / .12); }
  .name { font-size: 64px; letter-spacing: .02em; }
  .headline { font-size: ${size}px; line-height: 1.12; letter-spacing: .01em; word-break: auto-phrase; text-wrap: balance; }
  .challenge { font-size: 46px; font-weight: 900; line-height: 1.35; word-break: auto-phrase; text-wrap: balance; }
  .art { position: absolute; left: 50%; bottom: 175px; width: 470px; height: 470px; transform: translateX(-50%); filter: drop-shadow(0 16px 30px rgb(22 28 45 / .16)); }
  .art svg { width: 100%; height: 100%; }
  .pic { position: absolute; inset: 0; border-radius: 24px; overflow: hidden; background: #fff; }
  .pic img { width: 100%; height: 100%; object-fit: cover; }
  .pic svg { position: absolute; inset: 0; }
  .foot { position: absolute; left: 0; right: 0; bottom: 0; height: 140px; background: #1e222a; color: #fff; display: flex; align-items: center; gap: 28px; padding: 0 72px; }
  .foot .who { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
  .foot .brand { font-size: 32px; }
  .foot .pitch { font-size: 24px; font-weight: 700; opacity: .75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .foot .cta { font-size: 30px; font-weight: 900; white-space: nowrap; text-align: right; line-height: 1.3; }
  .mini { display: inline-flex; gap: 5px; margin-right: 16px; vertical-align: middle; }
  .mini b { width: 34px; height: 34px; border-radius: 8px; display: inline-grid; place-items: center; font-size: 20px; color: #fff; }
</style></head><body>
<div class="band"></div>
<div class="blob" style="width:520px;height:520px;right:-180px;top:-220px"></div>
<div class="top"><span class="kicker round">今日の一問</span><span class="date">${esc(dateLabel(date))}</span></div>
<div class="column">
  <div class="game"><span class="tile round">${g.tile}</span><span class="name round">${esc(g.name)}</span></div>
  <div class="headline round">${esc(headline)}</div>
  <div class="challenge">${esc(challenge(game, day, jigsaw))}</div>
</div>
<div class="art">${isJigsaw ? jigsawArt(jigsaw.picture) : ART[game]()}</div>
<div class="foot"><span class="mini round"><b style="background:#ff8a5c">パ</b><b style="background:#f5b83d">ズ</b><b style="background:#4aaef0">ル</b></span><span class="who"><span class="brand round">パズルラウンジ</span><span class="pitch">${esc(PITCH[game])}</span></span><span class="cta">基本プレイ無料・登録なし<br>puzzlelounge.app</span></div>
</body></html>`;
}
