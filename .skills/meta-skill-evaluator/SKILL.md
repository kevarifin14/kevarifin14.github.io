---
name: meta-skill-evaluator
description: Use when evaluating an agent skill's outputs, keeping skill-local eval logs, deciding whether failures should update the artifact, evaluator, or skill instructions, and turning repeated evaluation findings into cohesive SKILL.md/reference/script improvements. Applies to self-improving skill loops such as "generate with a skill, evaluate output, learn from the result, then update the skill agents use next time."
---

# Meta Skill Evaluator

Use this skill to close the loop:

```
skill generates output -> output is evaluated -> lessons are logged -> durable lessons update the skill -> evaluator is rerun
```

The goal is not to make every eval failure mutate the skill. The goal is to separate one-off artifact fixes from durable improvements that should change how future agents work.

## Core Workflow

1. Identify the skill, the generated artifact, and the evaluator used.
2. Run the product evaluator first (tests, visual checks, rubric, independent review, or domain-specific grader).
3. Classify each finding:
   - **Artifact fix**: the current output is wrong, but the skill already gave enough guidance.
   - **Skill gap**: future agents are likely to repeat the miss unless SKILL.md or a reference changes.
   - **Evaluator gap**: the grader is missing an objective check or has a false positive.
   - **Asset/script gap**: a reusable template, starter file, or deterministic script would prevent repeated drift.
4. Log the run inside the skill directory before or alongside edits:

   ```sh
   node .skills/meta-skill-evaluator/scripts/log-skill-eval.mjs \
     --skill .skills/building-html-simulations \
     --title "Simulation gallery eval" \
     --evaluator "npm run eval:sims + independent reviewer" \
     --artifact sims/eval-results/latest.md \
     --result "18/18 sims scored 100/100" \
     --lesson "Semantic labels and stage aria-labels were recurring gaps" \
     --decision "Made labels/stage aria part of the generation checklist"
   ```

5. Make cohesive skill updates:
   - Update the narrowest durable contract: trigger, workflow step, reference, script, or asset.
   - If a new invariant was learned, update both the generation instructions and the evaluator.
   - Avoid one-line memory patches like "remember to do X" when a template, checklist, or script would encode it better.
6. Re-run the evaluator and validate the skill structure.
7. Add or update the log entry with what was adopted and what was deferred.

## When to Update the Skill

Update the skill when at least one is true:

- The same class of failure appears across multiple outputs.
- The fix changes the definition of done, not just the current artifact.
- The evaluator found an objective invariant that the generation workflow did not mention.
- The independent reviewer found a pedagogy/usability pattern worth reusing.
- A script/template/reference can prevent future agents from hand-rolling fragile behavior.

Do not update the skill when:

- The issue is purely content-specific.
- The skill already said what to do and the agent ignored it.
- The proposed change would weaken the evaluator just to pass the current output.
- The lesson is too vague to operationalize.

## Log Convention

Each skill that participates in this loop should keep:

```
skill-name/
├── SKILL.md
├── evals/
│   ├── log.md
│   └── runs/
│       └── <date>-<slug>.md
```

Keep logs concise. Link to large artifacts rather than copying them. Do not store secrets, credentials, private user data, or bulky screenshots in the skill directory.

Read [reference/feedback-loop.md](reference/feedback-loop.md) for the full rubric, update taxonomy, and review prompts.

## Verification

- Run the product evaluator after changes.
- Run any skill validator available for the host.
- Run `node .skills/meta-skill-evaluator/scripts/check-skill-evals.mjs .skills` to see which shared skills have logs.
- Inspect the diff: the skill update should explain future behavior, not merely memorialize one patch.
