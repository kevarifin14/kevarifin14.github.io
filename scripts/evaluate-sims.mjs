#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { inflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const RUBRIC = [
  { id: "runtime", label: "Runtime health", points: 20 },
  { id: "visual", label: "Visual frame", points: 18 },
  { id: "interaction", label: "Interaction", points: 18 },
  { id: "learning", label: "Learning layer", points: 16 },
  { id: "accessibility", label: "Accessibility/mobile", points: 16 },
  { id: "implementation", label: "Implementation", points: 12 },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(argv) {
  const opts = {
    baseUrl: null,
    port: null,
    out: path.join(root, "sims/eval-results/latest.json"),
    report: path.join(root, "sims/eval-results/latest.md"),
    screenshots: path.join(os.tmpdir(), `sim-eval-${Date.now()}`),
    only: null,
    headed: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base-url") opts.baseUrl = argv[++i];
    else if (arg === "--port") opts.port = Number(argv[++i]);
    else if (arg === "--out") opts.out = path.resolve(root, argv[++i]);
    else if (arg === "--report") opts.report = path.resolve(root, argv[++i]);
    else if (arg === "--screenshots") opts.screenshots = path.resolve(root, argv[++i]);
    else if (arg === "--no-screenshots") opts.screenshots = null;
    else if (arg === "--only") opts.only = argv[++i];
    else if (arg === "--headed") opts.headed = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run eval:sims -- [options]

Options:
  --base-url URL       Use an already-running static server instead of starting one
  --port N            Preferred local server port
  --only TEXT         Evaluate paths/titles containing TEXT
  --out PATH          JSON output path (default sims/eval-results/latest.json)
  --report PATH       Markdown report path (default sims/eval-results/latest.md)
  --screenshots PATH  Stage screenshots directory (default /tmp/sim-eval-*)
  --no-screenshots    Do not save screenshots
  --headed            Run browser headed for debugging`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch (err) {
    console.error("Playwright is required for the simulation evaluator.");
    console.error("Run: npm install && npx playwright install chromium");
    console.error(err?.message || err);
    process.exit(1);
  }
}

async function freePort(preferred) {
  if (preferred) return preferred;
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function startServer(opts) {
  if (opts.baseUrl) return { baseUrl: opts.baseUrl.replace(/\/$/, ""), close: async () => {} };

  const port = await freePort(opts.port);
  const child = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`${baseUrl}/sims/`);
      if (res.ok) {
        return {
          baseUrl,
          close: async () => {
            if (!child.killed) child.kill("SIGTERM");
            await wait(100);
          },
        };
      }
    } catch {
      // Retry until the local static server accepts connections.
    }
    await wait(100);
  }

  if (!child.killed) child.kill("SIGTERM");
  throw new Error(`Static server did not start on ${baseUrl}.\n${stderr}`);
}

function decodePng(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) throw new Error("Not a PNG");

  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos); pos += 4;
    const type = buffer.subarray(pos, pos + 4).toString("ascii"); pos += 4;
    const data = buffer.subarray(pos, pos + length); pos += length;
    pos += 4;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const rowBytes = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * 4);
  let rawPos = 0;
  let outPos = 0;
  let prev = Buffer.alloc(rowBytes);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawPos++];
    const row = Buffer.alloc(rowBytes);
    for (let x = 0; x < rowBytes; x += 1) {
      const val = raw[rawPos++];
      const left = x >= channels ? row[x - channels] : 0;
      const up = prev[x] || 0;
      const upLeft = x >= channels ? prev[x - channels] : 0;
      let decoded;

      if (filter === 0) decoded = val;
      else if (filter === 1) decoded = val + left;
      else if (filter === 2) decoded = val + up;
      else if (filter === 3) decoded = val + Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        decoded = val + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }
      row[x] = decoded & 255;
    }

    for (let x = 0; x < width; x += 1) {
      const src = x * channels;
      rgba[outPos++] = row[src];
      rgba[outPos++] = row[src + 1];
      rgba[outPos++] = row[src + 2];
      rgba[outPos++] = channels === 4 ? row[src + 3] : 255;
    }
    prev = row;
  }

  return { width, height, rgba };
}

function pngStats(buffer) {
  const img = decodePng(buffer);
  const pixels = img.width * img.height;
  const step = Math.max(1, Math.floor(pixels / 7000));
  let count = 0;
  let sum = 0;
  let sumSq = 0;
  let alphaPixels = 0;
  const buckets = new Set();

  for (let p = 0; p < pixels; p += step) {
    const i = p * 4;
    const r = img.rgba[i];
    const g = img.rgba[i + 1];
    const b = img.rgba[i + 2];
    const a = img.rgba[i + 3];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    count += 1;
    sum += lum;
    sumSq += lum * lum;
    if (a > 12) alphaPixels += 1;
    buckets.add(`${r >> 4},${g >> 4},${b >> 4}`);
  }

  const mean = sum / Math.max(1, count);
  const variance = Math.max(0, sumSq / Math.max(1, count) - mean * mean);
  return {
    width: img.width,
    height: img.height,
    samples: count,
    mean: Number(mean.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    colorBuckets: buckets.size,
    visibleRatio: Number((alphaPixels / Math.max(1, count)).toFixed(3)),
    nonBlank: variance > 8 || buckets.size > 8,
  };
}

function imageDistance(bufferA, bufferB) {
  const a = decodePng(bufferA);
  const b = decodePng(bufferB);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const pixels = width * height;
  const step = Math.max(1, Math.floor(pixels / 5000));
  let count = 0;
  let diff = 0;

  for (let p = 0; p < pixels; p += step) {
    const x = p % width;
    const y = Math.floor(p / width);
    const ia = (y * a.width + x) * 4;
    const ib = (y * b.width + x) * 4;
    diff += Math.abs(a.rgba[ia] - b.rgba[ib]);
    diff += Math.abs(a.rgba[ia + 1] - b.rgba[ib + 1]);
    diff += Math.abs(a.rgba[ia + 2] - b.rgba[ib + 2]);
    count += 3;
  }

  return Number((diff / Math.max(1, count) / 255).toFixed(4));
}

function addCheck(checks, category, id, points, earned, notes) {
  checks.push({
    category,
    id,
    points,
    earned: Number(Math.max(0, Math.min(points, earned)).toFixed(2)),
    pass: earned >= points,
    notes,
  });
}

function summarizeScore(checks) {
  const total = checks.reduce((sum, check) => sum + check.points, 0);
  const earned = checks.reduce((sum, check) => sum + check.earned, 0);
  const byCategory = {};

  for (const category of RUBRIC) {
    const categoryChecks = checks.filter((check) => check.category === category.id);
    const catPoints = categoryChecks.reduce((sum, check) => sum + check.points, 0);
    const catEarned = categoryChecks.reduce((sum, check) => sum + check.earned, 0);
    byCategory[category.id] = {
      label: category.label,
      earned: Number(catEarned.toFixed(2)),
      points: catPoints,
      percent: catPoints ? Number(((catEarned / catPoints) * 100).toFixed(1)) : 0,
    };
  }

  return {
    earned: Number(earned.toFixed(2)),
    total,
    percent: total ? Number(((earned / total) * 100).toFixed(1)) : 0,
    byCategory,
  };
}

function pageLocalPath(href) {
  return path.join(root, href.replace(/^\//, ""), "index.html");
}

function textList(items, limit = 4) {
  return items.slice(0, limit).join("; ") + (items.length > limit ? `; +${items.length - limit} more` : "");
}

async function collectLayout(page) {
  return await page.evaluate(() => {
    const q = (sel) => Array.from(document.querySelectorAll(sel));
    const stage = document.querySelector(".stage");
    const stageRect = stage ? stage.getBoundingClientRect() : null;
    const controls = q(".controls input, .controls button, .controls select, .controls textarea");
    const inputs = q("input, select, textarea");
    const unlabeled = inputs.filter((input) => {
      const id = input.getAttribute("id");
      return !input.closest("label") &&
        !input.getAttribute("aria-label") &&
        !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
    }).map((input) => input.id || input.name || input.type || input.tagName.toLowerCase());
    const overflowEls = q("body *").filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      return r.left < -2 || r.right > window.innerWidth + 2;
    }).slice(0, 8).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        className: String(el.className || "").slice(0, 60),
        left: Math.round(r.left),
        right: Math.round(r.right),
      };
    });

    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      lead: document.querySelector(".lead, .sub")?.textContent?.trim() || "",
      readout: document.querySelector("#ro, .readout")?.textContent?.trim() || "",
      stageExists: Boolean(stage),
      stageAria: stage?.getAttribute("aria-label") ||
        stage?.querySelector("canvas, svg")?.getAttribute("aria-label") || "",
      stageRole: stage?.getAttribute("role") || "",
      stageRect: stageRect ? {
        width: Math.round(stageRect.width),
        height: Math.round(stageRect.height),
        top: Math.round(stageRect.top),
        bottom: Math.round(stageRect.bottom),
      } : null,
      canvasCount: q("canvas").length,
      svgCount: q("svg").length,
      controlsCount: controls.length,
      rangeCount: q('input[type="range"]').length,
      checkboxCount: q('input[type="checkbox"]').length,
      buttonLabels: q(".controls button").map((button) => button.textContent.trim()).filter(Boolean),
      inputLabelsOk: unlabeled.length === 0,
      unlabeledInputs: unlabeled,
      hasSteps: q("[data-step]").length > 0,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      overflowEls,
    };
  });
}

async function safeStageScreenshot(page, screenshotPath) {
  const stage = page.locator(".stage").first();
  if (!(await stage.count())) return { buffer: null, stats: null, error: "missing .stage" };
  try {
    const buffer = await stage.screenshot({ path: screenshotPath || undefined, timeout: 5000 });
    return { buffer, stats: pngStats(buffer), error: null };
  } catch (err) {
    return { buffer: null, stats: null, error: err.message };
  }
}

async function exercise(page) {
  const before = await collectLayout(page);
  const shotBefore = await safeStageScreenshot(page, null);

  const range = page.locator('.controls input[type="range"]').first();
  if (await range.count()) {
    await range.evaluate((el) => {
      const min = Number(el.min || 0);
      const max = Number(el.max || 100);
      const current = Number(el.value || min);
      const next = current < (min + max) / 2 ? max : min;
      el.value = String(next);
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  const button = page.locator(".controls button").filter({
    hasNotText: /^(reset|clear)$/i,
  }).first();
  if (await button.count()) {
    await button.click({ timeout: 3000 }).catch(() => {});
  }

  const stage = page.locator(".stage").first();
  if (await stage.count()) {
    const box = await stage.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5).catch(() => {});
    }
  }

  await wait(450);

  const after = await collectLayout(page);
  const shotAfter = await safeStageScreenshot(page, null);
  const visualDistance = shotBefore.buffer && shotAfter.buffer ? imageDistance(shotBefore.buffer, shotAfter.buffer) : 0;
  const readoutChanged = before.readout !== after.readout;

  return {
    before,
    after,
    visualDistance,
    readoutChanged,
    interacted: Boolean(before.rangeCount || before.buttonLabels.length || before.hasSteps || before.stageExists),
  };
}

function inspectSource(source, href) {
  const lower = source.toLowerCase();
  const recognizedLibraries = [
    "three", "matter", "p5", "d3", "katex", "speechsynthesis", "simkit",
  ].filter((needle) => lower.includes(needle));
  const hasAnimation = /requestAnimationFrame|Sim\.loop|new p5|Matter\.Runner|WebGLRenderer|setInterval/i.test(source);

  return {
    path: href,
    hasSetInterval: /setInterval\s*\(/.test(source),
    hasRequestAnimationFrame: /requestAnimationFrame\s*\(/.test(source),
    hasSimLoop: /Sim\.loop\s*\(/.test(source),
    hasSimKit: /lib\/simkit\.js|Sim\./.test(source),
    hasSimCss: /lib\/sim\.css/.test(source),
    hasReducedMotion: /prefers-reduced-motion|Sim\.loop/.test(source),
    hasVisibilityPause: /visibilitychange|IntersectionObserver|Sim\.loop/.test(source),
    hasReset: />\s*Reset\s*</i.test(source) || /id=["']reset["']/.test(source),
    hasPause: />\s*(Pause|Play|Step|Auto-rotate)\s*</i.test(source) || /id=["'](?:pause|play|step|spin)["']/.test(source),
    hasSpeed: /id=["']speed["']|>\s*Speed\s*</i.test(source),
    hasInlineHandlers: /\son[a-z]+\s*=/.test(source),
    recognizedLibraries,
    hasAnimation,
    isTemplate: href.includes("/_template/"),
  };
}

async function evaluateSim(browser, baseUrl, sim, opts) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) consoleErrors.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("requestfailed", (request) => {
    const type = request.resourceType();
    if (["document", "script", "stylesheet", "image", "font", "xhr", "fetch"].includes(type)) {
      requestFailures.push(`${type}: ${request.url()} (${request.failure()?.errorText || "failed"})`);
    }
  });

  let response = null;
  let navError = null;
  const url = `${baseUrl}${sim.href}`;
  try {
    response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await wait(900);
  } catch (err) {
    navError = err.message;
  }

  const screenshotBase = opts.screenshots
    ? path.join(opts.screenshots, sim.href.replace(/^\/|\/$/g, "").replace(/\//g, "__"))
    : null;
  if (screenshotBase) await mkdir(path.dirname(screenshotBase), { recursive: true });

  const sourcePath = pageLocalPath(sim.href);
  const source = existsSync(sourcePath) ? await readFile(sourcePath, "utf8") : "";
  const sourceInfo = inspectSource(source, sim.href);
  const layout = navError ? null : await collectLayout(page);
  const shot = navError ? { stats: null, error: navError } : await safeStageScreenshot(page, screenshotBase ? `${screenshotBase}.png` : null);
  const exercised = navError ? null : await exercise(page);

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  let mobileLayout = null;
  try {
    await mobile.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await wait(650);
    mobileLayout = await collectLayout(mobile);
    if (screenshotBase) {
      await safeStageScreenshot(mobile, `${screenshotBase}.mobile.png`);
    }
  } catch (err) {
    requestFailures.push(`mobile document: ${url} (${err.message})`);
  }

  await mobile.close();
  await page.close();

  const checks = [];
  const statusOk = response?.ok() && !navError;
  const stageSized = layout?.stageRect?.width >= 220 && layout?.stageRect?.height >= 160;
  const mobileStageUsable = mobileLayout?.stageRect?.width >= 260 && mobileLayout?.stageRect?.height >= 150;
  const interactionChanged = exercised?.readoutChanged || (exercised?.visualDistance || 0) > 0.01;
  const hasPointer = /pointer(?:down|move|up)|Sim\.pointer|OrbitControls|MouseConstraint|mousedown|touchstart/i.test(source);
  const hasAnyControls = Boolean(layout?.controlsCount || layout?.hasSteps || hasPointer);
  const hasPauseLike = sourceInfo.hasPause || sourceInfo.hasSpeed || !sourceInfo.hasAnimation;
  const galleryOk = Boolean(sim.title && sim.tech && sim.description);
  const sourceHasLoop = sourceInfo.hasSimLoop || sourceInfo.hasRequestAnimationFrame ||
    sourceInfo.recognizedLibraries.some((lib) => ["three", "matter", "p5"].includes(lib)) ||
    !sourceInfo.hasAnimation;
  const sourceUsesKnownPattern = sourceInfo.hasSimKit || sourceInfo.recognizedLibraries.length > 0 || sourceInfo.isTemplate;
  const pageHasText = Boolean(layout?.h1 && (layout?.lead || sim.description));
  const readoutOrCaption = Boolean(layout?.readout || layout?.hasSteps || source.includes("<figcaption"));
  const valuesVisible = Boolean(layout?.readout || source.match(/id=["'][^"']+Value["']|class=["'][^"']*readout/));

  addCheck(checks, "runtime", "page-loads", 8, statusOk ? 8 : 0, statusOk ? "Page returns OK" : navError || `HTTP ${response?.status()}`);
  addCheck(checks, "runtime", "no-page-errors", 6, pageErrors.length === 0 ? 6 : 0, pageErrors.length ? textList(pageErrors) : "No uncaught page errors");
  addCheck(checks, "runtime", "critical-resources", 4, requestFailures.length === 0 ? 4 : 0, requestFailures.length ? textList(requestFailures) : "No critical resource failures");
  addCheck(checks, "runtime", "document-title", 2, layout?.title ? 2 : 0, layout?.title || "Missing document title");

  addCheck(checks, "visual", "stage-sized", 5, stageSized ? 5 : 0, layout?.stageRect ? `${layout.stageRect.width}x${layout.stageRect.height}` : "Missing .stage");
  addCheck(checks, "visual", "stage-nonblank", 8, shot.stats?.nonBlank ? 8 : 0, shot.stats ? `variance=${shot.stats.variance}, colors=${shot.stats.colorBuckets}` : shot.error);
  addCheck(checks, "visual", "screenshot-captures", 2, shot.buffer ? 2 : 0, shot.error || "Stage screenshot captured");
  addCheck(checks, "visual", "mobile-no-horizontal-overflow", 3, mobileLayout && !mobileLayout.horizontalOverflow ? 3 : 0, mobileLayout?.horizontalOverflow ? textList(mobileLayout.overflowEls.map((el) => `${el.tag}.${el.className || el.id}`)) : "No horizontal overflow");

  addCheck(checks, "interaction", "affordances", 4, hasAnyControls ? 4 : 0, hasAnyControls ? `${layout?.controlsCount || 0} controls / ${layout?.hasSteps ? "steps" : "no steps"}` : "No obvious controls, steps, or pointer handling");
  addCheck(checks, "interaction", "controls-labeled", 4, layout?.inputLabelsOk ? 4 : 0, layout?.inputLabelsOk ? "Inputs are labeled" : `Unlabeled: ${textList(layout?.unlabeledInputs || [])}`);
  addCheck(checks, "interaction", "poke-changes-state", 5, interactionChanged ? 5 : (hasAnyControls ? 2.5 : 0), interactionChanged ? `visual distance=${exercised.visualDistance}, readoutChanged=${exercised.readoutChanged}` : "No visible/readout change detected after poke");
  addCheck(checks, "interaction", "reset", 3, sourceInfo.hasReset ? 3 : 0, sourceInfo.hasReset ? "Reset exists" : "Missing Reset control");
  addCheck(checks, "interaction", "pause-step-speed", 2, hasPauseLike ? 2 : 0, hasPauseLike ? "Pause/step/speed affordance present or static" : "Animated sim lacks pause/step/speed control");

  addCheck(checks, "learning", "headline-and-lead", 4, pageHasText ? 4 : 0, pageHasText ? "Headline and setup copy present" : "Missing h1/lead explanatory copy");
  addCheck(checks, "learning", "readout-or-caption", 4, readoutOrCaption ? 4 : 0, readoutOrCaption ? "Readout/caption/steps present" : "Missing live readout or guidance");
  addCheck(checks, "learning", "values-visible", 4, valuesVisible ? 4 : 0, valuesVisible ? "Parameter values are visible" : "Controls do not expose numeric/current state readouts");
  addCheck(checks, "learning", "gallery-card", 4, galleryOk ? 4 : 0, galleryOk ? `${sim.group}: ${sim.tech}` : "Gallery metadata incomplete");

  addCheck(checks, "accessibility", "stage-aria", 4, layout?.stageAria ? 4 : 0, layout?.stageAria || "Missing aria-label on .stage/canvas/svg");
  addCheck(checks, "accessibility", "form-labels", 4, layout?.inputLabelsOk ? 4 : 0, layout?.inputLabelsOk ? "Inputs have labels" : `Unlabeled: ${textList(layout?.unlabeledInputs || [])}`);
  addCheck(checks, "accessibility", "keyboard-controls", 2, layout?.controlsCount ? 2 : (layout?.hasSteps ? 1 : 0), layout?.controlsCount ? "Native controls are keyboard reachable" : "No native controls detected");
  addCheck(checks, "accessibility", "reduced-motion", 3, sourceInfo.hasReducedMotion || !sourceInfo.hasAnimation ? 3 : 0, sourceInfo.hasReducedMotion ? "Reduced motion or Sim.loop support" : "Animated sim lacks reduced-motion handling");
  addCheck(checks, "accessibility", "mobile-stage", 3, mobileStageUsable ? 3 : 0, mobileLayout?.stageRect ? `${mobileLayout.stageRect.width}x${mobileLayout.stageRect.height}` : "Missing mobile .stage");

  addCheck(checks, "implementation", "no-setinterval", 3, sourceInfo.hasSetInterval ? 0 : 3, sourceInfo.hasSetInterval ? "Uses setInterval" : "No setInterval loop");
  addCheck(checks, "implementation", "loop-pattern", 3, sourceHasLoop ? 3 : 0, sourceHasLoop ? "Animation loop/library detected" : "No clear render loop or static exemption");
  addCheck(checks, "implementation", "shared-css", 2, sourceInfo.hasSimCss ? 2 : 0, sourceInfo.hasSimCss ? "Uses shared sim.css" : "Does not use shared sim.css");
  addCheck(checks, "implementation", "known-pattern", 2, sourceUsesKnownPattern ? 2 : 0, sourceUsesKnownPattern ? `Pattern: ${sourceInfo.recognizedLibraries.join(", ") || "simkit"}` : "No simkit or recognized library pattern");
  addCheck(checks, "implementation", "static-page", 2, source && !source.includes("localhost:") ? 2 : 0, source ? "Static page source found" : "Missing local source");

  const score = summarizeScore(checks);
  const status = score.percent >= 85 ? "strong" : score.percent >= 75 ? "pass" : score.percent >= 60 ? "needs-work" : "fail";
  const failures = checks.filter((check) => check.earned < check.points)
    .sort((a, b) => (b.points - b.earned) - (a.points - a.earned));

  return {
    href: sim.href,
    title: sim.title,
    group: sim.group,
    tech: sim.tech,
    description: sim.description,
    url,
    status,
    score,
    checks,
    topFailures: failures.slice(0, 8).map((check) => ({
      category: check.category,
      id: check.id,
      lost: Number((check.points - check.earned).toFixed(2)),
      notes: check.notes,
    })),
    diagnostics: {
      consoleErrors,
      pageErrors,
      requestFailures,
      layout,
      mobileLayout,
      visualStats: shot.stats,
      exercise: exercised ? {
        visualDistance: exercised.visualDistance,
        readoutChanged: exercised.readoutChanged,
      } : null,
      source: sourceInfo,
      screenshot: screenshotBase ? `${screenshotBase}.png` : null,
    },
  };
}

function aggregate(results) {
  const count = results.length;
  const average = count ? results.reduce((sum, result) => sum + result.score.percent, 0) / count : 0;
  const weakest = [...results].sort((a, b) => a.score.percent - b.score.percent).slice(0, 5);
  const categoryAverages = {};

  for (const category of RUBRIC) {
    const avg = count ? results.reduce((sum, result) => sum + result.score.byCategory[category.id].percent, 0) / count : 0;
    categoryAverages[category.id] = Number(avg.toFixed(1));
  }

  const commonFailures = new Map();
  for (const result of results) {
    for (const failure of result.topFailures) {
      const key = `${failure.category}:${failure.id}`;
      const item = commonFailures.get(key) || { key, count: 0, lost: 0, notes: new Set() };
      item.count += 1;
      item.lost += failure.lost;
      if (failure.notes) item.notes.add(failure.notes);
      commonFailures.set(key, item);
    }
  }

  return {
    count,
    average: Number(average.toFixed(1)),
    status: average >= 85 ? "strong" : average >= 75 ? "pass" : average >= 60 ? "needs-work" : "fail",
    categoryAverages,
    weakest: weakest.map((result) => ({
      href: result.href,
      title: result.title,
      score: result.score.percent,
      status: result.status,
      topFailures: result.topFailures.slice(0, 3),
    })),
    commonFailures: [...commonFailures.values()]
      .sort((a, b) => b.lost - a.lost)
      .slice(0, 10)
      .map((item) => ({
        key: item.key,
        count: item.count,
        lost: Number(item.lost.toFixed(2)),
        examples: [...item.notes].slice(0, 3),
      })),
  };
}

function markdownReport(run) {
  const lines = [];
  lines.push("# Simulation Eval Report");
  lines.push("");
  lines.push(`Run: ${run.generatedAt}`);
  lines.push(`Base URL: ${run.baseUrl}`);
  lines.push(`Overall: **${run.summary.average}/100** (${run.summary.status}) across ${run.summary.count} sims.`);
  lines.push("");
  lines.push("## Rubric");
  lines.push("");
  for (const category of RUBRIC) {
    lines.push(`- **${category.label}** (${category.points}): ${run.summary.categoryAverages[category.id]}/100 average`);
  }
  lines.push("");
  lines.push("## Results");
  lines.push("");
  lines.push("| Sim | Tech | Score | Status | Biggest misses |");
  lines.push("|---|---:|---:|---|---|");
  for (const result of run.results) {
    const misses = result.topFailures.slice(0, 3)
      .map((failure) => `${failure.id} (-${failure.lost})`)
      .join(", ");
    lines.push(`| [${result.title}](${result.href}) | ${result.tech} | ${result.score.percent} | ${result.status} | ${misses || "None"} |`);
  }
  lines.push("");
  lines.push("## Common Failure Modes");
  lines.push("");
  if (run.summary.commonFailures.length) {
    for (const failure of run.summary.commonFailures) {
      lines.push(`- **${failure.key}**: ${failure.count} sims, ${failure.lost} points lost. ${failure.examples.join(" | ")}`);
    }
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("## Weakest Sims");
  lines.push("");
  for (const sim of run.summary.weakest) {
    const topMisses = sim.topFailures.map((f) => f.id).join(", ") || "None";
    lines.push(`- **${sim.title}** (${sim.href}) scored ${sim.score}. Top misses: ${topMisses}`);
  }
  lines.push("");
  lines.push("## Method");
  lines.push("");
  lines.push("This evaluator starts the static site, discovers gallery cards, opens each sim in Chromium, watches console/page/resource failures, screenshots `.stage`, samples PNG pixels for non-blankness, exercises one range/button/stage interaction, checks mobile overflow, and scores deterministic rubric checks. It is intentionally conservative: passing the script does not replace human/LLM review of pedagogy, but failures are concrete issues to fix.");
  lines.push("");
  return `${lines.join("\n").replace(/[ \t]+$/gm, "").replace(/\n+$/g, "")}\n`;
}

async function discoverSims(browser, baseUrl, only) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${baseUrl}/sims/`, { waitUntil: "domcontentloaded", timeout: 20000 });
  const sims = await page.$$eval("a.card", (cards) => cards.map((card) => ({
    href: new URL(card.href).pathname,
    title: card.querySelector("h3")?.textContent?.trim() || card.textContent.trim(),
    tech: card.querySelector(".tech")?.textContent?.trim() || "",
    description: card.querySelector("p")?.textContent?.trim() || "",
    group: card.closest("section")?.querySelector("h2")?.textContent?.trim() || "",
  })));
  await page.close();
  return only
    ? sims.filter((sim) => `${sim.href} ${sim.title} ${sim.tech} ${sim.group}`.toLowerCase().includes(only.toLowerCase()))
    : sims;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { chromium } = await importPlaywright();
  if (opts.screenshots) await mkdir(opts.screenshots, { recursive: true });

  const server = await startServer(opts);
  let browser;
  try {
    browser = await chromium.launch({ headless: !opts.headed });
    const sims = await discoverSims(browser, server.baseUrl, opts.only);
    if (!sims.length) throw new Error(opts.only ? `No sims matched --only ${opts.only}` : "No sims discovered from /sims/");

    const results = [];
    for (const sim of sims) {
      process.stdout.write(`Evaluating ${sim.href} ... `);
      const result = await evaluateSim(browser, server.baseUrl, sim, opts);
      results.push(result);
      process.stdout.write(`${result.score.percent}/100 (${result.status})\n`);
    }

    const run = {
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      root,
      screenshots: opts.screenshots,
      rubric: RUBRIC,
      summary: aggregate(results),
      results,
    };

    await mkdir(path.dirname(opts.out), { recursive: true });
    await mkdir(path.dirname(opts.report), { recursive: true });
    await writeFile(opts.out, `${JSON.stringify(run, null, 2)}\n`);
    await writeFile(opts.report, markdownReport(run));

    console.log(`\nWrote ${path.relative(root, opts.out)}`);
    console.log(`Wrote ${path.relative(root, opts.report)}`);
    if (opts.screenshots) console.log(`Screenshots: ${opts.screenshots}`);

    if (run.summary.status === "fail") process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});
