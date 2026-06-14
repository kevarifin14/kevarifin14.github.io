#!/usr/bin/env node
// Generate gallery thumbnails: open each unique sim path, lightly poke it, screenshot the .stage.
// Output: sims/thumbs/<slug>.png  (slug derived from the gallery card href)
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); });
    s.on("error", rej);
  });
}

async function startServer() {
  const port = await freePort();
  const child = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  const baseUrl = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(`${baseUrl}/sims/`); if (r.ok) return { baseUrl, close: async () => { if (!child.killed) child.kill("SIGTERM"); await wait(100); } }; }
    catch { /* retry */ }
    await wait(100);
  }
  child.kill("SIGTERM");
  throw new Error("Static server did not start");
}

async function main() {
  const { chromium } = await import("playwright");
  const outDir = path.join(root, "sims/thumbs");
  await mkdir(outDir, { recursive: true });
  const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const positive = /drop|draw|random|run|sample|start|shuffle|sound|generate|advance|next|grow|spread|infect/i;
  const skip = /pause|reset|clear|stop|play/i;
  try {
    const disco = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    await disco.goto(`${server.baseUrl}/sims/`, { waitUntil: "domcontentloaded", timeout: 20000 });
    let sims = await disco.$$eval("a.card", (cards) => cards.map((c) => new URL(c.href).pathname));
    await disco.close();
    if (only) sims = sims.filter((h) => h.includes(only));
    sims = [...new Set(sims)];

    for (const href of sims) {
      const slug = href.replace(/^\/sims\//, "").replace(/\/$/, "");
      const page = await browser.newPage({ viewport: { width: 680, height: 540 }, deviceScaleFactor: 1 });
      try {
        await page.goto(`${server.baseUrl}${href}`, { waitUntil: "domcontentloaded", timeout: 20000 });
        await wait(1100);
        const btns = page.locator(".controls button");
        const n = await btns.count();
        for (let i = 0; i < n; i += 1) {
          const t = (await btns.nth(i).innerText()).trim();
          if (positive.test(t) && !skip.test(t)) { await btns.nth(i).click({ timeout: 1500 }).catch(() => {}); break; }
        }
        await wait(950);
        const stage = page.locator(".stage").first();
        if (await stage.count()) { await stage.screenshot({ path: path.join(outDir, `${slug}.png`), timeout: 6000 }); process.stdout.write(`✓ ${slug}\n`); }
        else process.stdout.write(`– ${slug} (no .stage)\n`);
      } catch (e) { process.stdout.write(`✗ ${slug}: ${e.message}\n`); }
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
