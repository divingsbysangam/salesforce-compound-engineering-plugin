# SF Compound Engineering Plugin v3.1.0

**Skills-first compound engineering for Salesforce** — a multi-platform plugin (Claude Code, Cursor, Codex, and 9 other AI coding tools) where each iteration becomes smarter than the last through institutional knowledge capture and parallel persona dispatch. This is a skill-native product, not an instruction pack: workflows auto-route from natural language and from `/sf-*` invocation.

> **V3 is a skills-first architecture.** Commands were retired — every entry point is now a **skill** that auto-routes from natural-language phrases via its `description` frontmatter, with direct slash invocation (`/sf-<name>`) still supported. See [`CHANGELOG.md`](./CHANGELOG.md) for the migration guide from v2.x.

***

## The Compound Engineering Loop

```
  ┌─ HUMAN (taste) ─┐        ┌──────── AI (in the loop) ────────┐        ┌─ HUMAN (taste) ─┐
   Ideate · Brainstorm  →  Plan(40%) · Deepen · Work(20%) · Review · Resolve  →  Polish  →  Compound  →  Repeat

  • Ideate     — decide what's worth building (/sf-ideate)
  • Brainstorm — explore requirements through collaborative dialogue (/sf-brainstorm)
  • Plan       — research & design using 68 skills + parallel research personas (/sf-plan)
  • Deepen     — enhance the plan with section-level parallel research (/sf-deepen)
  • Work       — implement with pre-research + system-wide test checks (/sf-work)
  • Review     — parallel persona dispatch across 61 specialist personas (/sf-review)
  • Polish     — taste pass via /sf-polish: SLDS2/UX, accessibility (WCAG), copy (UI surfaces only)
  • Compound   — capture learnings to docs/solutions/, personas, skills, CLAUDE.md (/sf-compound)
```

> **The sandwich.** Humans own the two ends — **Ideate** (what's worth building) and **Polish** (does it feel right) — the "bread". The AI runs the middle "filling" in the loop. As models get better at execution, human attention concentrates where machines are still weak: taste and judgment.

> All nine core entry points (`/sf-ideate`, `/sf-brainstorm`, `/sf-plan`, `/sf-deepen`, `/sf-work`, `/sf-review`, `/sf-polish`, `/sf-compound`, `/sf-lfg`) are **skills** in V3 — they auto-route from natural-language phrases via their `description` frontmatter, and direct slash invocation continues to work.

Above the loop, **`/sf-strategy`** maintains an optional repo-root `STRATEGY.md` (target problem, approach, users, key metrics, tracks) that `sf-ideate`, `sf-brainstorm`, and `sf-plan` read as grounding when it exists. **`/sf-tend`** maintains ongoing Salesforce responsibility feeds with one durable thread per feed, source-backed cards, approval receipts, and reviewed learning.

**Each iteration starts smarter** because learnings compound into `docs/solutions/`, personas, skills, and CLAUDE.md.

> **Principles.** This plugin is opinionated. Seven principles — preserve the quality ceiling, verifiability, stay in the loop, the spec is the artifact, taste over typing, agent-native docs, outsource thinking not understanding — govern every skill and every review. See [`PRINCIPLES.md`](./PRINCIPLES.md). Each core workflow skill declares which principles it enforces.

***

## Quick Start

Every command below is verified against a clean environment on the date in the
[install matrix](#install-matrix). If one of them fails for you, that is a bug —
please [open an issue](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin/issues).

### Claude Code (Native)

```bash
# Add as a Claude Code plugin marketplace
/plugin marketplace add https://github.com/divingsbysangam/salesforce-compound-engineering-plugin

# Install
/plugin install sf-compound-engineering
```

No CLI, no npm, no clone — Claude Code reads `.claude-plugin/marketplace.json` straight from the repository.

### Every other AI coding tool

Run the installer **from the project you want the plugin installed into**. It
downloads the plugin from GitHub on first run, caches it, and writes the
converted files into your project:

```bash
cd ~/code/my-salesforce-project
bunx @divings/sf-compound-plugin install sf-compound-engineering --to cursor
```

No Bun? `npx -y @divings/sf-compound-plugin …` works identically — the CLI ships
as a plain Node binary and needs only Node 18+.

Swap `--to cursor` for any target: `copilot`, `windsurf`, `gemini`, `opencode`,
`codex`, `kiro`, `droid`, `pi`, `openclaw`, `qwen`, or `all` to install into
every tool detected in that project.

```bash
# Install into every AI tool detected in this project
bunx @divings/sf-compound-plugin install sf-compound-engineering --to all

# Install somewhere other than the current directory
bunx @divings/sf-compound-plugin install sf-compound-engineering --to codex --output ~/code/other-project

# Pin to a branch or tag instead of the default branch
# (tags are listed at github.com/divingsbysangam/salesforce-compound-engineering-plugin/tags)
bunx @divings/sf-compound-plugin install sf-compound-engineering --to cursor --ref v3.1.0-beta.3

# Reuse the cached copy without touching the network
bunx @divings/sf-compound-plugin install sf-compound-engineering --to cursor --offline
```

The downloaded plugin is cached under `$XDG_CACHE_HOME/sfce/plugins` (or
`~/.cache/sfce/plugins`). Re-running `install` refreshes that cache; if the
refresh fails, the cached copy is used rather than failing the install.

**Prefer to work from a checkout?** Pass a path instead of a name — no download happens:

```bash
git clone https://github.com/divingsbysangam/salesforce-compound-engineering-plugin
cd ~/code/my-salesforce-project
bunx @divings/sf-compound-plugin install ../salesforce-compound-engineering-plugin --to cursor
```

Contributors working inside a clone can use `sync`, which converts the plugin in place:

```bash
cd salesforce-compound-engineering-plugin
(cd cli && bun install)
bun run cli/src/index.ts sync --target all
```

`sync` reads the plugin from the current directory, so run it from the repository
root — not from `cli/`. Its output is gitignored.

### Cursor notes

Manifest: `.cursor-plugin/plugin.json` (skills at repo root, hooks at `hooks/hooks.json`, MCP at `mcp.json`).

**Cursor Marketplace:** packaging matches the [Cursor plugin template](https://github.com/cursor/plugin-template) single-plugin shape and passes `node scripts/validate-cursor-plugin.mjs`. Submit (or re-submit) with the packet in [`docs/solutions/integrations/cursor-marketplace-submission.md`](./docs/solutions/integrations/cursor-marketplace-submission.md) — email `kniparko@anysphere.com` or Cursor team Slack. Marketplace browse/install instructions will replace this note once Cursor lists the plugin.

### Install matrix

Owner for every path: [@divingsbysangam](https://github.com/divingsbysangam). Verification log: [`docs/install-verification.md`](./docs/install-verification.md).

| Path | Prerequisites | Last verified | Status | Known limitations |
| --- | --- | --- | --- | --- |
| **Claude Code** `/plugin marketplace add` | Claude Code with plugin support | 2026-08-21 | Manifests verified reachable and schema-valid | `/plugin` cannot be driven from a shell, so this path is confirmed by manifest checks, not by an automated install run |
| **Cursor** `--to cursor` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~5s | Skills install as **symlinks** into the plugin cache — clearing `~/.cache/sfce` breaks them; re-run `install` to repair. Commands and agents are not converted (Cursor is sync-only) |
| **Codex** `--to codex` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~1s (`bunx`) and ~5s (`npx`) | Skills are copied, not symlinked — re-run `install` to pick up plugin updates |
| **GitHub Copilot** `--to copilot` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~1s | Writes into `.github/`, which is usually committed — review the diff before pushing |
| **Gemini CLI** `--to gemini`, **Factory Droid** `--to droid` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Conversion verified from a clean environment via `--to all` (68 skills each) | Not yet exercised as a first-class `--to <tool>` run |
| **Windsurf** `--to windsurf` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Conversion verified from a clean environment via `--to all` | **Ignores `--output` at the default global scope** — installs into `~/.codeium/windsurf` instead. Pass `--scope workspace` to keep it inside the project. `--to all` picks Windsurf up from your home directory even in a project that does not use it |
| **OpenCode, Kiro, Pi, OpenClaw, Qwen** | Node 18+ or Bun 1.0+, `git` | — | Converters are unit-tested, but **no clean-environment install has been run** | Treat as unverified until these rows carry a date. Please report failures on the issue tracker |
| **Python `sfce` CLI** (`pyproject.toml`) | — | — | Not published; superseded by the Bun CLI | Predates the Bun installer and is not part of any advertised install path |

> **What "verified" means here.** Verified rows mean the documented command was run against the published npm package, from an empty directory with an empty plugin cache, and put the expected files in the expected place. It does not yet mean a fresh user confirmed the tool loads them — that is what the DIV-58 installer round is for.

> **Agents column, honestly:** the plugin is agentless as of V3.1, so every converter reports `0 agents`. Specialist personas travel inside `skills/` and reach every platform.

### What Gets Converted

| Platform     | Commands                   | Agents                         | Skills                       | MCP Config                 |
| ------------ | -------------------------- | ------------------------------ | ---------------------------- | -------------------------- |
| **Copilot**  | `.github/skills/`          | `.github/agents/*.agent.md`    | `.github/skills/`            | `copilot-mcp-config.json`  |
| **Cursor**   | Sync only                  | Sync only                      | `.cursor/skills/` (symlinks) | `.cursor/mcp.json`         |
| **Windsurf** | `workflows/*.md`           | `skills/*/SKILL.md`            | `skills/`                    | `mcp_config.json`          |
| **Gemini**   | `.gemini/commands/*.toml`  | `.gemini/skills/`              | `.gemini/skills/`            | `settings.json`            |
| **OpenCode** | `commands/*.md`            | `agents/*.md`                  | `skills/`                    | `opencode.json`            |
| **Codex**    | `prompts/*.md` + `skills/` | `skills/*/SKILL.md`            | `skills/`                    | `config.toml`              |
| **Kiro**     | `.kiro/skills/`            | `.kiro/agents/*.json`          | `.kiro/skills/`              | `mcp.json`                 |
| **Droid**    | `commands/*.md`            | `agents/*.md`                  | `skills/`                    | `mcp.json`                 |
| **Pi**       | `prompts/*.md`             | `skills/*/SKILL.md`            | `skills/`                    | `mcp.json`                 |
| **OpenClaw** | `commands/*.md`            | `agents/*.md`                  | `skills/`                    | TS entry point             |
| **Qwen**     | `commands/*.md`            | `agents/*.yaml`                | `skills/`                    | N/A                        |

> **Agentless note (V3.1):** the plugin ships **no standalone agents**, so the *Agents* column is empty in practice — the converters still exist but iterate an empty set. Specialist **personas** travel inside `skills/` (under `references/personas/`) and are converted as part of each skill, reaching every platform.

***

## Tend Runtime

The optional Bun runtime gives `/sf-tend` a durable, local-first protocol for Salesforce responsibility feeds:

```bash
cd cli
bun run src/index.ts feed list
bun run src/index.ts feed bind sf-platform-delivery --thread delivery-thread
bun run src/index.ts feed health sf-platform-delivery
```

State is stored under `$XDG_STATE_HOME/sfce/tend` (or `~/.sfce/tend`) and scoped to the current worktree by default. Override `--state-dir` and `--scope` in tests or isolated worktrees. The runtime stores feed metadata, cards, evidence, approvals, receipts, and learning proposals only; org credentials and MCP tokens remain owned by the host tool.

### Tend command reference

| Command | Purpose |
| --- | --- |
| `feed list\|create\|bind\|health\|state` | Initialize feeds, enforce one durable thread per feed, and inspect state |
| `card list\|upsert` | Review or store source-backed cards from JSON |
| `work list\|claim\|complete` | Queue work from the bound feed thread and record receipts |
| `action verify` | Approve and freshly verify a card action’s source/target digest |
| `learning request\|propose\|apply\|revert` | Review, approve, apply, and roll back learning proposals |

Heartbeat/observation runs are read-or-propose-only. Deployments, code writes, data changes, publishing, activation, MCP configuration changes, and learning application require visible approval; stale action digests are rejected.

***

## Workflow Entry Points

The nine-step compound loop, plus the full-pipeline runner and the strategy grounding skill:

| Skill            | Stage      | Purpose                                                              |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `/sf-strategy`   | grounding  | Create/maintain repo-root `STRATEGY.md` read by ideate/brainstorm/plan |
| `/sf-tend`       | workflow   | Operate Salesforce responsibility feeds with cards, approvals, receipts, and reviewed learning |
| `/sf-ideate`     | bread      | Decide what's worth building — grounded idea generation             |
| `/sf-brainstorm` | loop       | Explore requirements through collaborative dialogue                 |
| `/sf-plan`       | loop       | Research & design specs with parallel persona research (NO CODE)      |
| `/sf-deepen`     | loop       | Enhance plan sections with parallel deep research                   |
| `/sf-work`       | loop       | Implement with pre-research, skills routing, and test checks        |
| `/sf-review`     | loop       | Review with parallel persona dispatch (fast/thorough/comprehensive)   |
| `/sf-polish`     | bread      | Stack-aware UI polish — SLDS2/UX, WCAG accessibility, copy          |
| `/sf-compound`   | loop       | Capture learnings to `docs/solutions/` with YAML schema             |
| `/sf-lfg`        | pipeline   | Full autonomous pipeline — ideate through deploy in one command     |

Plus utility skills: `/sf-simplify-code`, `/sf-product-pulse`, `/sf-debug`, `/sf-doc-review`, `/sf-optimize`, `/sf-resolve-pr-feedback`, `/sf-commit`, `/sf-commit-push-pr`, `/sf-pr-description`, `/sf-release-notes`, `/sf-report-bug`, `/sf-sessions`, `/sf-setup`, and more.

### `/sf-lfg` — The Full Pipeline

```
Ideate → Brainstorm → Plan → Deepen → Work → Review → Resolve → Polish → Test → Deploy → Compound
```

Each stage has gates that must pass before proceeding. The pipeline aborts and asks for input on security regressions, governor regressions, repeated test failures, or deployment validation problems.

```bash
/sf-lfg "Lead auto-assignment flow based on territory" --deploy=scratch
```

***

## Specialist Personas (61)

V3.1 is **agentless** — there are no standalone registered agents. The 61 specialist personas are prompt assets under `skills/<owner>/references/personas/<name>.md`, dispatched by the workflow skills as **isolated subagents**: parallel with isolated context on Claude Code, applied inline on harnesses without a subagent primitive. They ship to every platform as ordinary skill files. Primary owners: `sf-review` (code review), `sf-doc-review` (doc review), `sf-plan` (research). Topical groupings:

| Group                      | Covers                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| **Apex**                   | Governor limits, security (CRUD/FLS, injection), bulkification, triggers, test coverage, exceptions |
| **LWC**                    | Architecture, performance, security (XSS/Locker), accessibility, Aura migration |
| **Flow & Automation**      | Flow governor limits, complexity, Flow-vs-Apex strategy, validation rules    |
| **Integration**            | REST API design, callout patterns, Platform Events, integration security, MCP config & tool builder |
| **Architecture & Data**    | Data model, sharing/OWD security, pattern recognition, metadata consistency  |
| **Research**               | Learnings, best practices, git history, repo conventions, framework docs     |
| **Workflow**               | Spec/flow analysis, bug reproduction, PR comment resolution, simplicity, deployment verification |
| **Review personas**        | Correctness, maintainability, testing, project-standards (always-on) + conditional personas (adversarial, security, performance, reliability, API contract, data migration, …) |

***

## Skills (62)

### Domain Knowledge

| Skill                  | Scope            | Use When                              |
| ---------------------- | ---------------- | ------------------------------------- |
| `governor-limits`      | Universal        | Any Apex, Flow, or trigger work       |
| `apex-patterns`        | Apex only        | Apex classes, triggers, services      |
| `flow-patterns`        | Automation only  | Building any type of Flow             |
| `lwc-patterns`         | LWC only         | Lightning Web Components              |
| `graphql-patterns`     | LWC only         | LWC GraphQL wire adapter / LDS GraphQL |
| `security-guide`       | Universal        | CRUD/FLS, sharing, permissions        |
| `integration-patterns` | Integration only | Callouts, APIs, Platform Events       |
| `test-factory`         | Apex only        | Test classes, test data factories     |

### Generating Skills (from `forcedotcom/afv-library`, Apache-2.0)

| Skill                     | Generates                                                       |
| ------------------------- | -------------------------------------------------------------- |
| `apex-generate`           | Apex class + tests as one unit                                 |
| `flow-generate`           | Flow via 3-step MCP pipeline                                   |
| `validation-rule-generate`| Validation rules with user-friendly errors                    |
| `apex-trigger-refactor`   | One-trigger-per-object handler refactors                      |
| `slds2-uplift`            | SLDS2 styling hooks / design-token uplift                     |
| `metadata-generate`       | `--type`-dispatched object / field / app / tab / list-view / lightning-type |
| `lightning-page-generate` | FlexiPage or full LEX app orchestration                       |
| `permission-set-generate` | Least-privilege permission sets                               |

### Agentforce & Prompt Builder

| Skill                | Use When                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| `agentforce-develop` | Build, modify, debug, deploy Agentforce agents — Agent Spec gate, `.agent` authoring, publish/activate |
| `agentforce-test`    | Smoke + batch testing — `sf agent preview` traces, Testing Center YAML, fix loop |
| `agentforce-observe` | Production observation — STDM session traces in Data Cloud (with fallback) |
| `prompt-builder`     | Prompt templates — metadata XML, merge fields, grounding, deployment    |

> **⚠️ Agentforce DX Critical Notes (April–May 2026):**
> - **`topic` is deprecated.** Use `subagent`, `start_agent agent_router:`, and `@subagent.name` everywhere.
> - **Default preview = simulated.** Without `--use-live-actions`, real Apex is never called. `--mode live` does not exist — the correct flag is `--use-live-actions`.
> - **Debug logs → Agent User, not admin.** Apex runs as the Einstein Agent User; setting debug logs on your admin account produces nothing.
> - **API version must match your org.** Spring '26 = `66.0`, Summer '26 = `67.0`. Mismatches cause `Invalid api version` errors.
> - **Multi-component deploys need Package XML.** Use `--manifest manifest/package.xml`, not `--metadata`. The metadata type is `AiAuthoringBundle`.

### Hosted MCP

| Skill                | Use When                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| `hosted-mcp-servers` | Hosted MCP setup, ECA configuration, URL patterns, security model, troubleshooting |
| `mcp-tool-builder`   | Building custom MCP tools — Apex `@InvocableMethod`, Flows, Named Queries, prompt templates |

### Tooling

| Skill                 | Use When                                       |
| --------------------- | ---------------------------------------------- |
| `sf-cli`              | Deploy, retrieve, test, org management         |
| `compound-docs`       | Writing solution documents with YAML schema    |
| `file-todos`          | File-based task tracking                        |
| `git-worktree`        | Isolated parallel development branches          |
| `create-agent-skills` | Creating new agents and skills for the plugin   |

***

## Knowledge System

Learnings are captured in `docs/solutions/` with YAML frontmatter and organized by category:

```
docs/solutions/
├── governor-limit-issues/   # Limit handling patterns
├── deployment-issues/       # CI/CD and deployment fixes
├── test-failures/           # Test troubleshooting guides
├── security-issues/         # Security implementations
├── integration-issues/      # External system patterns
├── flow-issues/             # Automation solutions
├── lwc-issues/              # Component solutions
├── data-model-issues/       # Schema design decisions
├── best-practices/          # Proven patterns and approaches
└── patterns/                # Reusable code patterns
```

The `sf-learnings-researcher` persona searches these documents by frontmatter metadata before every plan and implementation phase to surface relevant institutional knowledge. `docs/solutions/`, `docs/plans/`, and `docs/brainstorms/` are **protected directories** — edit, never delete.

## Architecture workflow
<img width="2112" height="4080" alt="image" src="https://github.com/user-attachments/assets/afdaf91d-ef64-43e7-aa4d-c2cd711e5fbc" />

***

## Project Structure

```
salesforce-compound-engineering-plugin/
├── .claude-plugin/
│   ├── plugin.json           # Plugin manifest (v3.1.0)
│   └── marketplace.json      # Marketplace loader schema
├── .cursor-plugin/           # Cursor plugin manifest
├── .codex-plugin/            # Codex plugin manifest
├── .mcp.json                 # Context7 + Salesforce DX MCP config
├── schema.yaml               # YAML validation for docs/solutions/
├── PRINCIPLES.md             # Seven governing principles (source of truth)
├── CLAUDE.md                 # Project context and protected artifacts
├── cli/                      # Multi-tool installer CLI (Bun)
│   ├── package.json          # @divings/sf-compound-plugin
│   ├── src/
│   │   ├── index.ts          # CLI entry (citty)
│   │   ├── parser/           # Plugin reader + markdown parser
│   │   ├── converters/       # 11 platform converters
│   │   ├── transforms/       # Path, reference, frontmatter rewriting
│   │   ├── tend/             # Local feed state, cards, work, receipts, learning
│   │   └── utils/            # Auto-detect, merge helpers
│   └── tests/
├── skills/                   # 68 skills — each owns the personas it dispatches
│   ├── index.md              # Skill routing map
│   ├── sf-review/references/personas/      # ~40 code-review personas
│   ├── sf-doc-review/references/personas/  #  8 doc-review personas
│   ├── sf-plan/references/personas/        #  9 research personas
│   └── …                     # 61 personas total — agentless, no standalone agents/ dir
└── docs/
    ├── brainstorms/          # Pre-planning exploration records (protected)
    ├── plans/                # Feature plans (protected)
    └── solutions/            # Institutional knowledge (protected)
```

***

## MCP Integration

Configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    },
    "salesforce-dx": {
      "command": "npx",
      "args": ["-y", "@salesforce/mcp", "--orgs", "DEFAULT_TARGET_ORG", "--toolsets", "all"]
    }
  }
}
```

**Context7** — framework documentation, used by research personas as the second tier after local skills, before falling back to web search.

**Salesforce DX MCP** — the local `@salesforce/mcp` server for developer workflows such as SOQL, deploy, retrieve, code analysis, and testing. The current Salesforce CLI/MCP setup supports selecting orgs, toolsets, and tools; keep the package selector aligned with the [Salesforce DX MCP documentation](https://github.com/salesforcecli/mcp) rather than copying an old tool list.

**Salesforce Hosted MCP** — a separate Salesforce-managed, OAuth/PKCE-connected surface for org data and automation. Hosted MCP servers are now generally available; configure them through [Salesforce Hosted MCP documentation](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/hosted-mcp-servers-overview.html), starting with a read-only server and an External Client App. `/sf-tend` treats either surface as a feed adapter and never persists its credentials in local feed state.

> **Prerequisites for Salesforce DX MCP:** Authorize an org first with `sf org login web`. The server uses `DEFAULT_TARGET_ORG` — whatever you set with `sf config set target-org`.

***

## Requirements

* Claude Code (or another supported AI coding tool)
* Node.js (for MCP servers)
* Bun (for the CLI installer)
* Git (recommended)
* Salesforce CLI (`sf`) for org operations

***

## Contributing

Contributions welcome! Key areas:

* Add new personas for specialized reviews
* Expand skills with more patterns
* Improve index files for better routing
* Add solution documents to `docs/solutions/`

See `skills/create-agent-skills/SKILL.md` for agent/skill authoring guidance, and read `PRINCIPLES.md` before non-trivial changes to workflow skills.

***

## License

MIT License

***

## Credits

* Built for the Salesforce developer community
* We considered [Every Inc's compound-engineering plugin](https://github.com/EveryInc/compound-engineering-plugin) while shaping the loop. This catalog, `sf-*` names, `PRINCIPLES.md`, and Salesforce skills are this product — not a tracking fork.
* Inspired by [GitHub Spec-Kit](https://github.com/github/spec-kit)
* Generating & Agentforce skills adapted from [`forcedotcom/afv-library`](https://github.com/forcedotcom/afv-library) (Apache-2.0)
* Seven-principles framework distilled from Andrej Karpathy's Y Combinator AI Startup School talk
* Powered by Claude Code
