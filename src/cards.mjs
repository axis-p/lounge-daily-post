// The morning's cards, as pages Chrome draws at 1200×675 (X's 16:9): the Lounge's own paper,
// type and tiles, the game's letter and colour, which day it is and how hard - and beside it a
// picture of the game, never today's board.
import { GAMES, SITE, dateLabel } from "./games.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** A small square grid of `n`×`m` cells, `size` units a cell, starting at x, y. */
function grid(x, y, cols, rows, size, stroke, thick = []) {
  let s = "";
  for (let i = 0; i <= cols; i++) s += `<line x1="${x + i * size}" y1="${y}" x2="${x + i * size}" y2="${y + rows * size}" stroke="${stroke}" stroke-width="${thick.includes(i) ? 3.5 : 1.2}"/>`;
  for (let j = 0; j <= rows; j++) s += `<line x1="${x}" y1="${y + j * size}" x2="${x + cols * size}" y2="${y + j * size}" stroke="${stroke}" stroke-width="${thick.includes(j) ? 3.5 : 1.2}"/>`;
  return s;
}

const ART = {
  // An empty 9×9 with the boxes drawn heavy, and one question in the middle.
  nanpure: () => `<svg viewBox="0 0 400 400"><rect x="20" y="20" width="360" height="360" rx="14" fill="#fff"/>
    ${grid(20, 20, 9, 9, 40, "#3a3f4b33", [0, 3, 6, 9])}
    <rect x="20" y="20" width="360" height="360" rx="14" fill="none" stroke="#3a3f4b" stroke-width="4"/>
    <rect x="180" y="180" width="40" height="40" fill="#c9e2fa"/>
    <text x="200" y="213" text-anchor="middle" font-size="30" font-weight="700" fill="#2f7fd8">?</text></svg>`,
  // A real little field: the opened cells show the true count of the mines around them, and the
  // one mine the numbers already prove carries its flag - a card for a game of reasoning should
  // not be wrong.
  mines: () => {
    const mines = new Set(["1,1", "6,1", "7,2", "2,6", "6,6", "7,7", "0,4", "8,5", "4,8"]);
    const flagged = new Set(["7,2"]);
    const at = (c, r) => `${c},${r}`;
    const count = (c, r) => [-1, 0, 1].flatMap((dc) => [-1, 0, 1].map((dr) => mines.has(at(c + dc, r + dr)) && (dc || dr))).filter(Boolean).length;
    // Open outward from the middle as the game does: zeros spread, numbers stop it.
    const open = new Set();
    const todo = [[4, 4]];
    while (todo.length) {
      const [c, r] = todo.pop();
      const k = at(c, r);
      if (c < 0 || r < 0 || c > 8 || r > 8 || open.has(k) || mines.has(k)) continue;
      open.add(k);
      if (count(c, r) === 0) for (const dc of [-1, 0, 1]) for (const dr of [-1, 0, 1]) todo.push([c + dc, r + dr]);
    }
    const ink = ["", "#2f7fd8", "#2f9a52", "#e0523a", "#2f4a78"];
    let s = `<svg viewBox="0 0 400 400"><rect x="10" y="10" width="380" height="380" rx="18" fill="#d9dde4"/>`;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const x = 22 + c * 40, y = 22 + r * 40, k = at(c, r);
      if (open.has(k)) {
        s += `<rect x="${x}" y="${y}" width="38" height="38" fill="#fff"/>`;
        const n = count(c, r);
        if (n) s += `<text x="${x + 19}" y="${y + 29}" text-anchor="middle" font-size="26" font-weight="800" fill="${ink[n]}">${n}</text>`;
      } else {
        s += `<rect x="${x}" y="${y}" width="36" height="36" rx="6" fill="#e9edf3"/>`;
        if (flagged.has(k)) s += `<path d="M ${x + 13} ${y + 30} v -22 l 14 6 l -14 6" fill="#ff8a5c" stroke="#d0643e" stroke-width="2"/>`;
      }
    }
    return s + `</svg>`;
  },
  // A blank 15×15 with its clue bands waiting, one row begun.
  nonogram: () => {
    let s = `<svg viewBox="0 0 400 400"><rect x="10" y="10" width="380" height="380" rx="18" fill="#fff"/>`;
    s += `<rect x="110" y="20" width="270" height="88" rx="8" fill="#e3e8f1"/><rect x="20" y="110" width="88" height="270" rx="8" fill="#e3e8f1"/>`;
    for (let i = 0; i < 15; i++) {
      s += `<rect x="${113 + i * 18}" y="${88 - (i % 3) * 14}" width="12" height="10" rx="3" fill="#2f4a7855"/>`;
      s += `<rect x="${88 - (i % 4) * 16}" y="${113 + i * 18}" width="12" height="10" rx="3" fill="#2f4a7855"/>`;
    }
    s += grid(110, 110, 15, 15, 18, "#2f4a7826", [0, 5, 10, 15]);
    for (const c of [2, 3, 4, 8, 9]) s += `<rect x="${111 + c * 18}" y="${111 + 7 * 18}" width="16" height="16" fill="#2f4a78"/>`;
    return s + `</svg>`;
  },
  // Dots, a loop, and in some cells the true number of the loop's sides around them.
  loop: () => {
    let s = `<svg viewBox="0 0 400 400"><rect x="10" y="10" width="380" height="380" rx="18" fill="#fff"/>`;
    const at = (i) => 40 + i * 53;
    const path = [[1, 1], [3, 1], [3, 2], [5, 2], [5, 4], [4, 4], [4, 5], [2, 5], [2, 3], [1, 3], [1, 1]];
    const edges = new Set();
    for (let i = 1; i < path.length; i++) {
      const [x0, y0] = path[i - 1], [x1, y1] = path[i];
      for (let t = 0; t < Math.abs(x1 - x0) + Math.abs(y1 - y0); t++) {
        const ax = x0 + Math.sign(x1 - x0) * t, ay = y0 + Math.sign(y1 - y0) * t;
        edges.add([ax, ay, ax + Math.sign(x1 - x0), ay + Math.sign(y1 - y0)].join());
      }
    }
    const has = (a, b, c, d) => edges.has([a, b, c, d].join()) || edges.has([c, d, a, b].join());
    const sides = (x, y) => [has(x, y, x + 1, y), has(x, y + 1, x + 1, y + 1), has(x, y, x, y + 1), has(x + 1, y, x + 1, y + 1)].filter(Boolean).length;
    s += `<polyline points="${path.map(([x, y]) => `${at(x)},${at(y)}`).join(" ")}" fill="none" stroke="#6a52c9" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>`;
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) s += `<circle cx="${at(x)}" cy="${at(y)}" r="4.5" fill="#1e222a"/>`;
    for (const [x, y] of [[1, 1], [2, 1], [4, 2], [0, 4], [3, 3], [2, 4], [4, 4], [5, 5]]) s += `<text x="${at(x) + 26}" y="${at(y) + 36}" text-anchor="middle" font-size="28" font-weight="700" fill="#1e222a">${sides(x, y)}</text>`;
    return s + `</svg>`;
  },
  // The seven pieces of a tangram, laid out as their square.
  tangram: () => `<svg viewBox="0 0 400 400"><g transform="translate(200 200) rotate(-8) translate(-160 -160)">
    <polygon points="0,0 320,0 160,160" fill="#ff8a5c"/>
    <polygon points="0,0 160,160 0,320" fill="#f5b83d"/>
    <polygon points="320,0 320,160 240,80" fill="#4aaef0"/>
    <polygon points="240,80 320,160 240,240 160,160" fill="#6cc46e"/>
    <polygon points="160,160 240,240 80,240" fill="#a68af2"/>
    <polygon points="0,320 80,240 240,240 160,320" fill="#2f4a78"/>
    <polygon points="320,160 320,320 160,320" fill="#e0523a"/>
    <g stroke="#f6f5f2" stroke-width="5" fill="none"><polygon points="0,0 320,0 320,320 0,320"/><path d="M0 0 L240 240 M320 0 L0 320 M160 320 L320 160 M240 80 L240 240 M80 240 L240 240 M160 160 L80 240"/></g></g></svg>`,
};

/** The whole picture with the day's cut drawn faintly over it, as a jigsaw. */
function jigsawArt(picture) {
  let cuts = "";
  for (let i = 1; i < 6; i++) cuts += `<path d="M ${i * 100} 0 ${Array.from({ length: 6 }, (_, j) => `L ${i * 100} ${j * 100 + 38} q ${j % 2 ? -18 : 18} 0 ${j % 2 ? -18 : 18} 12 q 0 12 ${j % 2 ? 18 : -18} 12 L ${i * 100} ${j * 100 + 100}`).join(" ")}"/>`;
  for (let j = 1; j < 6; j++) cuts += `<path d="M 0 ${j * 100} ${Array.from({ length: 6 }, (_, i) => `L ${i * 100 + 38} ${j * 100} q 0 ${i % 2 ? 18 : -18} 12 ${i % 2 ? 18 : -18} q 12 0 12 ${i % 2 ? -18 : 18} L ${i * 100 + 100} ${j * 100}`).join(" ")}"/>`;
  return `<div class="pic"><img src="${esc(picture)}"><svg viewBox="0 0 600 600" preserveAspectRatio="none"><g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4">${cuts}</g></svg></div>`;
}

function shell(game, body) {
  const g = GAMES[game];
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&family=M+PLUS+Rounded+1c:wght@800&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 675px; }
  body { background: #f6f5f2; color: #1e222a; font-family: "Noto Sans JP", "Noto Sans CJK JP", sans-serif; position: relative; overflow: hidden; }
  .blob { position: absolute; border-radius: 50%; }
  .tile { display: inline-grid; place-items: center; color: #fff; font-family: "M PLUS Rounded 1c", "Noto Sans JP", "Noto Sans CJK JP", sans-serif; font-weight: 800; border-radius: 22%; box-shadow: 0 6px 0 rgb(0 0 0 / .12); }
  .left { position: absolute; left: 80px; top: 74px; width: 560px; }
  .head { display: flex; align-items: center; gap: 22px; }
  .head .tile { width: 92px; height: 92px; font-size: 56px; }
  .name { font-family: "M PLUS Rounded 1c", "Noto Sans JP", "Noto Sans CJK JP", sans-serif; font-weight: 800; font-size: 46px; letter-spacing: .02em; }
  .chip { display: inline-block; margin-top: 44px; padding: 8px 20px; border-radius: 999px; font-weight: 700; font-size: 26px; }
  .headline { font-family: "M PLUS Rounded 1c", "Noto Sans JP", "Noto Sans CJK JP", sans-serif; font-weight: 800; font-size: 104px; line-height: 1.05; margin-top: 18px; letter-spacing: .01em; }
  .headline.small { font-size: 60px; line-height: 1.2; word-break: auto-phrase; text-wrap: balance; }
  .detail { margin-top: 18px; font-size: 28px; font-weight: 700; color: #4d5361; }
  .date { margin-top: 10px; font-size: 26px; font-weight: 500; color: #737a86; }
  .art { position: absolute; right: 70px; top: 112px; width: 450px; height: 450px; filter: drop-shadow(0 12px 26px rgb(22 28 45 / .14)); }
  .art svg { width: 100%; height: 100%; }
  .pic { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; background: #fff; }
  .pic img { width: 100%; height: 100%; object-fit: cover; }
  .pic svg { position: absolute; inset: 0; }
  .foot { position: absolute; left: 80px; bottom: 44px; display: flex; align-items: center; gap: 14px; font-weight: 700; font-size: 24px; color: #4d5361; }
  .mini { display: flex; gap: 4px; }
  .mini .tile { width: 30px; height: 30px; font-size: 17px; box-shadow: 0 3px 0 rgb(0 0 0 / .1); border-radius: 7px; }
</style></head><body>
<div class="blob" style="width:420px;height:420px;left:-140px;top:-170px;background:${g.wash}"></div>
<div class="blob" style="width:340px;height:340px;right:-120px;bottom:-150px;background:${g.wash};opacity:.8"></div>
${body}
<div class="foot"><span class="mini"><b class="tile" style="background:#ff8a5c">パ</b><b class="tile" style="background:#f5b83d">ズ</b><b class="tile" style="background:#4aaef0">ル</b></span>パズルラウンジ ・ puzzlelounge.app${esc(g.path)}</div>
</body></html>`;
}

/** The card for one game's daily on `date`. `day` is games.dailies(date)[game]; `jigsaw` the read お題. */
export function cardHtml(game, date, day, jigsaw) {
  const g = GAMES[game];
  const isJigsaw = game === "jigsaw";
  const headline = isJigsaw ? jigsaw.title : day.headline;
  const detail = isJigsaw ? jigsaw.conditions : day.detail;
  return shell(game, `
<div class="left">
  <div class="head"><span class="tile" style="background:${g.color}">${g.tile}</span><span class="name">${esc(g.name)}</span></div>
  <span class="chip" style="background:${g.wash};color:${g.color === "#f5b83d" ? "#9a6a06" : g.color}">今日の一問</span>
  <div class="headline${headline.length > 6 ? " small" : ""}">${esc(headline)}</div>
  <div class="detail">${esc(detail)}</div>
  <div class="date">${esc(dateLabel(date))} ・ 毎日 0 時に変わる</div>
</div>
<div class="art">${isJigsaw ? jigsawArt(jigsaw.picture) : ART[game]()}</div>`);
}
