# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A multi-platform AI plugin (Claude Code, Cursor, Codex, and 9 other AI coding tools via a CLI installer) that adds Salesforce-aware compound engineering workflows. The product is the markdown under `skills/` — those files are what get distributed and what other AI clients load. The TypeScript CLI under `cli/` translates that markdown into each target tool's expected directory layout and hosts the optional local Tend feed runtime (CLI-only).

A Salesforce developer using this plugin gets **ten skills** (V4): `sf-plan`, `sf-work`, `sf-generate`, `sf-review`, `sf-debug`, `sf-deploy`, `sf-ship`, `sf-compound`, `sf-lfg`, and `sf-know`. Each skill has **modes** (`/sf-plan mode:brainstorm`, `/sf-generate type:apex`, `/sf-know topic:limits`); a mode's guide lives at `skills/<skill>/references/<mode>/guide.md` and loads only when that mode runs, so only ten short descriptions are always in context. Reviews run through nine **review lenses**, concise stack checklists dispatched as isolated subagents (parallel on Claude Code, inline on harnesses without a subagent primitive). An optional repo-root `STRATEGY.md` (maintained by `/sf-plan mode:strategy`) grounds planning when present.

**Agentless (V3.1).** The plugin ships **no standalone registered agents** — formal agent definitions are not a reliable common denominator across Claude, Codex, Cursor, Gemini, Pi, OpenCode, etc. Specialist behavior lives as skill-local prompt assets, review lenses under `skills/sf-review/references/lenses/<stack>.md` and a few personas under `skills/<owner>/references/personas/<name>.md`, owned by the workflow skill that dispatches them and referenced cross-skill by relative path. They ship to every platform as ordinary skill files (the CLI copies a skill's whole subtree).

## Principles are the source of truth

`PRINCIPLES.md` lists seven numbered principles that govern every skill, every persona, and every code review. README, this file, and the workflow skills reference them **by number** rather than restating them. When something in this repo (a skill, an agent, a PR) conflicts with a principle, fix the implementation — don't soften the principle. When principles conflict with each other (rare), the lower-numbered principle wins.

Read `PRINCIPLES.md` before making non-trivial changes to workflow skills.

## Protected directories — never delete or overwrite

* `docs/solutions/` — institutional knowledge, irrecoverable. Cumulative across the project's lifetime.

* `docs/plans/` — implementation plans are permanent project records.

* `docs/brainstorms/` — pre-planning exploration records.

If content is wrong, **edit** it. If it's obsolete, add `status: deprecated` to the YAML frontmatter. Do not `rm`. Do not `git filter-repo` these paths.

## Architecture

* **Skills** live at `skills/<name>/SKILL.md` and are the user-facing entry points. They auto-route from natural-language phrases via the `description` frontmatter; direct invocation (`/sf-<name>`) also works. V3 retired the `commands/` directory entirely — skills replaced commands.

* **Modes** are folded former skills: `skills/<skill>/references/<mode>/guide.md` (no frontmatter; the owning `SKILL.md` carries the triggers and a mode table). Add a mode by adding a guide and a row to the owner's table, not a new top-level skill.

* **Review lenses** live at `skills/sf-review/references/lenses/<stack>.md` (apex, security, flow, lwc, integration, metadata, tests, architecture, doc) and share `lenses/contract.md` (procedure + one-line finding format). `sf-review` dispatches one subagent per applicable lens, passing file paths, not contents. Add a new review concern as checklist items in the right lens; add a new lens only for a new stack, and wire it into `references/step-2-dispatch-review-personas-in-parallel.md`.

* **Personas** are the remaining prompt assets at `skills/<owner>/references/personas/<name>.md`: research (`sf-plan`: learnings, repo, external) and four file writers. Other skills reference them by relative path — stable because the whole `skills/` tree ships together.

* **Multi-platform manifests**: `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`. Each carries per-platform plugin metadata; the CLI in `cli/` reads the canonical source and writes the others.

## Frontmatter conventions

* **Skills**: `name`, `description`, `argument-hint`. The `description` field is what powers auto-routing — enumerate Salesforce-flavored trigger phrases there, not in the body.

* **Personas and lenses**: minimal frontmatter — `name`, `description` only. They are prompt assets, not registered agents, so the agent-era `model`, `tools`, `color`, and `scope` fields are gone. The dispatching skill chooses the subagent's tools/model at dispatch time; review/research personas are read-only by intent, and the four that write files (`sf-bug-reproduction-validator`, `sf-pr-comment-resolver`, `sf-deployment-verification-agent`, `sf-mcp-tool-builder-agent`) say so in their prose.

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

There's also a Python entry point (`sfce.py`, declared in `pyproject.toml` as `sfce` script). It predates the Bun CLI and is separate; the Bun CLI under `cli/` is the actively maintained installer and Tend runtime.

The Bun CLI also exposes the local Tend runtime (no skill ships for it since V4; it is CLI-only) through `feed`, `card`, `work`, `action`, and `learning` commands. Feed state defaults to `$XDG_STATE_HOME/tend` or `~/.sfce/tend`; use `--state-dir` to isolate tests and worktrees. `SFCE_STATE_HOME` overrides the root for every subsystem (`SFCE_TEND_HOME` is a deprecated alias). See README's "State root resolution" for the full precedence, the gate/telemetry layout, and the scope-hash recipe shell hooks must reproduce.

## MCP servers

Configured in `.mcp.json`:

* **Context7** (`@upstash/context7-mcp`) — framework documentation. Used by research personas as the second tier after local skills, before falling back to web search.

* **Salesforce DX** (`@salesforce/mcp`) — live org operations (SOQL, deploy, retrieve, code analysis, LWC experts, testing). Requires `sf org login web` first; uses `DEFAULT_TARGET_ORG` (set via `sf config set target-org`).

Hosted MCP Servers (Salesforce's cloud-managed MCP, GA April 2026) are **not** configured in `.mcp.json` — that's per-org setup. See `/sf-know topic:hosted-mcp` and `/sf-generate type:mcp-tool` for the gotchas (a few are surprising: `global` access modifier — not `public` — is required on MCP-exposed Apex; Flow `templateDataProviders` break MCP; use `einstein_gpt__global` template type, not `FlexTemplate`).

## Adding modes, lenses, and skills

Use the maintainer skill at `.claude/skills/create-agent-skills/` (repo-local, not shipped) for conventions. In order of preference:

1. **New check** → add checklist items to the right lens under `skills/sf-review/references/lenses/`.
2. **New capability** → add a mode: `skills/<owner>/references/<mode>/guide.md` plus a row in the owner's mode table.
3. **New top-level skill** → only when no existing skill is a natural owner. Update `skills/index.md` and bump the four manifests.

Budgets (checked by `bun run lint`): a skill `description` stays under 250 characters, a `SKILL.md` under 8KB, a lens under 3.5KB.

## Contribution criteria (accept/reject)

This file ships with the plugin (it is referenced by nearly every skill's "Related" footer), so keep it authoritative rather than machine-specific. When reviewing a change against this plugin, a finding that violates one of the criteria below is sufficient justification to request changes:

* **No new persona or lens without a named owning skill.** Every persona lives under some workflow skill's `references/personas/`, every lens under `sf-review/references/lenses/`, and each is wired into its owner's dispatch list. Orphans are rejected.

* **Prefer a mode over a skill.** A new top-level skill must say why no existing skill can own it as a mode; the always-loaded description budget is shared by all skills.

* **No principle violation without a** **`PRINCIPLES.md`** **citation.** A change that pulls against a numbered principle must say which one and why the trade-off is justified. "This violates Principle 2" outranks a finding that doesn't.

* **No new skill without an** **`skills/index.md`** **entry** and a version bump across the four manifests (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`).

* **No description-frontmatter that summarizes internal step count.** Descriptions state trigger conditions only (see the SDO rule in `.claude/skills/create-agent-skills`); "5-step", "checklist", and "N phases" language is rejected.

* **No dangling reference.** A reference to a rubric, template, or persona must resolve to a real shipped file. The CLI lint enforces this for confidence-rubric references.

* **No cross-platform regression.** Changes route through `cli/src/converters/` rather than hand-authoring per-harness output; the CLI converter model is preserved, not forked.
