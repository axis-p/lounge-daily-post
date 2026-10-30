// The run page's summary: every card and every word of the day's post, in the order they will
// go out, so they can be read before the post job is approved.
//
//   node src/summary.mjs [YYYY-MM-DD] >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dayInJapan } from "./games.mjs";

const date = process.argv[2] || dayInJapan();
const plan = JSON.parse(readFileSync(join("images", date, "plan.json"), "utf8"));
const repo = process.env.GITHUB_REPOSITORY ?? "axis-p/lounge-daily-post";
// The commit the cards were kept in, so the page shows these cards and not a cached older copy.
const ref = process.env.CARDS_SHA || "main";
const url = (name) => `https://raw.githubusercontent.com/${repo}/${ref}/images/${date}/${name}`;

const lines = [`# ${date} の投稿`, "", `X に ${new Date(plan.dueAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} に出ます（承認が遅れたときは承認の 10 分後）。`, "", "よければ下の **post** の承認（Review deployments → Approve）を押してください。押さなければ投稿されません。", ""];
for (const [i, t] of plan.thread.entries()) {
  lines.push(`## ${i === 0 ? "本投稿" : `返信 ${i}`}`, "", `<img src="${url(t.image)}" width="600">`, "", "```", t.text, "```", "");
}
console.log(lines.join("\n"));
