# Simulation Evaluation

Use the evaluator whenever a sim is created, repaired, or reviewed. The goal is the same as an agent eval: make the pass/fail signal concrete enough that another agent can improve the artifact without guessing.

## What the Grader Checks

Run:

```sh
npm run eval:sims
```

The script in `scripts/evaluate-sims.mjs`:

- starts the static site with `python3 -m http.server`;
- discovers every `a.card` on `/sims/`;
- opens each sim in Chromium with Playwright;
- records uncaught JS errors, console errors, and failed critical resources;
- screenshots `.stage` and samples pixels to catch blank canvases/WebGL scenes;
- exercises one range, one button, and one stage click;
- checks mobile horizontal overflow and stage size;
- scores a 100-point rubric and writes JSON + Markdown to `sims/eval-results/latest.*`.

## Rubric

- Runtime health (20): page loads, no uncaught errors, critical resources resolve, document title exists.
- Visual frame (18): stage exists, stage is large enough, screenshot is nonblank, mobile has no horizontal overflow.
- Interaction (18): visible affordances, labeled controls, a poke changes state/readout/visuals, Reset exists, animated sims expose pause/step/speed or a comparable control.
- Learning layer (16): headline/setup copy, live readout/caption/steps, current values visible, gallery card metadata.
- Accessibility/mobile (16): stage `aria-label`, form labels, keyboard-reachable native controls, reduced-motion/visibility handling, mobile stage remains usable.
- Implementation (12): no `setInterval`, stable loop/library pattern, shared `sim.css`, `simkit` or an appropriate known library, static page source.

Treat scores this way:

- 85+ strong: ship after a quick human look.
- 75-84 pass: acceptable, but fix cheap rubric misses.
- 60-74 needs work: improve before adding more sims.
- Below 60 fail: fix runtime/visual/interaction first.

## Independent Review Pattern

Use deterministic checks first, then a separate agent/LLM review. Give the reviewer only the rubric, source paths, screenshots/report, and this prompt shape:

> Review these simulations as an independent grader. Do not edit files. For each sim, report whether the first frame teaches the core idea, whether controls produce immediate feedback, whether the sim is usable on mobile, and the highest-impact fix. Prefer concrete defects over taste notes.

Merge the deterministic report and independent review into the next implementation pass. When they disagree, trust objective failures first, then use the independent review for pedagogy and affordance quality.

## Skill Feedback Loop

After a material eval run, use `$meta-skill-evaluator` to decide whether the result should update this skill. Keep the log in this skill directory:

```sh
node .skills/meta-skill-evaluator/scripts/log-skill-eval.mjs \
  --skill .skills/building-html-simulations \
  --title "Simulation gallery eval" \
  --evaluator "npm run eval:sims + independent reviewer" \
  --artifact sims/eval-results/latest.md \
  --artifact sims/eval-results/latest.json \
  --result "18/18 sims scored 100/100" \
  --lesson "Semantic labels, stage aria-labels, and reset/pause controls were recurring gaps" \
  --decision "Made labels, accessibility, lifecycle controls, and skill-local eval logging part of the workflow"
```

Update this skill when the finding is reusable:

- recurring failures across multiple sims;
- a missing invariant in the generation workflow;
- a grader false positive/negative that would distort future work;
- a starter/template weakness that causes repeated patching;
- an independent reviewer finding about pedagogy or affordance quality that should become a standard.

Do not update this skill for one-off content mistakes. Patch the artifact, log only if useful, and keep the skill lean.

## Eval Design Notes

Keep eval cases realistic and repeatable:

- Separate criteria from implementation so the grader does not bless a specific technology choice.
- Save artifacts (`latest.json`, `latest.md`, screenshots) so regressions are inspectable.
- Prefer exact observable checks for runtime, blank screens, controls, labels, and mobile overflow.
- Use human/LLM review for subjective pedagogy: "does this teach the idea?", "is the first thing to try obvious?", and "are the labels enough?"
- Fix the weakest common failure mode across the gallery before polishing one sim.
- Convert repeated fixes into a cohesive skill change: update generation guidance, starter assets, evaluator checks, and references together when they describe the same invariant.

Sources:

- OpenAI eval and grader guidance: https://platform.openai.com/docs/guides/evals
- OpenAI eval skills guidance: https://developers.openai.com/blog/eval-skills
- Anthropic test and evaluate guidance: https://docs.anthropic.com/en/docs/build-with-claude/develop-tests
