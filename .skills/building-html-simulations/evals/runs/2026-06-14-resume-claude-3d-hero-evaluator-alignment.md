# Resume Claude 3D hero and evaluator alignment

- Date: 2026-06-14T18:03:04.688Z
- Skill: `.skills/building-html-simulations`
- Status: strong

## Evaluators

- npm run eval:sims full gallery

## Artifacts

- sims/eval-results/latest.md
- sims/bicycle/index.html
- scripts/evaluate-sims.mjs

## Results

- Completed the interrupted Claude 3D Bicycle hero pass and brought the full gallery to 100/100 across 61 unique paths.

## Key Failures

- None

## Durable Lessons

- Visual-fidelity upgrades still need the same product controls: reset, reduced-motion handling, and a first-frame interaction that visibly changes state.
- The evaluator must match local site conventions: de-dupe duplicate gallery links, count .cap guidance, and grade course modules as navigable lesson sequences rather than canvas stages.

## Adopted Decisions

- Updated evaluator/thumbnail scripts, patched Bicycle, Gears, Moon, and refreshed the canonical eval report.

## Deferred Decisions

- None

## Files Changed

- sims/bicycle/index.html
- sims/gears/index.html
- sims/moon/index.html
- scripts/evaluate-sims.mjs
- scripts/thumbnails.mjs
- sims/eval-results/latest.md

## Follow-Up Checks

- None
