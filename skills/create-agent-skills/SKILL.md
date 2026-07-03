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