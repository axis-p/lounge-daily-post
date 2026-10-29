// Buffer's API (GraphQL at https://api.buffer.com): it posts to X, Instagram and YouTube for us,
// so we never hold an X key or pay X per post. Media goes as public URLs - Buffer fetches them
// when the post publishes - so the images must already be pushed before anything is scheduled.
//
//   node src/buffer.mjs channels      lists the organisations and channels the key reaches
//
// BUFFER_API_KEY is read from the environment (a GitHub secret) and never printed.

const API = "https://api.buffer.com";

/** An enum value, written into a query bare. */
export const bare = (name) => ({ __bare: name });

/** A value as GraphQL literal syntax: keys bare, strings quoted, enums bare. */
export function literal(v) {
  if (v && typeof v === "object" && "__bare" in v) return v.__bare;
  if (Array.isArray(v)) return `[${v.map(literal).join(", ")}]`;
  if (v && typeof v === "object") return `{ ${Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${k}: ${literal(x)}`).join(", ")} }`;
  return JSON.stringify(v);
}

export async function ask(query) {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error("BUFFER_API_KEY がありません");
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ query }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.errors) throw new Error(`Buffer ${res.status}: ${JSON.stringify(data.errors ?? data).slice(0, 600)}`);
  return data.data;
}

/** Schedules one post; returns its id, or throws with Buffer's own message. */
export async function createPost(input) {
  const data = await ask(`mutation { createPost(input: ${literal(input)}) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`);
  const r = data.createPost;
  if (!r?.post) throw new Error(`Buffer は受け付けませんでした: ${r?.message ?? JSON.stringify(r)}`);
  return r.post;
}

if (process.argv[1]?.endsWith("buffer.mjs") && process.argv[2] === "channels") {
  const { account } = await ask("query { account { organizations { id name } } }");
  for (const org of account.organizations) {
    console.log(`organization ${org.id}  ${org.name}`);
    const { channels } = await ask(`query { channels(input: { organizationId: ${JSON.stringify(org.id)} }) { id name displayName service isQueuePaused } }`);
    for (const c of channels) console.log(`  ${c.service.padEnd(10)} ${c.id}  ${c.displayName || c.name}${c.isQueuePaused ? "  (paused)" : ""}`);
  }
}
