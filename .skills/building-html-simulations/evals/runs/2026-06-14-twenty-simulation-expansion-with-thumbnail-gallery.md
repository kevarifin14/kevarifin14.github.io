# Twenty-simulation expansion with thumbnail gallery

- Date: 2026-06-14T05:07:56.073Z
- Skill: `.skills/building-html-simulations`
- Status: strong

## Evaluators

- coverage audit: sims/*/index.html versus sims/index.html cards
- npm run eval:sims -- --no-screenshots
- npm run thumbs

## Artifacts

- sims/eval-results/latest.md
- sims/index.html
- sims/lib/mini-labs.js

## Results

- 53/53 linked gallery pages scored 100/100 after adding a 20+ page expansion and refreshing thumbnails

## Key Failures

- None

## Durable Lessons

- For large batches, a shared mini-lab engine keeps controls, readouts, reset behavior, and evaluator affordances consistent across many small simulations.

## Adopted Decisions

- Kept the shared mini-lab engine for compact algorithm/probability/queue/network labs; generated thumbnails as part of shipping.

## Deferred Decisions

- None

## Files Changed

- sims/lib/mini-labs.js
- sims/index.html
- sims/README.md

## Follow-Up Checks

- Continue using gallery coverage audit plus full eval before each publish.
