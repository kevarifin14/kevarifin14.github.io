# Course-inspired simulation batch

- Date: 2026-06-14T02:55:10.181Z
- Skill: `.skills/building-html-simulations`
- Status: strong

## Evaluators

- npm run eval:sims full gallery

## Artifacts

- sims/eval-results/latest.md
- sims/eval-results/latest.json

## Results

- 22/22 simulations scored 100/100 after adding Bayes Test, Bias-Variance, MDP Gridworld, and PageRank Surfer

## Key Failures

- None

## Durable Lessons

- Research is part of simulation building: course sources and existing explorables should be distilled into an original mechanism before implementation
- Strong first frames matter for algorithm sims; warmed-start values/ranks teach better than blank initialization

## Adopted Decisions

- Added an explicit research-pass step to the building-html-simulations workflow
- Updated README source trail for course-inspired sims

## Deferred Decisions

- None

## Files Changed

- SKILL.md
- sims/README.md
- sims/index.html
- sims/bayes-test/index.html
- sims/bias-variance/index.html
- sims/gridworld/index.html
- sims/pagerank/index.html

## Follow-Up Checks

- npm run eval:sims
