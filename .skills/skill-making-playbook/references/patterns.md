# Distilled Skill-Making Patterns

## Core Thesis

A good skill is not a prompt collection. It is a reusable procedure with a clear trigger, a compact body, optional deep references, and deterministic helpers where useful.

Useful mental models:

- Anthropic: skills are filesystem packages loaded progressively.
- Matt Pocock: skills encode strict engineering process for agents with weak memory.
- Garry Tan/GBrain: skills are method calls. The user supplies arguments; the skill supplies the process.

## When To Skillify

Create or update a skill when:

- The user has asked for the same class of work more than once.
- The agent keeps needing the same setup, decisions, checks, or templates.
- The task needs domain-specific judgment that is not obvious from generic model knowledge.
- The workflow has a reproducible quality bar.
- A failure would be costly enough to justify guardrails.

Do not skillify:

- One-off exploration with no expected reuse.
- A vague aspiration with no tested process.
- Pure lookup/status/list operations better handled by code.
- A workflow that overlaps another skill without a clear owner.

## Skill Or Code

Use this split:

| Question | Prefer |
|---|---|
| Does the agent need to think, ask questions, adapt, or judge tradeoffs? | Skill markdown |
| Should the same input always produce the same output? | Script or CLI |
| Is it a lookup, validation, conversion, or formatting operation? | Script or CLI |
| Does it need domain process plus deterministic substeps? | Skill + scripts |
| Is the content large, factual, or variant-specific? | Reference file |

Push judgment up into skills. Push repeatable mechanics down into scripts.

## Trigger Design

The description is the resolver. The agent sees it before the body.

Good descriptions include:

- What the skill does.
- When to use it.
- Specific trigger phrases and task classes.
- File types, domains, tools, or surfaces.
- Adjacent cases where the skill should still trigger.

Avoid weak descriptions like "helps with documents" or "useful for coding." They do not distinguish the skill from alternatives.

## Body Design

Start with the procedure. Skip motivational preambles.

Strong bodies usually include:

- A short overview.
- A decision tree or sequential workflow.
- Explicit STOP points for irreversible or high-stakes decisions.
- Verification gates.
- Links to one-level-deep references.
- Exact script commands where scripts exist.

Keep the default path obvious. Give one recommended approach plus narrow escape hatches instead of listing many equally weighted options.

## Progressive Disclosure

Use three levels:

1. Metadata: always loaded. Spend words on triggering.
2. `SKILL.md`: loaded when triggered. Keep it procedural and compact.
3. Resources: loaded or executed as needed.

Split into references when:

- A section is rarely needed.
- A detail is framework-, provider-, or domain-specific.
- The body is getting long enough to hide the main workflow.
- Examples, schemas, or checklists would distract from first-run behavior.

Keep reference links explicit: say when to read each file.

## Engineering Workflow Patterns

Patterns worth reusing from Matt Pocock's skills:

- Grill before planning: ask one question at a time until shared understanding exists; inspect the codebase instead of asking when the answer is discoverable.
- PRD before issues: synthesize resolved context into a durable product document before splitting work.
- Issues as vertical slices: each issue should cut through the full stack and be independently verifiable.
- TDD as vertical loops: one failing test, one minimal implementation, repeat; avoid writing all tests before all code.
- Diagnosis starts with a feedback loop: build a deterministic repro before hypothesizing.
- Handoff by pointer: summarize the next session, cite artifacts by path or URL, and avoid duplicating content.

## Review And Shipping Patterns

Patterns worth reusing from GStack:

- Use role-specific review skills when they encode different judgment modes: founder/CEO scope, engineering architecture, design polish, QA, security, release.
- Make review posture explicit: expand scope, hold scope, reduce scope, or selectively surface options.
- Use section indexes for long workflows. The body can be a skeleton that forces the agent to read the exact section before executing it.
- Add blocking gates before exit: the required report, tests, fresh verification, and unresolved-decision status must exist before completion.
- Make shipping workflows conservative: inspect branch/base, merge base, run tests, review, verify after fixes, commit in logical chunks, push, then create or update the PR.

## Skill Creation Loop

1. Capture intent and examples.
2. Prototype manually on realistic inputs.
3. Show outputs and collect feedback.
4. Decide whether to create a new skill, extend an existing one, or write a script.
5. Draft `SKILL.md` and resources.
6. Validate structure.
7. Test realistic prompts with and without the skill when useful.
8. Log meaningful eval runs inside the skill directory.
9. Iterate based on observed agent behavior.

For recurring automations, monitor the first few automated runs before treating the skill as stable.

## Self-Improving Skill Loop

Use `$meta-skill-evaluator` when an output eval suggests the skill itself might need to change.

The loop:

1. Generate or repair an artifact using the skill.
2. Evaluate the artifact with the domain evaluator and, when useful, an independent reviewer.
3. Classify findings before editing:
   - artifact fix: current output only;
   - skill gap: future agents need clearer guidance;
   - evaluator gap: the grader missed something or overfit;
   - script/template gap: deterministic or starter code should encode the lesson.
4. Log the run under `skill-name/evals/log.md`, with optional details in `skill-name/evals/runs/`.
5. Update the smallest durable layer: trigger, `SKILL.md`, reference, script, asset, or evaluator.
6. Rerun the evaluator and skill validator.

Do not turn every failure into a new instruction. Update the skill only when the lesson changes future behavior for a class of tasks. If the same invariant appears in generation and evaluation, keep them aligned: the skill should tell agents to do it, the template should make it easy, and the evaluator should check it.

## Validation Patterns

Match validation to risk:

- Basic skill structure: run the local validator when available.
- Routing quality: create should-trigger and should-not-trigger prompts.
- Output quality: create realistic eval prompts and inspect outputs.
- Deterministic helpers: run scripts with representative inputs and failures.
- Visual/document output: render and inspect the actual artifact.
- Debugging skills: require a reproducible feedback loop.
- Reused skills: keep a skill-local eval log and periodically audit whether logged lessons became cohesive skill updates.

Watch how the agent uses the skill. If it misses linked files, repeats the wrong section, or ignores an important rule, revise the structure instead of assuming the agent will infer it next time.

## Anti-Patterns

Avoid:

- Huge global instruction files where all lessons accumulate.
- Many tiny overlapping skills with vague triggers.
- Stub skills with TODO sections.
- Long bodies that bury the operational steps.
- Skills that ask the user questions the codebase or files can answer.
- Generated scripts that fail open or punt all errors back to the agent.
- Writing durable skills from unapproved or low-quality prototype output.
- Mutating persistent state without an explicit gate.
- External fetches or network behavior that surprise the user.
- Stale examples copied from one project into another without revalidation.
- Eval findings left only in chat history or artifact diffs instead of being logged and folded into the relevant skill layer.

## Review Checklist

When auditing an existing skill, check:

- Does the trigger description route correctly?
- Is the first screen useful after triggering?
- Is the skill MECE relative to nearby skills?
- Are deterministic operations scripted?
- Are references one level deep and named clearly?
- Are examples realistic?
- Are STOP points and approval gates placed before irreversible actions?
- Is completion verifiable?
- Is there an eval log or feedback-loop convention for repeated use?
- Do prior eval lessons appear as coherent workflow/reference/script/evaluator changes rather than isolated patches?
- Are there secrets, private data, or surprising side effects?
- Can the skill be tested against realistic prompts?
