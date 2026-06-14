---
name: skill-making-playbook
description: Design, audit, evaluate, and improve agent skills using distilled practices from Anthropic Agent Skills, Matt Pocock's engineering skills, Garry Tan's GBrain/GStack approach, and the local meta-skill-evaluator feedback loop. Use when creating a new SKILL.md, turning a repeated workflow into a skill, reviewing an existing skill for quality, splitting skill content into references/scripts/assets, improving skill trigger descriptions, adding skill-local eval logs, or deciding whether a capability belongs in markdown, deterministic code, or both.
---

# Skill Making Playbook

Use this skill to turn repeated agent work into durable capability. Treat a skill as an executable onboarding guide: the user supplies the task-specific inputs, and the skill supplies the repeatable process.

## Core Workflow

1. Extract the real workflow from the conversation before asking new questions. Identify the task, inputs, outputs, tools, constraints, edge cases, and what the user corrected or cared about.
2. Decide the shape:
   - Use markdown skill instructions for judgment, adaptation, interviews, planning, reviews, and domain process.
   - Use scripts for deterministic work where the same input should produce the same output.
   - Use references for detailed knowledge that is only sometimes needed.
   - Use assets for templates, starter files, images, fonts, or other files that should be copied or used.
3. Check overlap with existing skills. Prefer extending or parameterizing an existing skill when the new workflow shares the same owner, output, or task class.
4. Prototype before codifying when the workflow is new or recurring. Run it manually on 3-10 realistic examples, inspect the output, and capture what actually mattered.
5. Write the skill with progressive disclosure:
   - Frontmatter: `name` and `description` only unless the host format explicitly supports more.
   - Body: concise workflow and navigation to resources.
   - References: deep details, variants, examples, schemas, and long checklists.
   - Scripts: executable utilities with clear command examples and output shapes.
6. Make the trigger description specific and assertive. Include what the skill does and when to use it, with concrete phrases, file types, task types, and adjacent situations.
7. Add verification. For coding workflows, require tests or a reproducible feedback loop. For document/design workflows, require rendered or visual inspection. For skill-building workflows, validate structure and forward-test realistic prompts when appropriate.
8. Add a skill-local eval log for skills that will be reused or iterated. Use `$meta-skill-evaluator` when available: keep `evals/log.md`, link run artifacts, and classify findings as artifact fixes, skill gaps, evaluator gaps, or script/template gaps.
9. Keep the skill durable. Avoid stale file paths, one-off conversation fragments, undocumented assumptions, unchecked TODO stubs, and vague "remember this" patches that should be encoded as workflow, reference, script, or asset changes.

## Pattern Library

Read [references/patterns.md](references/patterns.md) when designing, rewriting, or reviewing a skill. It contains the distilled guidance from the research pass: trigger writing, skill-vs-code decisions, workflow patterns, validation, and anti-patterns.

Read [references/source-map.md](references/source-map.md) when the user asks where the guidance came from or wants to compare Anthropic, Matt Pocock, and Garry Tan/GBrain patterns directly.

## Skill Quality Gate

Before calling a skill ready, verify:

- [ ] The description can trigger the skill without the body being loaded.
- [ ] The body starts with the high-value workflow, not background exposition.
- [ ] Required decisions and STOP points are explicit.
- [ ] Long details are one link away, not deeply nested.
- [ ] Deterministic steps are scripts or exact commands where practical.
- [ ] The skill says how to verify completion.
- [ ] Reusable skills have an eval/logging path, or the reason for skipping one is clear.
- [ ] Durable lessons from output evals have been applied cohesively across instructions, references, scripts/assets, and evaluators where needed.
- [ ] The skill does not overlap confusingly with another installed skill.
- [ ] There are no TODO-only sections, placeholders, secrets, or surprising side effects.

## Output Style

When helping create or revise a skill, produce the concrete file changes unless the user only asked for advice. Explain major tradeoffs briefly, then implement.
