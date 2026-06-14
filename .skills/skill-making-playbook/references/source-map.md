# Source Map

This file records the research sources and the practical takeaways distilled into this skill.

## Anthropic Agent Skills

Sources:

- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- https://github.com/anthropics/skills
- https://code.claude.com/docs/en/skills

Takeaways:

- Skills are filesystem packages with frontmatter, instructions, and optional resources.
- Progressive disclosure is the core architecture: metadata first, body when triggered, resources as needed.
- The description must include both capability and trigger conditions.
- Utility scripts are preferred for reliable, repeatable operations and can save context.
- Skills should be tested with realistic usage, not only inspected for formatting.
- Security matters because skills can steer tool use and execute bundled code.

Representative files inspected locally:

- `/tmp/skill-research/anthropics-skills/skills/skill-creator/SKILL.md`
- `/tmp/skill-research/anthropics-skills/skills/pdf/SKILL.md`
- `/tmp/skill-research/anthropics-skills/skills/pptx/SKILL.md`
- `/tmp/skill-research/anthropics-skills/skills/webapp-testing/SKILL.md`

## Matt Pocock Skills

Sources:

- https://github.com/mattpocock/skills
- https://www.aihero.dev/5-agent-skills-i-use-every-day
- https://www.aihero.dev/skill-test-driven-development-claude-code
- https://www.aihero.dev/skills-handoff

Takeaways:

- Short skills can be powerful when the words constrain the agent at the exact drift point.
- Skills work best as engineering process primitives: grill, PRD, issues, TDD, diagnose, handoff.
- A skill should often force sequencing: align before planning, plan before issues, one test before one implementation.
- Ask the codebase before asking the user when a question is answerable from files.
- Prefer vertical slices and tracer bullets over horizontal implementation layers.
- Preserve context by handing off pointers to artifacts instead of duplicating them.

Representative files inspected locally:

- `/tmp/skill-research/mattpocock-skills/skills/productivity/grill-me/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/engineering/grill-with-docs/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/engineering/to-prd/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/engineering/to-issues/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/engineering/tdd/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/engineering/diagnose/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/productivity/handoff/SKILL.md`
- `/tmp/skill-research/mattpocock-skills/skills/productivity/write-a-skill/SKILL.md`

## Garry Tan GBrain And GStack

Sources:

- https://github.com/garrytan/gbrain
- https://github.com/garrytan/gbrain/blob/master/docs/ethos/THIN_HARNESS_FAT_SKILLS.md
- https://github.com/garrytan/gbrain/blob/master/docs/GBRAIN_SKILLPACK.md
- https://github.com/garrytan/gstack

Takeaways:

- "Thin harness, fat skills": keep orchestration thin and encode domain judgment in skills.
- A skill is like a method call: the process stays stable while arguments vary.
- Separate latent judgment from deterministic execution.
- Codify repeated work after a small manual prototype and user approval.
- Use MECE ownership to avoid overlapping skills that fight over the same outputs.
- Durable skills should be written atomically after tests pass and the user approves.
- Long workflows can use section indexes and blocking self-checks so the agent reads the correct detailed file before executing.

Representative files inspected locally:

- `/tmp/skill-research/garrytan-gbrain/docs/ethos/THIN_HARNESS_FAT_SKILLS.md`
- `/tmp/skill-research/garrytan-gbrain/docs/ethos/MARKDOWN_SKILLS_AS_RECIPES.md`
- `/tmp/skill-research/garrytan-gbrain/docs/guides/skill-development.md`
- `/tmp/skill-research/garrytan-gbrain/docs/guides/skillopt.md`
- `/tmp/skill-research/garrytan-gstack/skillify/SKILL.md`
- `/tmp/skill-research/garrytan-gstack/plan-ceo-review/SKILL.md`
- `/tmp/skill-research/garrytan-gstack/plan-eng-review/SKILL.md`
- `/tmp/skill-research/garrytan-gstack/ship/SKILL.md`

## Local Codex Skill-Creator Guidance

Source:

- `/Users/kevin/.codex/skills/.system/skill-creator/SKILL.md`

Takeaways:

- Use lowercase hyphenated skill names.
- Use only `name` and `description` in Codex skill frontmatter.
- Initialize with the scaffold script when creating a new skill.
- Keep `SKILL.md` lean and move long details to references.
- Validate with `quick_validate.py`.
- Forward-test complex skills when possible.
