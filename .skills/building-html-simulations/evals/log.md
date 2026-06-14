# Skill Evaluation Log

Skill: `building-html-simulations`

This log records evaluation runs that produced durable lessons for the skill. Keep entries concise and link large artifacts instead of copying them.

## 2026-06-14T02:10:58.011Z - Simulation gallery evaluator baseline and skill feedback loop

- Status: strong
- Result: 18/18 gallery simulations scored 100/100 after remediation
- Artifacts: sims/eval-results/latest.md, sims/eval-results/latest.json
- Lessons: Accessibility, reset/pause, reduced-motion, and first-frame teaching quality must be part of generation, not late polish; Evaluator behavior should distinguish generic interaction probes from reset/clear controls; Durable findings need to be logged inside the skill directory and reflected in SKILL.md/reference/evaluator together
- Decisions: Added meta-skill-evaluator workflow and skill-local eval log convention; Updated building-html-simulations workflow to run evals and log durable lessons; Kept deterministic sim evaluator as the objective gate for future HTML simulation work
- Run file: evals/runs/2026-06-14-simulation-gallery-evaluator-baseline-and-skill-feedback-loop.md

## 2026-06-14T02:55:10.181Z - Course-inspired simulation batch

- Status: strong
- Result: 22/22 simulations scored 100/100 after adding Bayes Test, Bias-Variance, MDP Gridworld, and PageRank Surfer
- Artifacts: sims/eval-results/latest.md, sims/eval-results/latest.json
- Lessons: Research is part of simulation building: course sources and existing explorables should be distilled into an original mechanism before implementation; Strong first frames matter for algorithm sims; warmed-start values/ranks teach better than blank initialization
- Decisions: Added an explicit research-pass step to the building-html-simulations workflow; Updated README source trail for course-inspired sims
- Run file: evals/runs/2026-06-14-course-inspired-simulation-batch.md
## 2026-06-14T03:11:22.767Z - Additional course-inspired simulation batch

- Status: strong
- Result: 26/26 gallery sims scored 100/100 after adding A*, Kalman filter, reaction-diffusion, and Schelling model
- Artifacts: sims/eval-results/latest.md, sims/astar/index.html, sims/kalman/index.html, sims/reaction-diffusion/index.html, sims/schelling/index.html
- Lessons: The strongest next topics had visible frontier, uncertainty, pattern-formation, or clustering dynamics, plus a direct parameter to manipulate.
- Decisions: No skill instruction change needed; the existing research pass, Canvas starter pattern, and evaluator covered this batch.
- Run file: evals/runs/2026-06-14-additional-course-inspired-simulation-batch.md
## 2026-06-14T03:24:17.356Z - Gallery coverage audit plus stochastic simulation batch

- Status: strong
- Result: All navigable sims are linked from the gallery; 31/31 gallery pages scored 100/100
- Artifacts: sims/eval-results/latest.md, sims/index.html, sims/markov-chain/index.html, sims/random-walk/index.html, sims/monte-carlo-pi/index.html, sims/predator-prey/index.html
- Lessons: When exposing support pages like _template in the gallery, they need the same live readout/caption affordance as real sims.
- Decisions: Added the missing _template card and upgraded _template with a readout instead of leaving a lower-scoring visible page.
- Run file: evals/runs/2026-06-14-gallery-coverage-audit-plus-stochastic-simulation-batch.md
## 2026-06-14T05:07:56.073Z - Twenty-simulation expansion with thumbnail gallery

- Status: strong
- Result: 53/53 linked gallery pages scored 100/100 after adding a 20+ page expansion and refreshing thumbnails
- Artifacts: sims/eval-results/latest.md, sims/index.html, sims/lib/mini-labs.js
- Lessons: For large batches, a shared mini-lab engine keeps controls, readouts, reset behavior, and evaluator affordances consistent across many small simulations.
- Decisions: Kept the shared mini-lab engine for compact algorithm/probability/queue/network labs; generated thumbnails as part of shipping.
- Run file: evals/runs/2026-06-14-twenty-simulation-expansion-with-thumbnail-gallery.md
## 2026-06-14T16:51:34.969Z - Ciechanowski archive study

- Status: strong
- Result: Mapped 22 archive articles into reusable simulation and explainer patterns
- Artifacts: reference/ciechanowski-archive.md
- Lessons: Long explainers should be planned as prerequisite ladders with one focused draggable figure per concept and a final composed figure.
- Decisions: Added an article-level archive map reference instead of further bloating SKILL.md.
- Run file: evals/runs/2026-06-14-ciechanowski-archive-study.md
## 2026-06-14T18:03:04.688Z - Resume Claude 3D hero and evaluator alignment

- Status: strong
- Result: Completed the interrupted Claude 3D Bicycle hero pass and brought the full gallery to 100/100 across 61 unique paths.
- Artifacts: sims/eval-results/latest.md, sims/bicycle/index.html, scripts/evaluate-sims.mjs
- Lessons: Visual-fidelity upgrades still need the same product controls: reset, reduced-motion handling, and a first-frame interaction that visibly changes state.; The evaluator must match local site conventions: de-dupe duplicate gallery links, count .cap guidance, and grade course modules as navigable lesson sequences rather than canvas stages.
- Decisions: Updated evaluator/thumbnail scripts, patched Bicycle, Gears, Moon, and refreshed the canonical eval report.
- Run file: evals/runs/2026-06-14-resume-claude-3d-hero-evaluator-alignment.md
