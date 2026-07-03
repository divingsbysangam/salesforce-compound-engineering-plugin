# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A multi-platform AI plugin (Claude Code, Cursor, Codex, and 9 other AI coding tools via a CLI installer) that adds Salesforce-aware compound engineering workflows. The product is the markdown under `skills/` — those files are what get distributed and what other AI clients load. The TypeScript CLI under `cli/` exists only to translate that markdown into each target tool's expected directory layout.

A Salesforce developer using this plugin gets nine workflow entry points (ideate → brainstorm → plan → deepen → work → review → polish → compound, plus `sf-lfg` for the full pipeline). The conditional **polish** phase (SLDS2/UX, accessibility, copy — UI work only) runs via the stack-aware `sf-polish` skill. The whole thing is backed by ~60 specialist **personas** — prompt assets the workflow skills dispatch as isolated subagents (parallel on Claude Code, inline on harnesses without a subagent primitive) — plus domain-knowledge skills (governor limits, Apex/LWC/Flow patterns, security, integrations, Agentforce, hosted MCP). Ideate and polish are the human "bread"; the middle stages are the AI loop. An optional repo-root `STRATEGY.md` (created and maintained by `/sf-strategy`) grounds ideate/brainstorm/plan when present.

**Agentless (V3.1).** The plugin ships **no standalone registered agents** — formal agent definitions are not a reliable common denominator across Claude, Codex, Cursor, Gemini, Pi, OpenCode, etc. Specialist behavior lives as skill-local **persona prompt assets** under `skills/<owner>/references/personas/<name>.md`, owned by the workflow skill that dispatches them and referenced cross-skill by relative path. They ship to every platform as ordinary skill files (the CLI copies a skill's whole subtree).

## Principles are the source of truth

`PRINCIPLES.md` lists seven numbered principles that govern every skill, every persona, and every code review. README, this file, and the nine workflow skills reference them **by number** rather than restating them. When something in this repo (a skill, an agent, a PR) conflicts with a principle, fix the implementation — don't soften the principle. When principles conflict with each other (rare), the lower-numbered principle wins.

Read `PRINCIPLES.md` before making non-trivial changes to workflow skills.

## Protected directories — never delete or overwrite

* `docs/solutions/` — institutional knowledge, irrecoverable. Cumulative across the project's lifetime.

* `docs/plans/` — implementation plans are permanent project records.

* `docs/brainstorms/` — pre-planning exploration records.

If content is wrong, **edit** it. If it's obsolete, add `status: deprecated` to the YAML frontmatter. Do not `rm`. Do not `git filter-repo` these paths.

## Architecture

* **Skills** live at `skills/<name>/SKILL.md` and are the user-facing entry points. They auto-route from natural-language phrases via the `description` frontmatter; direct invocation (`/sf-<name>`) also works. V3 retired the `commands/` directory entirely — skills replaced commands.

* **Personas** are skill-local prompt assets at `skills/<owner>/references/personas/<name>.md` — **not** registered agents (V3.1 went agentless). Each is owned by the workflow skill that dispatches it; primary owners are `sf-review` (code-review personas), `sf-doc-review` (doc-review personas), and `sf-plan` (research personas). Other skills reference a persona by relative path (e.g. `../sf-review/references/personas/<name>.md`) — stable because the whole `skills/` tree ships together.

* **Workflow skills dispatch personas as isolated subagents.** `sf-review`, `sf-work`, `sf-doc-review`, and `sf-lfg` load the persona file's contents and feed them to a general-purpose subagent via the Task tool — parallel with isolated context on Claude Code, applied inline in sequence on harnesses without a subagent primitive. When adding a new review concern, add a persona file under the owning skill's `references/personas/` and wire its name into that skill's dispatch list.

* **Multi-platform manifests**: `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`. Each carries per-platform plugin metadata; the CLI in `cli/` reads the canonical source and writes the others.

## Frontmatter conventions

* **Skills**: `name`, `description`, `argument-hint`. The `description` field is what powers auto-routing — enumerate Salesforce-flavored trigger phrases there, not in the body.

* **Personas** (`references/personas/<name>.md`): minimal frontmatter — `name`, `description` only. They are prompt assets, not registered agents, so the agent-era `model`, `tools`, `color`, and `scope` fields are gone. The dispatching skill chooses the subagent's tools/model at dispatch time; review/research personas are read-only by intent, and the four that write files (`sf-bug-reproduction-validator`, `sf-pr-comment-resolver`, `sf-deployment-verification-agent`, `sf-mcp-tool-builder-agent`) say so in their prose.

* **Solution docs** (`docs/solutions/`): YAML frontmatter validated against `schema.yaml` at repo root. See that file for required fields, category enum, and severity enum.

## Commands

The CLI under `cli/` uses Bun:

```bash
cd cli
bun install
bun run build       # bundle to dist/
bun run dev         # run src/index.ts directly
bun test            # run cli/tests/
bun test path/to/file.test.ts   # run a single test file
bun run typecheck   # tsc --noEmit
```

There's also a Python entry point (`sfce.py`, declared in `pyproject.toml` as `sfce` script). It predates the Bun CLI and is separate; the Bun CLI under `cli/` is the actively maintained installer.

## MCP servers

Configured in `.mcp.json`:

* **Context7** (`@upstash/context7-mcp`) — framework documentation. Used by research personas as the second tier after local skills, before falling back to web search.

* **Salesforce DX** (`@salesforce/mcp`) — live org operations (SOQL, deploy, retrieve, code analysis, LWC experts, testing). Requires `sf org login web` first; uses `DEFAULT_TARGET_ORG` (set via `sf config set target-org`).

Hosted MCP Servers (Salesforce's cloud-managed MCP, GA April 2026) are **not** configured in `.mcp.json` — that's per-org setup. See the `hosted-mcp-servers` and `mcp-tool-builder` skills for the gotchas (a few are surprising: `global` access modifier — not `public` — is required on MCP-exposed Apex; Flow `templateDataProviders` break MCP; use `einstein_gpt__global` template type, not `FlexTemplate`).

## Adding new personas and skills

Use the `create-agent-skills` skill — it encodes the frontmatter conventions and file naming. To add a new specialist concern, drop a persona file under the owning workflow skill's `references/personas/<name>.md` (frontmatter: `name`, `description`; body: the persona prompt) and wire its name into that skill's dispatch list. A review-class persona that should run during `sf-review` or `sf-lfg` goes under `skills/sf-review/references/personas/` and into `sf-review`'s dispatch list (`sf-lfg` delegates to `/sf-review`). When you add a skill, update `skills/index.md`.

## Contribution criteria (accept/reject)

This file ships with the plugin (it is referenced by nearly every skill's "Related" footer), so keep it authoritative rather than machine-specific. When reviewing a change against this plugin, a finding that violates one of the criteria below is sufficient justification to request changes:

* **No new persona without a named owning skill.** Every persona lives under some workflow skill's `references/personas/` and is wired into that skill's dispatch list. Orphan personas are rejected.

* **No principle violation without a** **`PRINCIPLES.md`** **citation.** A change that pulls against a numbered principle must say which one and why the trade-off is justified. "This violates Principle 2" outranks a finding that doesn't.

* **No new skill without an** **`skills/index.md`** **entry** and a version bump across the four manifests (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`).

* **No description-frontmatter that summarizes internal step count.** Descriptions state trigger conditions only (see the SDO rule in `create-agent-skills`); "5-step", "checklist", and "N phases" language is rejected.

* **No dangling reference.** A reference to a rubric, template, or persona must resolve to a real shipped file. The CLI lint enforces this for confidence-rubric references.

* **No cross-platform regression.** Changes route through `cli/src/converters/` rather than hand-authoring per-harness output; the CLI converter model is preserved, not forked.