// The morning's run: today's six cards drawn into images/<date>/, and the words to go with them
// written beside them (plan.json). Nothing is posted from here - post.mjs does that, and only
// once the images are pushed where Buffer can fetch them.
//
//   node src/morning.mjs [YYYY-MM-DD]     (default: today in Japan)
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES, ORDER, dailies, dateLabel, dayInJapan, featuredOn, linkTo } from "./games.mjs";
import { launch } from "./browser.mjs";
import { jigsawDaily } from "./jigsaw.mjs";
import { cardHtml } from "./cards.mjs";

const date = process.argv[2] ?? dayInJapan();
const dir = join("images", date);
mkdirSync(dir, { recursive: true });

const browser = await launch();
const days = dailies(date);
const jigsaw = await jigsawDaily(browser, date);
console.log(`jigsaw: ${jigsaw.title} (${jigsaw.conditions})`);

const page = await (await browser.newContext({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 })).newPage();
for (const game of ORDER) {
  await page.setContent(cardHtml(game, date, days[game], jigsaw), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir, `${game}.png`) });
  console.log(`drawn ${game}`);
}
await browser.close();

/** How each game is named in a post: ナンプレ（ふつう）, ループパズル No.5, ジグソーパズル「…」. */
const label = (game) => {
  const name = GAMES[game].name;
  if (game === "jigsaw") return `${name}「${jigsaw.title}」`;
  const h = days[game].headline;
  return h.startsWith("No.") ? `${name} ${h}` : `${name}（${h}）`;
};
const detail = (game) => (game === "jigsaw" ? jigsaw.conditions : days[game].detail);

const featured = featuredOn(date);
const rest = [...ORDER.filter((g) => g !== featured)];
const tags = (game) => ["パズルラウンジ", ...GAMES[game].tags].map((t) => `#${t}`).join(" ");

const plan = {
  date,
  dueAt: new Date(`${date}T07:00:00+09:00`).toISOString(),
  jigsaw,
  thread: [
    {
      game: featured,
      image: `${featured}.png`,
      text: [
        `🧩 今日の一問｜${dateLabel(date)}`,
        "",
        `今日の目玉は${label(featured)}`,
        detail(featured),
        ...(featured === "jigsaw" ? ["ひとりでも、友だちと最大 8 人でも組めます"] : []),
        "毎日 0 時に変わる、みんな同じ一問。タイムを競おう",
        "",
        `▶ ${linkTo(featured)}`,
        tags(featured),
      ].join("\n"),
    },
    ...rest.map((game) => ({
      game,
      image: `${game}.png`,
      text: [label(game), detail(game), `▶ ${linkTo(game)}`].join("\n"),
    })),
  ],
};
writeFileSync(join(dir, "plan.json"), JSON.stringify(plan, null, 2));
console.log(`written ${dir}/plan.json`);
