// What each game's 今日の一問 is called on a given day, as the games themselves count it - from the
// date alone, so nothing here asks the live site anything. The puzzles of mines, tangram, nonogram
// and loop are kept secret on their servers until the day closes (so a daily ranking cannot be
// solved ahead of its clock); the cards say which day and how hard, never what the board is.

export const SITE = "https://puzzlelounge.app";

/** The date in Japan, as YYYY-MM-DD: the day every game's daily changes on at 0:00. */
export function dayInJapan(at = new Date()) {
  return new Date(at.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** 0 = Sunday, in Japan. */
export const weekdayOf = (date) => new Date(`${date}T00:00:00Z`).getUTCDay();

const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

/** 「10月30日（木）」 */
export function dateLabel(date) {
  const [, m, d] = date.split("-").map(Number);
  return `${m}月${d}日（${WEEKDAY[weekdayOf(date)]}）`;
}

/** The games' own count: the first daily is No.1 (src/core/daily.ts dayNumber in each game). */
export function dayNumber(date, firstDay) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${firstDay}T00:00:00Z`)) / 86400_000) + 1;
}

/** ナンプレ's daily level by weekday (duudoku src/core/daily.ts:15). */
const NANPURE_LEVEL = ["やさしい", "ふつう", "ふつう", "むずかしい", "ふつう", "むずかしい", "鬼"];

/** The hub's tiles: the same letter and colour each game wears on puzzlelounge.app. */
export const GAMES = {
  nanpure: { name: "ナンプレ", tile: "数", color: "#4aaef0", wash: "#e8f2fb", path: "/nanpure/", tags: ["ナンプレ", "数独"] },
  mines: { name: "マインスイーパー", tile: "マ", color: "#6cc46e", wash: "#e4f2e2", path: "/mines/", tags: ["マインスイーパー"] },
  nonogram: { name: "ノノグラム", tile: "ノ", color: "#2f4a78", wash: "#e3e8f1", path: "/nonogram/", tags: ["ノノグラム", "お絵かきロジック"] },
  loop: { name: "ループパズル", tile: "ル", color: "#6a52c9", wash: "#ebe7f8", path: "/loop/", tags: ["ループパズル"] },
  tangram: { name: "タングラム", tile: "タ", color: "#f5b83d", wash: "#fbf0d6", path: "/tangram/", tags: ["タングラム"] },
  jigsaw: { name: "ジグソーパズル", tile: "ジ", color: "#ff8a5c", wash: "#f6e6dc", path: "/jigsaw/", tags: ["ジグソーパズル"] },
};

/** The game each morning's post leads with: the weekend is the jigsaw's, built with friends. */
const FEATURED = ["jigsaw", "nanpure", "mines", "nonogram", "loop", "tangram", "jigsaw"];

export const featuredOn = (date) => FEATURED[weekdayOf(date)];

/** The order the rest follow in, after the featured one. */
export const ORDER = ["nanpure", "mines", "nonogram", "loop", "tangram", "jigsaw"];

/**
 * What each game's daily is on `date`: the headline (No. or level) and a line of detail.
 * The jigsaw's picture is read from the live page separately (jigsaw.mjs).
 */
export function dailies(date) {
  return {
    nanpure: { headline: NANPURE_LEVEL[weekdayOf(date)], detail: "9×9・ヒントつき" },
    mines: { headline: "むずかしい", detail: "16×30・地雷 99・運ゲーなし" },
    nonogram: { headline: `No.${dayNumber(date, "2026-10-22")}`, detail: "15×15・今日の模様" },
    loop: { headline: `No.${dayNumber(date, "2026-10-25")}`, detail: "10×10・一本の輪を作る" },
    tangram: { headline: `No.${dayNumber(date, "2026-10-07")}`, detail: "7 枚の板で今日のかたち" },
    jigsaw: { headline: "今日のお題", detail: "" },
  };
}

/** A link that tells GA it came from this post. */
export const linkTo = (game, source = "x") => `${SITE}${GAMES[game].path}?utm_source=${source}&utm_medium=social&utm_campaign=daily`;
