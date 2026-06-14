# Canonical Shared Skills

This directory is the single source of truth for shared project skills used by Claude and Codex.

Edit skills here only:

- `.skills/building-html-simulations/`
- `.skills/meta-skill-evaluator/`
- `.skills/skill-making-playbook/`

Agent-facing locations are symlinks back to this directory:

- Claude project skills: `.claude/skills/<skill-name> -> ../../.skills/<skill-name>`
- Codex user skills: `~/.codex/skills/<skill-name> -> /Users/kevin/projects/kevarifin14.github.io/.skills/<skill-name>`

Do not edit the symlinked alias locations directly. Update the canonical repo skill, then run:

```sh
npm run eval:skills
```
