# Gallery coverage audit plus stochastic simulation batch

- Date: 2026-06-14T03:24:17.356Z
- Skill: `.skills/building-html-simulations`
- Status: strong

## Evaluators

- coverage audit: sims/*/index.html versus sims/index.html cards
- npm run eval:sims -- --no-screenshots

## Artifacts

- sims/eval-results/latest.md
- sims/index.html
- sims/markov-chain/index.html
- sims/random-walk/index.html
- sims/monte-carlo-pi/index.html
- sims/predator-prey/index.html

## Results

- All navigable sims are linked from the gallery; 31/31 gallery pages scored 100/100

## Key Failures

- None

## Durable Lessons

- When exposing support pages like _template in the gallery, they need the same live readout/caption affordance as real sims.

## Adopted Decisions

- Added the missing _template card and upgraded _template with a readout instead of leaving a lower-scoring visible page.

## Deferred Decisions

- None

## Files Changed

- sims/index.html
- sims/_template/index.html
- sims/markov-chain/index.html
- sims/random-walk/index.html
- sims/monte-carlo-pi/index.html
- sims/predator-prey/index.html
- sims/README.md

## Follow-Up Checks

- Keep running the gallery coverage audit before publishing batches.
