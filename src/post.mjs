// Hands a day's plan to Buffer: on X, the featured card as the post and the other five as its
// thread, at 7:00 in Japan. It does nothing but print the plan until it is switched on - POST_ENABLED
// is "true" and the key and channel are set - so the cards can be watched for a few days first.
//
//   node src/post.mjs [YYYY-MM-DD]
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { dayInJapan } from "./games.mjs";
import { bare, createPost } from "./buffer.mjs";

const date = process.argv[2] ?? dayInJapan();
const planFile = join("images", date, "plan.json");
if (!existsSync(planFile)) throw new Error(`${planFile} がありません。先に morning.mjs を動かしてください`);
const plan = JSON.parse(readFileSync(planFile, "utf8"));

const repo = process.env.GITHUB_REPOSITORY ?? "axis-p/lounge-daily-post";
const imageUrl = (name) => `https://raw.githubusercontent.com/${repo}/main/images/${date}/${name}`;

// Buffer wants a time still ahead; a late run posts ten minutes from now instead of not at all.
const soonest = Date.now() + 10 * 60_000;
const dueAt = new Date(Math.max(Date.parse(plan.dueAt), soonest)).toISOString();

const on = process.env.POST_ENABLED === "true";
const xChannel = process.env.BUFFER_X_CHANNEL;

console.log(`${date}: ${plan.thread.length} cards, due ${dueAt}`);
for (const [i, t] of plan.thread.entries()) console.log(`\n--- ${i === 0 ? "post" : `reply ${i}`} (${t.image})\n${t.text}`);

if (!on || !xChannel || !process.env.BUFFER_API_KEY) {
  console.log(`\nnot posted: ${!on ? "POST_ENABLED is not true" : !xChannel ? "BUFFER_X_CHANNEL is not set" : "BUFFER_API_KEY is not set"}`);
  process.exit(0);
}

const thread = plan.thread.map((t) => ({ text: t.text, assets: [{ image: { url: imageUrl(t.image) } }] }));
const post = await createPost({
  text: thread[0].text,
  channelId: xChannel,
  schedulingType: bare("automatic"),
  mode: bare("customScheduled"),
  dueAt,
  assets: thread[0].assets,
  metadata: { twitter: { thread } },
});
console.log(`\nscheduled on X: ${post.id} at ${post.dueAt}`);
