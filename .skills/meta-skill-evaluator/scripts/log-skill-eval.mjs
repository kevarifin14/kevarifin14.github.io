#!/usr/bin/env node
import { existsSync } from "node:fs";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const opts = {
    skill: null,
    title: "Skill evaluation",
    evaluator: [],
    artifact: [],
    result: [],
    failure: [],
    lesson: [],
    decision: [],
    deferred: [],
    changed: [],
    followup: [],
    status: "recorded",
    runId: null,
    runFile: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--skill") opts.skill = argv[++i];
    else if (arg === "--title") opts.title = argv[++i];
    else if (arg === "--evaluator") opts.evaluator.push(argv[++i]);
    else if (arg === "--artifact") opts.artifact.push(argv[++i]);
    else if (arg === "--result") opts.result.push(argv[++i]);
    else if (arg === "--failure") opts.failure.push(argv[++i]);
    else if (arg === "--lesson") opts.lesson.push(argv[++i]);
    else if (arg === "--decision") opts.decision.push(argv[++i]);
    else if (arg === "--deferred") opts.deferred.push(argv[++i]);
    else if (arg === "--changed") opts.changed.push(argv[++i]);
    else if (arg === "--followup") opts.followup.push(argv[++i]);
    else if (arg === "--status") opts.status = argv[++i];
    else if (arg === "--run-id") opts.runId = argv[++i];
    else if (arg === "--no-run-file") opts.runFile = false;
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node .skills/meta-skill-evaluator/scripts/log-skill-eval.mjs --skill <skill-dir> [options]

Options:
  --title TEXT       Entry title
  --evaluator TEXT   Evaluator used; repeatable
  --artifact PATH    Artifact path; repeatable
  --result TEXT      Result or score; repeatable
  --failure TEXT     Key failure; repeatable
  --lesson TEXT      Durable lesson; repeatable
  --decision TEXT    Adopted skill/evaluator decision; repeatable
  --deferred TEXT    Deferred decision; repeatable
  --changed PATH     Changed file path; repeatable
  --followup TEXT    Follow-up command/check; repeatable
  --status TEXT      Status label, e.g. strong, pass, needs-work
  --run-id TEXT      Stable run slug
  --no-run-file      Append only evals/log.md`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!opts.skill) throw new Error("--skill is required");
  return opts;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "skill-eval";
}

function bullets(items, fallback = "None") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

async function ensureLog(logPath, skillPath) {
  if (existsSync(logPath)) return;
  const skillName = path.basename(skillPath);
  await writeFile(logPath, `# Skill Evaluation Log

Skill: \`${skillName}\`

This log records evaluation runs that produced durable lessons for the skill. Keep entries concise and link large artifacts instead of copying them.
`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const skillPath = path.resolve(cwd, opts.skill);
  const skillMd = path.join(skillPath, "SKILL.md");
  if (!existsSync(skillMd)) throw new Error(`No SKILL.md found at ${skillMd}`);

  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const runId = opts.runId || `${date}-${slugify(opts.title)}`;
  const evalDir = path.join(skillPath, "evals");
  const runsDir = path.join(evalDir, "runs");
  const logPath = path.join(evalDir, "log.md");
  const runPath = path.join(runsDir, `${runId}.md`);

  await mkdir(runsDir, { recursive: true });
  await ensureLog(logPath, skillPath);

  const rel = (p) => {
    const abs = path.resolve(cwd, p);
    return path.relative(skillPath, abs).startsWith("..") ? path.relative(cwd, abs) : path.relative(skillPath, abs);
  };

  const runBody = `# ${opts.title}

- Date: ${now}
- Skill: \`${path.relative(cwd, skillPath)}\`
- Status: ${opts.status}

## Evaluators

${bullets(opts.evaluator)}

## Artifacts

${bullets(opts.artifact.map(rel))}

## Results

${bullets(opts.result)}

## Key Failures

${bullets(opts.failure)}

## Durable Lessons

${bullets(opts.lesson)}

## Adopted Decisions

${bullets(opts.decision)}

## Deferred Decisions

${bullets(opts.deferred)}

## Files Changed

${bullets(opts.changed.map(rel))}

## Follow-Up Checks

${bullets(opts.followup)}
`;

  if (opts.runFile) await writeFile(runPath, `${runBody.trimEnd()}\n`);

  const logEntry = `## ${now} - ${opts.title}

- Status: ${opts.status}
- Result: ${opts.result.join("; ") || "Not recorded"}
- Artifacts: ${opts.artifact.map(rel).join(", ") || "None"}
- Lessons: ${opts.lesson.join("; ") || "None"}
- Decisions: ${opts.decision.join("; ") || "None"}
${opts.runFile ? `- Run file: ${path.relative(skillPath, runPath)}` : ""}`;

  await appendFile(logPath, `${logEntry.trimEnd()}\n`);
  console.log(`Wrote ${path.relative(cwd, logPath)}`);
  if (opts.runFile) console.log(`Wrote ${path.relative(cwd, runPath)}`);
}

main().catch((err) => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});
