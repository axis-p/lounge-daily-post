// A headless Chrome that may only read: every request that is not a GET (or HEAD) is answered
// here and never reaches a server, and the analytics are not loaded at all, so a morning's run
// neither plays a daily nor counts as a visitor.
import { chromium } from "playwright";

export async function launch() {
  return chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
}

export async function readOnlyPage(browser, viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport, locale: "ja-JP", deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route("**/*", (route) => {
    const r = route.request();
    if (/google-analytics|googletagmanager|doubleclick|googlesyndication/.test(r.url())) return route.abort();
    if (r.method() === "GET" || r.method() === "HEAD") return route.continue();
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  return page;
}
