// Today's jigsaw お題, read off the live page the way a visitor sees it: its picture, name and
// conditions. The picture is shown on the card - it is no secret, every visitor sees it before
// they start - and the cut and clock still begin only when someone plays.
import { SITE } from "./games.mjs";
import { readOnlyPage } from "./browser.mjs";

export async function jigsawDaily(browser, date) {
  const page = await readOnlyPage(browser);
  await page.goto(`${SITE}/jigsaw/`, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.locator("text=今日のお題 >> visible=true").first().click({ timeout: 20_000 });
  await page.locator("#daily-name").waitFor({ state: "visible", timeout: 20_000 });
  const got = await page.evaluate(() => ({
    title: document.querySelector("#daily-name")?.textContent?.trim() ?? "",
    conditions: document.querySelector("#daily-conditions")?.textContent?.trim() ?? "",
    when: document.querySelector("#daily-date")?.textContent?.trim() ?? "",
    thumb: document.querySelector("#daily-picture")?.getAttribute("src") ?? "",
  }));
  await page.context().close();
  if (!got.title || !got.thumb) throw new Error("今日のお題が読めませんでした");
  if (!got.when.startsWith(date)) throw new Error(`今日のお題の日付が違います: ${got.when}`);
  // The card wants the whole picture, not the shelf's thumbnail.
  return { ...got, picture: got.thumb.replace("/puzzles/thumbs/", "/puzzles/") };
}
