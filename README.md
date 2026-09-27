# SF Compound Engineering Plugin v4.0.0

**Skills-first compound engineering for Salesforce** — a multi-platform plugin (Claude Code, Cursor, Codex, and 9 other AI coding tools) where each iteration becomes smarter than the last through institutional knowledge capture and parallel persona dispatch. This is a skill-native product, not an instruction pack: workflows auto-route from natural language and from `/sf-*` invocation.

> **V4 is compact.** Ten skills replace 68; former skills are **modes** (`/sf-plan mode:brainstorm`, `/sf-generate type:apex`) whose guides load only when used. Nine review lenses replace 61 personas. See [`CHANGELOG.md`](./CHANGELOG.md) for the old-name → new-name map.

***

## What this plugin runs on your machine

Both hook features are **OFF by default**. Installing the plugin enables
nothing; you opt in per feature with `/plugin configure`, or by setting
`SFCE_GATE_ENABLED=1` / `SFCE_SKILL_LOG_ENABLED=1`.

### The scripts, and when they run

| Script | Event | Runs when |
| --- | --- | --- |
| `scripts/session-start` | `SessionStart` (startup) | always — prints the discipline primer |
| `scripts/sfce-gate-selfcheck` | `SessionStart` (startup) | gate enabled |
| `scripts/sfce-metadata-gate` | `PreToolUse` / `PostToolUse` on `Edit`, `Write`, `NotebookEdit` | gate enabled |
| `scripts/sfce-skill-observer` | `PostToolUse` on `Skill`, `UserPromptExpansion`, `SessionStart` (clear/resume), `SessionEnd` | either feature enabled |
| `scripts/sfce-bash-observer` | `PostToolUse` on `Bash` | either feature enabled |
| `scripts/sfce-deploy-gate` | `PreToolUse` on `Bash` | on by default; acts only on `sf project deploy` / `sf project delete` (set `SFCE_DEPLOY_GATE=0` to turn off) |

With both flags unset every gate/observer script exits before reading stdin. The deploy gate reads the payload but exits immediately unless the command is a deploy or delete; it asks before a direct production deploy or a destructive change on a non-scratch org, and denies `--test-level NoTestRun` on production. It classifies the org from local `sf` auth files, with no network call.

**None of these scripts makes a network call**, and that is enforced rather than
promised: `cli/tests/hooks/invariants.test.ts` walks `scripts/` and fails on any
network-capable construct, and fails if any hook in `hooks/hooks.json` runs a
script outside that scan. There is exactly one declared runtime exception,
below, which no hook may invoke. (The CI-only `scripts/check-npm-release.mjs`,
which asks the npm registry what it serves, is the other declared exception;
nothing at runtime runs it.)

### `scripts/sfce-delegate` — optional cheap-worker tier

Not a hook. Nothing invokes it unless you or a skill explicitly do, and **with
no `ANTHROPIC_API_KEY` it declines and the caller does the work inline exactly
as before.** Default behaviour is unchanged.

It exists because pure pattern-matching generation — a `TestDataFactory`, a
custom-object field list, the boilerplate half of a service class — costs
frontier tokens twice: once to produce the code, and again because the produced code then
sits in the session's context for the rest of the run. `sfce-delegate` sends the
spec plus a required reference to a cheaper worker and writes the result
**straight to disk**. `stdout` carries only the path, never the code. That
second part is most of the saving.

```bash
scripts/sfce-delegate \
  --spec /tmp/factory-spec.md \
  --reference skills/sf-generate/references/test-data/guide.md \
  --out force-app/main/default/classes/TestDataFactory.cls \
  --kind test-factory --expect-lines 120

# see every gate's decision without making a call
scripts/sfce-delegate ... --dry-run
```

| Exit | Meaning |
| --- | --- |
| `0` | delegated; `--out` was written |
| `3` | **declined — not an error.** No key, no worker, below threshold, or an excluded topic. Do the work inline; do not retry. |
| `1` | a real failure — API error, malformed response, failed write |
| `2` | usage error |

**What it refuses to delegate.** Security, sharing, CRUD/FLS, permission
metadata (profiles, permission sets), governor-sensitive and async logic,
callouts, credentials and sessions, and debugging all stay on the frontier
model. Matching is case- and whitespace-insensitive. The denylist scans the spec
**and every reference file** — a spec that reads as plain boilerplate can point at a reference full of sharing logic — and it is
deliberately over-broad, because the failure costs are not symmetric: a false
refusal costs one round-trip, a false accept ships security logic written by a
weak model. The worker is also instructed to emit `DELEGATION_REFUSED` if the
spec appears to need that judgement, which is honoured as a second, independent
check.

In practice the real `sf-generate type:test-data` and `sf-know topic:apex` skills pass the scan;
`sf-know topic:limits` is correctly refused.

| Variable | Default | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | absent ⇒ exit `3`. This is the normal state. |
| `SFCE_WORKER_MODEL` | `claude-haiku-4-5-20251001` | unset **or empty** selects the default |
| `SFCE_DELEGATE_MIN_LINES` | `40` | below this, `--expect-lines` declines: the round-trip costs more than it saves |
| `SFCE_DELEGATE_MAX_TOKENS` | `8000` | output cap |
| `SFCE_WORKER_API_BASE` | `https://api.anthropic.com` | constrained to Anthropic or **loopback only** (`http://127.0.0.1:PORT` or `http://localhost:PORT`, parsed rather than prefix-matched), so the offline-test seam is not also an exfiltration path |

**Not yet validated against a real worker.** The full pipeline — gates,
exclusions, fence stripping, token reporting, exit codes — is tested offline
against a loopback mock (95 tests in `cli/tests/delegate/`). What a
Haiku-class model actually produces for a real spec has not been measured. Treat
the tier as wired up but unproven until it has.

### What is written, and where

Nothing is written unless you opt in. When you do, the state root is resolved in
this order, and is never inside your repository on any code path:

1. `$SFCE_STATE_HOME`
2. `$SFCE_TEND_HOME` — a deprecated alias, still honoured
3. `$XDG_STATE_HOME`
4. `~/.sfce`

| Path | Contains |
| --- | --- |
| `<state>/gate/grants/<session-id>` | one file per session, an expiry epoch and the granting skill |
| `<state>/gate/audit.jsonl` | gate decisions, overrides, shell-bypass classes |
| `<state>/telemetry/skills-<date>.jsonl` | one row per skill entry |
| `<state>/observer-salt` | a per-install random salt, mode 0600 |

Telemetry rows carry a skill name and **salted HMACs** of the session id,
working directory and agent id — never the raw ids, never prompt text, never
file contents, never org data, never credentials. Directories are created 0700
and files 0600.

**No network calls from the hooks or telemetry.** A test asserts the shipped
scripts contain no network-capable construct, so the claim survives future
edits. The one exception is the opt-in `scripts/sfce-delegate` above, which is
not a hook, runs only when explicitly invoked, and declines without an API key.

### How to turn it off, and how to delete the data

- One feature: unset its option in `/plugin configure`, or unset the
  environment variable, then restart the session.
- Enforcement only, keeping the recording: leave `SFCE_GATE_ENFORCE` unset.
- Everything: `disableAllHooks` in your Claude Code settings. Note this also
  removes the discipline primer, which is the plugin's only cross-platform
  mechanism, and it suppresses the self-check that would otherwise tell you.
- Delete the data: `scripts/skill-usage purge`, or by hand remove `<state>/gate`,
  `<state>/telemetry`, **and `<state>/observer-salt`** — the salt is what keeps
  the telemetry references unlinkable, so leaving it behind while deleting the
  rows keeps the one file worth removing.

### Pinning

Install at a **commit SHA**. A git tag is mutable and is not a content address,
and these are executable scripts that run with your full permissions.

### Read before enabling the gate

- These hooks are executable scripts that run on your machine, with your full user permissions and no sandbox, on every matching file edit and every Bash call. They are delivered as repository content at the ref you installed; a git tag is mutable and is not a content address, so pin a commit SHA.
- The absence of a deny is never evidence of authorisation. A `PreToolUse` hook fails open. The gate does not run, and does not say so, when: the script errors or times out; the script is missing, not executable, or its interpreter is absent; its output JSON is malformed; enterprise `allowManagedHooksOnly` or `disableAllHooks` suppresses plugin hooks — including the session-start self-check, which the same setting suppresses; the opt-in has not taken effect because the session was not restarted; or the path predicate misses.
- The gate's own enforcement inputs are ordinary files the agent can edit. The hook scripts, the authoring allowlist, and the path-class routing table are not Salesforce metadata, so a change to any of them is never denied and produces no bypass record. One such edit disarms the gate for every future session in that repository. The session-start self-check records a digest of these inputs so a change is visible in the audit record, but nothing prevents it.
- The model can bypass this gate at any time, using Bash, which it uses constantly. The Bash observer measures that bypass. It does not prevent it. Files referenced with `@` in a prompt bypass `PreToolUse` entirely.
- MCP writes and org deploys are ungated. `.mcp.json` configures `@salesforce/mcp`; `deploy_metadata` and its siblings write metadata and reach a live org without matching `Edit`, `Write`, `NotebookEdit`, or `Bash`. The drift this gate exists to prevent is more available through MCP than through the tools it watches.
- Symlinked paths defeat a shape-only predicate. An edit to a benign filename that symlinks to an Apex class is not matched.
- Enforcement exists on Claude Code only. The other eleven conversion targets receive the intent as text.
- The log is local-only, pseudonymous rather than anonymous, retained until deleted, and shareable by the user. It is not an audit trail, and the override is not tamper-evident: the actor who sets the override can delete the record of it.
- Stop and re-plan if U1 finds that no hook event carries skill identity for a description-matched entry. This breaks both halves, not only the reporter. The reporter's claim narrows to explicit invocations and the cold-skill feature is cut. For the gate it is worse: description-based routing is this plugin's primary designed entry path, so a developer who reaches an allowlisted authoring skill that way mints no grant and is denied on their first metadata edit. R4 and KTD1 both assume entry is observable, so U5 stops with U7 rather than proceeding on a narrowed claim.
- Stop and re-plan if a full `sf-lfg` run cannot complete with the gate enabled after U2.
- Stop and re-plan if U1's Cursor probe finds that Cursor does not silently ignore a `PreToolUse` entry it cannot honor and U9's file split cannot produce a `hooks/hooks.json` that Cursor accepts. The split is the prescribed remedy, so the probe's negative result redirects U8's config rather than halting the plan; only a failed split is the stop. Cursor receives `hooks/hooks.json` by manifest reference, bypassing the converter layer, so it is the one exception to this plan's inert-elsewhere premise.
- Tail ownership: This plan ends at a reviewed, tested branch. Shipping is `/sf-ship mode:pr`.
- 

## The Compound Engineering Loop

```
  ┌─ HUMAN (taste) ─┐        ┌──────── AI (in the loop) ────────┐        ┌─ HUMAN (taste) ─┐
   Ideate · Brainstorm  →  Plan · Deepen · Work · Review · Resolve · Deploy  →  Polish  →  Compound  →  Repeat

  • Ideate / Brainstorm / Strategy / Deepen — /sf-plan mode:<ideate|brainstorm|strategy|deepen>
  • Plan     — research & design with parallel research personas (/sf-plan)
  • Work     — implement test-first with system-wide test checks (/sf-work)
  • Generate — Apex, Flow, metadata, permission sets, agents… (/sf-generate type:<x>)
  • Review   — one subagent per stack lens (/sf-review)
  • Deploy   — validate → quick deploy with a production gate (/sf-deploy)
  • Polish   — SLDS 2 / UX, accessibility, copy for UI surfaces (/sf-review mode:polish)
  • Compound — capture learnings to docs/solutions/ (/sf-compound)
```

> **The sandwich.** Humans own the two ends — **Ideate** (what's worth building) and **Polish** (does it feel right). The AI runs the middle in the loop.

**Each iteration starts smarter** because learnings compound into `docs/solutions/`, which the research personas read before every plan.

> **Principles.** Seven principles — preserve the quality ceiling, verifiability, stay in the loop, the spec is the artifact, taste over typing, agent-native docs, outsource thinking not understanding — govern every skill and every review. See [`PRINCIPLES.md`](./PRINCIPLES.md).

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
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to cursor
```

No Bun? `npx -y salesforce-compound-engineering-plugin …` works identically — the CLI ships
as a plain Node binary and needs only Node 18+. Installed globally
(`npm i -g salesforce-compound-engineering-plugin`), the same tool is available as the
shorter `sf-compound-plugin`.

Swap `--to cursor` for any target: `copilot`, `windsurf`, `gemini`, `opencode`,
`codex`, `kiro`, `droid`, `pi`, `openclaw`, `qwen`, or `all` to install into
every tool detected in that project.

```bash
# Install into every AI tool detected in this project
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to all

# Install somewhere other than the current directory
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to codex --output ~/code/other-project

# Pin to a branch or tag instead of the default branch
# (tags are listed at github.com/divingsbysangam/salesforce-compound-engineering-plugin/tags)
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to cursor --ref v3.1.0-beta.3

# Reuse the cached copy without touching the network
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to cursor --offline
```

The downloaded plugin is cached under `$XDG_CACHE_HOME/sfce/plugins` (or
`~/.cache/sfce/plugins`). Re-running `install` refreshes that cache; if the
refresh fails, the cached copy is used rather than failing the install.

**Prefer to work from a checkout?** Pass a path instead of a name — no download happens:

```bash
git clone https://github.com/divingsbysangam/salesforce-compound-engineering-plugin
cd ~/code/my-salesforce-project
bunx salesforce-compound-engineering-plugin install ../salesforce-compound-engineering-plugin --to cursor
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
| **Cursor** `--to cursor` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~3.5s | Skills install as **symlinks** into the plugin cache — clearing `~/.cache/sfce` breaks them; re-run `install` to repair. Commands and agents are not converted (Cursor is sync-only) |
| **Codex** `--to codex` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~1s (`bunx`) and ~3s (`npx`) | Skills are copied, not symlinked — re-run `install` to pick up plugin updates |
| **GitHub Copilot** `--to copilot` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Verified from the published npm package, clean environment — 68 skills in ~1s | Writes into `.github/`, which is usually committed — review the diff before pushing |
| **Gemini CLI** `--to gemini`, **Factory Droid** `--to droid` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Conversion verified from a clean environment via `--to all` (68 skills each) | Not yet exercised as a first-class `--to <tool>` run |
| **Windsurf** `--to windsurf` | Node 18+ or Bun 1.0+, `git` | 2026-08-21 | Conversion verified from a clean environment via `--to all` | **Ignores `--output` at the default global scope** — installs into `~/.codeium/windsurf` instead. Pass `--scope workspace` to keep it inside the project. `--to all` picks Windsurf up from your home directory even in a project that does not use it |
| **OpenCode, Kiro, Pi** | Node 18+ or Bun 1.0+, `git` | — | Converters are unit-tested, but **no clean-environment install has been run** | Treat as unverified until these rows carry a date. Please report failures on the issue tracker |
| **OpenClaw** `--to openclaw`, **Qwen** `--to qwen` | Node 18+ or Bun 1.0+, `git` | — | Converters are unit-tested, but **no clean-environment install has been run** | **Ignore `--output`** — both tools load extensions only from `~/.openclaw/extensions/` and `~/.qwen/extensions/`, so the install is user-global and the requested project is left unchanged. `install` prints the real destination |
| **Python `sfce` CLI** (`pyproject.toml`) | — | — | Not published; superseded by the Bun CLI | Predates the Bun installer and is not part of any advertised install path |

> **Targets that cannot honour `--output`.** Windsurf at its default global scope, OpenClaw and Qwen install into a user-global directory because that is the only place those tools load from. `install` prints the actual destination for each, so the requested directory is never reported as an unearned promise.

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

> **Agentless note:** the plugin ships **no standalone agents**, so the *Agents* column is empty in practice — the converters still exist but iterate an empty set. Review lenses and personas travel inside `skills/` and are converted as part of each skill, reaching every platform.

***

## Tend Runtime (CLI-only)

The optional Bun runtime keeps a durable, local-first protocol for Salesforce responsibility feeds. Since V4 no skill drives it; use it directly from the CLI:

```bash
cd cli
bun run src/index.ts feed list
bun run src/index.ts feed bind sf-platform-delivery --thread delivery-thread
bun run src/index.ts feed health sf-platform-delivery
```

State is stored under `$XDG_STATE_HOME/tend` (or `~/.sfce/tend`) and scoped to the current worktree by default. Override `--state-dir` and `--scope` in tests or isolated worktrees. The runtime stores feed metadata, cards, evidence, approvals, receipts, and learning proposals only; org credentials and MCP tokens remain owned by the host tool. State directories are created `0700` and state files `0600`.

#### State root resolution

`SFCE_STATE_HOME` names the root for every subsystem. `SFCE_TEND_HOME` is a deprecated alias, still honoured, consulted only when `SFCE_STATE_HOME` is unset. Precedence, highest first:

| # | Source | Tend root |
| --- | --- | --- |
| 1 | `--state-dir` | the path itself, bare |
| 2 | `SFCE_STATE_HOME` (or `SFCE_TEND_HOME`) | the path itself, bare |
| 3 | `XDG_STATE_HOME` | `$XDG_STATE_HOME/tend` |
| 4 | default | `~/.sfce/tend` |

Subsystems other than Tend (the metadata gate, skill telemetry) take two shapes, so that **no existing Tend path moves**:

* On **1–2** the caller named the root, so Tend keeps it bare and the others nest beneath it: `<root>/gate`, `<root>/telemetry`.
* On **3–4** the root is shared, so each takes its own segment beside Tend: `<base>/gate`, `<base>/telemetry`.

#### Scope hash

The worktree scope is the first 12 hex characters of the SHA-256 of the resolved working directory. Shell implementations must reproduce it exactly:

```sh
printf '%s' "$PWD" | shasum -a 256 | cut -c1-12
```

`printf '%s'` is required. `echo "$PWD"` appends a newline and produces a different digest, which would split one repository's state across two scope directories.

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

## Skills (10)

| Skill | Modes | Use when |
|---|---|---|
| `/sf-plan` | `ideate` · `brainstorm` · `strategy` · `deepen` | Deciding what to build and how. Writes `docs/plans/`, `docs/brainstorms/`, `STRATEGY.md` |
| `/sf-work` | `simplify` · `optimize` · `worktree` · `todos` · `handoff` | Implementing a plan or prompt, test-first |
| `/sf-generate` | `apex` · `trigger-refactor` · `flow` · `metadata` · `permission-set` · `validation-rule` · `lightning-page` · `test-data` · `prompt-template` · `mcp-tool` · `agent` · `agent-test` | Creating Salesforce source and metadata |
| `/sf-review` | `doc` · `polish` · `slds2` · `browser` | Reviewing code (default), plans, or UI |
| `/sf-debug` | `explain` · `agent-observe` | Root-causing failures, explaining code, Agentforce traces |
| `/sf-deploy` | `validate` · `deploy` · `quick` · `retrieve` · `destructive` · `manifest` · `test` · `data` · `org` · `setup` · `cli` | Anything that touches an org |
| `/sf-ship` | `commit` · `pr` · `pr-description` · `resolve-feedback` · `babysit` · `release-notes` · `clean-branches` | Git and PR work |
| `/sf-compound` | `refresh` · `doc-format` | Capturing learnings |
| `/sf-lfg` | — | Full pipeline: plan → work → review → resolve → polish → test → deploy → compound |
| `/sf-know` | `limits` · `apex` · `lwc` · `graphql` · `flow` · `security` · `integration` · `hosted-mcp` · `agent-native` | Platform knowledge, loaded on demand |

Invoke a mode directly (`/sf-generate type:permission-set Read on Account`) or just describe the task; each skill routes to the right mode and loads only that mode's guide.

### `/sf-lfg` — the full pipeline

```
Ideate → Brainstorm → Plan → Deepen → Work → Review → Resolve → Polish → Test → Deploy → Compound
```

Each stage has gates. The pipeline aborts and asks for input on security regressions, governor regressions, repeated test failures, or deployment validation problems.

```bash
/sf-lfg "Lead auto-assignment flow based on territory" deploy=scratch
```

### Review lenses (9)

`/sf-review` dispatches **one isolated subagent per applicable lens**, passing file paths rather than contents (parallel on Claude Code, inline elsewhere). An Apex-only diff typically runs three: `apex`, `security`, `tests`.

| Lens | Covers |
|---|---|
| `apex` | Governor limits, bulkification, triggers, async, exceptions, query selectivity |
| `security` | CRUD/FLS, sharing, SOQL injection, XSS, secrets, guest/Experience Cloud exposure |
| `flow` | Flow limits and design, automation order, validation rules |
| `lwc` | Component design, wire/LDS, performance, accessibility, Aura migration |
| `integration` | Callouts, Named Credentials, REST contracts, Platform Events/CDC, Hosted MCP config |
| `metadata` | Cross-metadata consistency, data model, migrations, destructive changes, project standards |
| `tests` | Apex/Jest test quality, bulk and `runAs` coverage, correctness against the plan |
| `architecture` | Layering, duplication, simplicity, adversarial probes (comprehensive depth only) |
| `doc` | Plans and requirements: acceptance criteria, feasibility, scope, security |

Research personas (`sf-learnings-researcher`, `sf-repo-research-analyst`, `sf-external-researcher`) serve `/sf-plan`; four file-writing personas serve bug reproduction, PR comment resolution, deployment verification, and MCP tool building.

> **⚠️ Agentforce DX notes (April–May 2026):**
> - **`topic` is deprecated.** Use `subagent`, `start_agent agent_router:`, and `@subagent.name` everywhere.
> - **Default preview = simulated.** Without `--use-live-actions`, real Apex is never called. `--mode live` does not exist.
> - **Debug logs → Agent User, not admin.** Apex runs as the Einstein Agent User.
> - **API version must match your org.** Spring '26 = `66.0`, Summer '26 = `67.0`.
> - **Multi-component deploys need Package XML.** Use `--manifest manifest/package.xml`; the metadata type is `AiAuthoringBundle`.

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
│   ├── plugin.json           # Plugin manifest (v4.0.0)
│   └── marketplace.json      # Marketplace loader schema
├── .cursor-plugin/           # Cursor plugin manifest
├── .codex-plugin/            # Codex plugin manifest
├── .mcp.json                 # Context7 + Salesforce DX MCP config
├── schema.yaml               # YAML validation for docs/solutions/
├── PRINCIPLES.md             # Seven governing principles (source of truth)
├── CLAUDE.md                 # Project context and protected artifacts
├── cli/                      # Multi-tool installer CLI (Bun)
│   ├── package.json          # salesforce-compound-engineering-plugin
│   ├── src/
│   │   ├── index.ts          # CLI entry (citty)
│   │   ├── parser/           # Plugin reader + markdown parser
│   │   ├── converters/       # 11 platform converters
│   │   ├── transforms/       # Path, reference, frontmatter rewriting
│   │   ├── tend/             # Local feed state, cards, work, receipts, learning
│   │   └── utils/            # Auto-detect, merge helpers
│   └── tests/
├── skills/                   # 10 skills
│   ├── index.md              # Skill routing map
│   ├── sf-<skill>/SKILL.md   # Entry point: triggers + mode table
│   ├── sf-<skill>/references/<mode>/guide.md   # Mode guides, loaded on demand
│   └── sf-review/references/lenses/            # 9 review lenses + contract
├── hooks/ + scripts/         # Session primer, deploy gate, opt-in metadata gate/telemetry
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

**Salesforce Hosted MCP** — a separate Salesforce-managed, OAuth/PKCE-connected surface for org data and automation. Hosted MCP servers are now generally available; configure them through [Salesforce Hosted MCP documentation](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/hosted-mcp-servers-overview.html), starting with a read-only server and an External Client App. 

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

* Add checklist items to a review lens
* Add a mode to an existing skill (prefer this over a new skill)
* Add solution documents to `docs/solutions/`

See `.claude/skills/create-agent-skills/SKILL.md` for agent/skill authoring guidance, and read `PRINCIPLES.md` before non-trivial changes to workflow skills.

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
