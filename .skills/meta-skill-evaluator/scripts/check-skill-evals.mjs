#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function main() {
  const root = path.resolve(process.cwd(), process.argv[2] || ".skills");
  const json = process.argv.includes("--json");
  const dirs = await readdir(root, { withFileTypes: true });
  const rows = [];

  for (const dir of dirs) {
    if (!dir.isDirectory() && !dir.isSymbolicLink()) continue;
    const skillDir = path.join(root, dir.name);
    const skillMd = path.join(skillDir, "SKILL.md");
    if (!existsSync(skillMd)) continue;
    const logPath = path.join(skillDir, "evals/log.md");
    let entries = 0;
    let last = null;
    if (existsSync(logPath)) {
      const log = await readFile(logPath, "utf8");
      const matches = [...log.matchAll(/^## ([^\n]+)/gm)].map((m) => m[1]);
      entries = matches.length;
      last = matches.at(-1) || null;
    }
    rows.push({
      skill: dir.name,
      hasLog: existsSync(logPath),
      entries,
      last,
      log: existsSync(logPath) ? path.relative(process.cwd(), logPath) : null,
    });
  }

  if (json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  const width = Math.max(5, ...rows.map((row) => row.skill.length));
  for (const row of rows) {
    const status = row.hasLog ? `${row.entries} entries` : "missing log";
    console.log(`${row.skill.padEnd(width)}  ${status}${row.last ? `  ${row.last}` : ""}`);
  }
}

main().catch((err) => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});
