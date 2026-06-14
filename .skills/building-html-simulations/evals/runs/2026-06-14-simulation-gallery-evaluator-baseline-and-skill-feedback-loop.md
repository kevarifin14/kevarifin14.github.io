# Simulation gallery evaluator baseline and skill feedback loop

- Date: 2026-06-14T02:10:58.011Z
- Skill: `.skills/building-html-simulations`
- Status: strong

## Evaluators

- npm run eval:sims deterministic Playwright grader
- Independent read-only agent review

## Artifacts

- sims/eval-results/latest.md
- sims/eval-results/latest.json

## Results

- 18/18 gallery simulations scored 100/100 after remediation

## Key Failures

- Initial baseline exposed recurring semantic label and stage aria-label gaps
- Engine-native examples needed explicit lifecycle controls instead of relying on library defaults
- Galton opened too empty to teach the distribution without interaction

## Durable Lessons

- Accessibility, reset/pause, reduced-motion, and first-frame teaching quality must be part of generation, not late polish
- Evaluator behavior should distinguish generic interaction probes from reset/clear controls
- Durable findings need to be logged inside the skill directory and reflected in SKILL.md/reference/evaluator together

## Adopted Decisions

- Added meta-skill-evaluator workflow and skill-local eval log convention
- Updated building-html-simulations workflow to run evals and log durable lessons
- Kept deterministic sim evaluator as the objective gate for future HTML simulation work

## Deferred Decisions

- None

## Files Changed

- SKILL.md
- reference/evaluation.md
- scripts/evaluate-sims.mjs
- sims/eval-results/latest.md

## Follow-Up Checks

- npm run eval:sims
- npm run eval:skills
