---
name: create-agent-skills
description: "Guide for adding new personas and skills to the SF Compound Engineering Plugin. Use when creating a new review/research persona, adding a domain-knowledge or workflow skill, or wiring a new specialist concern into sf-review / sf-doc-review / sf-plan. Encodes the agentless (V3.1) conventions: personas are skill-local prompt assets, not registered agents."
argument-hint: "[optional: 'persona' or 'skill', plus the concern to add]"
---

# Creating Personas and Skills

Guide for extending the SF Compound Engineering Plugin. **V3.1 is agentless** — there are no standalone registered agents. Specialist behavior lives as **persona prompt assets** owned by the workflow skill that dispatches them, and shipped to every platform as ordinary skill files. Read `../../CLAUDE.md` (Architecture) and `PRINCIPLES.md` before non-trivial changes.

## Personas vs. skills

* **Persona** — a specialist *prompt asset* (a reviewer, researcher, or validator) at `skills/<owner>/references/personas/<name>.md`. It is dispatched at runtime as an isolated subagent; it is **not** registered in any manifest.

* **Skill** — a user-facing entry point at `skills/<name>/SKILL.md` that auto-routes from its `description` frontmatter. Workflow skills *dispatch* personas; domain skills *provide knowledge*.

***

## Persona Structure

A persona is a prompt asset with **minimal frontmatter** — `name` and `description` only. The agent-era `model`, `tools`, `color`, and `scope` fields are gone: the dispatching skill chooses the subagent's tools and model at dispatch time.

```markdown
---
name: sf-{domain}-{role}
description: {One-line description — also the auto-routing trigger}
---

> Persona prompt asset — dispatched by workflow skills as an isolated subagent (or applied inline on harnesses without a subagent primitive). Not a registered agent.

# {Persona Title}

**SCOPE: {APEX_ONLY | LWC_ONLY | AUTOMATION_ONLY | INTEGRATION_ONLY | UNIVERSAL}** — state scope in prose (no `scope` field).

{Role description — who you are and what you check/produce}

## Your Process

### Step 1: {First action}
{Description}

### Step 2: {Second action}
{Description}

## Output Format

```

{Expected output structure — findings, severities, fix suggestions}

```

## When to Use

{When the owning skill should dispatch this persona}
```

Read-only is the default for review/research personas. Only personas that genuinely write files (e.g. `sf-bug-reproduction-validator`, `sf-pr-comment-resolver`, `sf-deployment-verification-agent`, `sf-mcp-tool-builder-agent`) should say so in their prose — the dispatching skill grants the corresponding tools.

### Persona ownership — where the file goes

Place the persona in the `references/personas/` directory of its **primary owning skill**. Other skills reference it by relative path (e.g. `../sf-review/references/personas/<name>.md`) — stable because the whole `skills/` tree ships together.

| Concern                                              | Owner skill              | Directory                                            |
| ---------------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| Code review (Apex/LWC/Flow/Integration/Architecture) | `sf-review`              | `skills/sf-review/references/personas/`              |
| Planning-document review                             | `sf-doc-review`          | `skills/sf-doc-review/references/personas/`          |
| Research (learnings, docs, web, history, spec-flow)  | `sf-plan`                | `skills/sf-plan/references/personas/`                |
| Bug reproduction                                     | `sf-debug`               | `skills/sf-debug/references/personas/`               |
| PR-thread resolution                                 | `sf-resolve-pr-feedback` | `skills/sf-resolve-pr-feedback/references/personas/` |
| Org pulse (business lens)                            | `sf-product-pulse`       | `skills/sf-product-pulse/references/personas/`       |
| Custom MCP tooling                                   | `mcp-tool-builder`       | `skills/mcp-tool-builder/references/personas/`       |

### How personas get dispatched

The owning workflow skill loads the persona file's contents and runs them as an **isolated subagent**: the Task tool with a general-purpose subagent, persona prompt as instructions. On Claude Code these run in parallel with isolated context; on harnesses without a subagent primitive, the skill applies each persona's prompt inline, in sequence. Never register a persona as a `subagent_type` — that's the agent model V3.1 retired.

***

## Skill Structure

Skills live in `skills/{skill-name}/` with a `SKILL.md` file carrying `name`, `description`, and (optionally) `argument-hint` frontmatter. The `description` field powers auto-routing — enumerate Salesforce-flavored trigger phrases there, not in the body.

```markdown
---
name: {skill-name}
description: "{What this does + trigger phrases users would say}"
argument-hint: "[optional argument hint]"
---

# {Skill Name}

{Description of what knowledge this skill provides, or what workflow it runs}

## {Section 1}
{Content — patterns, reference, examples, or steps}

## {Section 2}
{More content}
```

A skill that dispatches personas should carry a **"Persona dispatch"** note after its H1 — a one-line pointer to the `dispatching-parallel-personas` skill for the shared mechanics (isolated subagents, same-response parallelism, same-file-conflict check) plus this skill's own pointer to where its personas live (see any workflow skill for the wording) — and a dispatch list naming the personas it runs.

### Skill Design Principles

1. **Reference, not instructions**: domain skills provide knowledge; workflow skills + personas use it.
2. **Scoped**: each skill has a clear scope (APEX\_ONLY, UNIVERSAL, etc.) stated in prose.
3. **Searchable**: clear headings and code examples.
4. **Concise**: include only what's needed for decision-making.
5. **Substance over sycophancy**: agent-facing skill and persona prose should avoid gratitude-performance language ("You're absolutely right!", "Thanks for catching that!") in favor of verified substance — this keeps the pattern from creeping into future skills.

***

## Skill tiers (Protocol A/B)

Skills are not uniform. Some enforce a hard, non-negotiable gate; some run a structured multi-step workflow with no hard stop; some are pure reference or single-action utilities. The rigor a skill owes its reader depends on which of these it is. Every skill declares its tier in frontmatter (`tier:`, added after `name:`), and each tier has a **mandatory set of sections**. This makes the rigor split intentional policy — the difference between a discipline-gate skill and a utility skill is a design decision recorded in frontmatter, not an accident of who wrote it.

### The three tiers

| Tier | What it is | Current examples |
| --- | --- | --- |
| `discipline-gate` | Enforces an Iron-Law-style, non-negotiable check — the agent must stop and satisfy explicit criteria before proceeding. | `sf-plan`, `sf-work`, `sf-review`, `sf-polish`, `sf-lfg`, `sf-debug` |
| `workflow` | A structured, multi-step process with no hard gate — it guides but does not block. | `sf-brainstorm`, `sf-deepen`, `sf-compound`, `sf-strategy` |
| `utility` | A reference or single-action skill — knowledge lookup or a discrete action, no multi-step discipline. | `sf-pr-description`, `sf-report-bug` |

### Mandatory sections per tier

**`discipline-gate`** — the highest-rigor tier. Must carry:

* A **named gate list** — each gate stated with explicit **abort/proceed criteria** (what condition blocks, what condition lets the agent continue).
* A **rationalization table** with **at least 5 rows** — each naming a real excuse an agent would use to skip the gate, paired with the rebuttal (see "Match the Form to the Failure" for why a bare prohibition is not enough).
* A **red-flags self-check** — the observable signals that the agent is about to bypass the gate.
* A **`Principles enforced`** header — naming which of `PRINCIPLES.md`'s seven the gate serves.

**`workflow`** — structured but not blocking. Must carry:

* **Numbered phases** — the steps in order.
* An **artifact file-path template** — where the skill's output lands (e.g. `docs/brainstorms/<slug>.md`).
* A **self-review checklist before handoff** — what the skill verifies about its own output before returning control.

**`utility`** — **exempt** from the gate, rationalization-table, and phase requirements. A utility skill keeps its **Salesforce-Angle bullets** (the domain-specific reference content that is its reason to exist) and needs nothing heavier. Do not bolt a gate onto a utility skill to satisfy this policy — if it genuinely needs a gate, it is not a utility skill.

### Rollout status

This unit lands the `discipline-gate` tier and the Protocol A/B policy itself: the six discipline-gate skills above carry `tier: discipline-gate`, and this section is the policy of record. **Full retroactive tiering of the rest of the catalog is a deliberate follow-up** — the ~60 skills are not all tiered yet, and that is by design, not oversight. When you add or substantially edit a skill, set its `tier` and satisfy that tier's mandatory sections; do not batch-tier the whole catalog as a side effect of unrelated work.

***

## Content quality — pressure-testing discipline-gate skills

The sections above make a skill *structurally* correct. They do not make it *hold under pressure*. A `discipline-gate`-tier skill (a skill that tells an agent to stop and do something before proceeding — see Protocol A tiering) is only as good as its weakest rationalization: if an agent under deadline can talk itself out of the gate, the gate is decorative. Treat these skills as prose that must be stress-tested before merge, not templates to stamp out.

### Bulletproofing recipe — RED / GREEN / REFACTOR for prose

For any **new or edited** `discipline-gate`-tier skill, before merge:

1. **RED — write a failing test.** Run 2–3 pressure scenarios against a subagent that does **not** have the skill loaded. Frame each scenario to tempt the exact failure the gate exists to prevent — e.g. *"Under a sprint deadline, with a governor-limit-risky trigger change, does the agent skip filling in the Verification Strategy field?"* or *"does it write the Apex before the test?"* A scenario that the baseline agent passes tells you nothing; pick ones it plausibly fails.
2. **Transcribe the rationalization.** Capture the *actual* excuse the agent used — its own words ("the change is trivial, so a test would be ceremony"), not a paraphrase. The wording is the target.
3. **REFACTOR — patch the loophole, not the prose.** Edit the skill to close *exactly* that rationalization (see "Match the Form to the Failure" for choosing the form). Resist a generic rewrite; a broad "be more careful" edit closes nothing and dilutes the gate.
4. **GREEN — re-test with the patched skill.** Run the same scenarios with the skill loaded until the loophole is closed. If the agent finds a new excuse, that is a new RED — repeat.

Record the scenarios and outcomes. This log feeds Protocol E and lands in `docs/pressure-tests/` — see that directory's README for the record format, and `CONTRIBUTING.md` for **Protocol E** (at least two documented pressure scenarios before a discipline-gate change merges) and **Protocol G** (an eval-harness run for any gate-wording edit). The log lets the next editor see which rationalizations the gate already defends against and avoid reopening them.

### Match the Form to the Failure

A patch only works if its *form* matches the failure it targets. Classify the baseline failure, then reach for the matching form of guidance:

| Failure mode | Right form of guidance |
| --- | --- |
| Agent skips the step under pressure | An Iron Law + a rationalization table naming the excuse |
| Agent complies but produces the wrong shape | A worked example / template of the correct output |
| Agent omits a required element | An explicit checklist of required elements |
| Behavior should be conditional | A decision rule ("when X, do Y; otherwise skip") |

**A bare prohibition can backfire.** A naked "don't do X" can *increase* X — it plants the action without giving the agent anywhere else to go. This is why the workflow gates pair every prohibition with a **reason** and an **alternative** ("don't write the Apex first — you can't tell a passing test from a vacuous one, so write the failing test, watch it fail, then implement"), never a lone "no."

### SDO — Skill Discovery Optimization

A skill's `description` frontmatter states only the **trigger condition** — *when* to use the skill ("Use when reviewing a trigger change that touches DML in a loop…") — and **never** the skill's internal step count or workflow shape. Do not write "5-step check," "quick checklist," "runs N phases," or anything that leaks how much work the gate is.

Why: an agent reads the `description` to decide whether to load the skill, and it anchors on what it reads there. If the description says "5-step check," the agent may compress the whole gate to "checking tests" and skip most of it *before it ever opens the body* — the shape leaked into discovery becomes the shape the agent performs. Keep the description about the trigger; let the body carry the process.

The CLI lint (unit U16, `cli/src/lint/description-sdo.ts`) enforces this mechanically — it flags step-count and workflow-shape phrasing in `description` fields, so a leak fails the check rather than merging.

***

## After Creating

**A new persona:**

1. Save it to the owning skill's `references/personas/<name>.md` (see the ownership table).
2. Wire its name into that skill's dispatch list and "Persona dispatch" note.
3. If it should run during the full pipeline, it's reached automatically — `sf-lfg` delegates to `/sf-review`, `/sf-plan`, etc.
4. Verify it ships: `cli/` copies a skill's whole `references/` subtree, so no manifest edit is needed.

**A new skill:**

1. Add `skills/{skill-name}/SKILL.md` with proper frontmatter.
2. Update `skills/index.md` (routing table).
3. Bump the version across the four manifests (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`).
4. Run the CLI checks: `cd cli && bun run typecheck && bun test`.

***

## Naming Conventions

* **Personas**: `sf-{domain}-{role}.md` (e.g. `sf-apex-governor-guardian.md`), under the owner's `references/personas/`.

* **Skills**: `{topic}/SKILL.md` (e.g. `governor-limits/SKILL.md`); workflow skills use the `sf-` prefix (e.g. `sf-review/SKILL.md`).

* Use kebab-case for all file and directory names.

* Prefix Salesforce-specific personas and workflow skills with `sf-`.