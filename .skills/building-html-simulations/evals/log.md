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
