# Feedback Loop Reference

Use this reference when a skill's output has been evaluated and the result might imply a change to the skill itself.

## Evaluation Surfaces

Use more than one surface when the skill output is user-facing or high-leverage:

- **Deterministic evaluator**: tests, lint, visual diff, schema validation, browser check, score rubric.
- **Independent review**: a separate agent or human reviews the artifact without the implementation author's conclusions.
- **Skill audit**: compare findings against SKILL.md, references, scripts, and assets to see whether the skill caused, missed, or already covered the behavior.
- **Regression check**: rerun after changes and preserve the final report path.

## Finding Taxonomy

Classify every important finding before editing:

| Class | Meaning | Typical action |
|---|---|---|
| Artifact fix | Current output is wrong or incomplete | Patch artifact; log only if notable |
| Skill gap | Future agents need clearer/different guidance | Update SKILL.md or a reference |
| Evaluator gap | The grader missed something or overfit | Update the evaluator and rerun |
| Script/template gap | Repetition should be encoded deterministically | Add or update `scripts/` or `assets/` |
| Scope gap | Skill is doing too much or overlaps another skill | Split, rename, or adjust trigger description |

## Cohesion Gate

Before changing a skill, answer:

- Does the change alter future behavior for a class of tasks?
- Is the right layer being updated: trigger, workflow, reference, script, asset, or evaluator?
- Will the next agent know when to load the deeper reference?
- Does the evaluator now check the invariant the skill promises?
- Does the log explain why the update belongs in the skill rather than only in the artifact?

If the answer is no, patch the artifact and log a deferred note instead of expanding the skill.

## Independent Reviewer Prompt

Use this shape for a separate reviewer:

> Review this skill's output as an independent evaluator. Do not edit files. Compare the artifact against the skill's stated workflow and quality bar. Report: objective failures, subjective quality gaps, whether each issue is an artifact fix or skill gap, and the highest-impact skill update if any. Prefer concrete recurring defects over taste notes.

## Log Fields

Each log entry should capture:

- Date/time
- Skill path
- Output artifact(s)
- Evaluator(s)
- Result/score
- Key failures
- Lessons learned
- Decisions adopted into the skill
- Decisions deferred
- Files changed
- Follow-up eval command
