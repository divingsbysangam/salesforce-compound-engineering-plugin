# Upstream baseline

This repository is a Salesforce-adapted fork of Every Inc's compound-engineering plugin. Histories are **not** shared (`git merge-base` between `origin/main` and `upstream/main` fails; roots differ). Sync is content- and message-driven, not a git merge from upstream.

## Upstream

| Field | Value |
| --- | --- |
| Upstream URL | https://github.com/everyinc/compound-engineering-plugin |
| Upstream remote (local) | `upstream` → `https://github.com/everyinc/compound-engineering-plugin.git` |
| Default upstream branch | `main` |

## Last synced upstream commit (baseline)

| Field | Value |
| --- | --- |
| SHA | `c553b957842fbd87f65f90ff5af4f18deb91f56c` |
| Short | `c553b957` |
| Date | 2026-07-30 18:54:03 -0700 |
| Subject | `chore: release main (#1232)` |
| Upstream version at SHA | **3.21.0** (`.claude-plugin/plugin.json`) |
| Confidence | **Medium-high (~80%)** |

### How this baseline was determined

1. **Shared history:** `git merge-base origin/main upstream/main` exits non-zero. Fork root `84eb2586…`, upstream root `77de729c…`. No common ancestor — cherry-pick / merge-base alone cannot name a sync point.
2. **Documented sync:** Fork commits and plans explicitly compared against EveryInc **v3.21.0** (e.g. `7066586f` — “Sync/compare against EveryInc compound-engineering-v3.21.0”; `docs/plans/2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md`).
3. **Content match:** The 2026-07-31 gap port (`a3ae6acd`) added Salesforce `sf-*` counterparts of workflows present at upstream 3.21.0 (`ce-babysit-pr`, `ce-explain`, `ce-handoff`, `ce-retune`, `ce-sweep`, `ce-test-browser`, plus earlier ports of plan/work/review/compound/lfg and related skills). Skill bodies are adapted (Apex, LWC, Flow, sf CLI), not byte-identical.
4. **Post-3.21 contact:** The Aug 2026 “v3.22 adoption” work recorded an explicit **do-not-overlay** verdict (layout / 8KB progressive-disclosure patterns only). No later upstream release SHA is documented as fully synced.

Resolved release commit for 3.21.0 on `upstream/main`:

```text
c553b957842fbd87f65f90ff5af4f18deb91f56c  2026-07-30  chore: release main (#1232)
```

## Folder mapping

Upstream paths → this fork. Renames and Salesforce adaptations are noted.

| Upstream path | Fork path | Notes |
| --- | --- | --- |
| `skills/ce-<name>/` | `skills/sf-<name>/` (pre-v4) → modes under ten entry skills (v4) | `ce-` → `sf-` namespace. Bodies rewritten for Apex, LWC, Flow, governor limits, sf CLI / DX MCP. v4.0.0 consolidated ~68 skills into ten entry points (`sf-plan`, `sf-work`, `sf-generate`, `sf-review`, `sf-debug`, `sf-deploy`, `sf-ship`, `sf-compound`, `sf-lfg`, `sf-know`) with on-demand modes. |
| `skills/lfg/` | `skills/sf-lfg/` | Full-pipeline orchestrator; SF abort rules on Critical/High security findings. |
| `skills/ce-code-review/references/personas/` | `skills/sf-review/references/personas/` + `…/lenses/` | Personas stay skill-local (agentless). Many generic reviewers replaced or complemented by stack **lenses** (`apex`, `lwc`, `flow`, `integration`, `security`, …). |
| `skills/ce-plan/references/` (research agents) | `skills/sf-plan/references/personas/` | Research personas owned by `sf-plan`. |
| `skills/ce-brainstorm/`, `ce-ideate/`, `ce-polish/`, `ce-strategy/` | Absorbed into `sf-plan` / `sf-review` (polish) / strategy grounding | Workflow renamed and stack-aware; polish is SLDS2 / UX / a11y when UI work applies. |
| `skills/ce-test-xcode/`, `ce-riffrec-*`, Rails/TS-only helpers | *(not ported)* | Skip per sync rules. |
| `src/` (Bun installer / converters / Tend-adjacent runtime) | `cli/` | Fork keeps a Bun CLI under `cli/` plus legacy Python `sfce.py`; converters emit multi-harness layouts. Salesforce install package name differs. |
| `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/` | Same paths | Manifest `name` / version / keywords are Salesforce-specific (`sf-compound-engineering`). |
| Upstream multi-harness dirs (`.pi`, `.opencode`, `.grok-plugin`, …) | Emitted by `cli/` converters; not all checked in as source trees | Port harness support via converters; do not hand-author per-harness forks. |
| `docs/solutions/`, `docs/plans/`, `docs/brainstorms/` | Same paths | Protected institutional knowledge; SF-specific schema/`category` values. Never delete. |
| `agents/` (historical upstream) | Removed — personas under owning skill `references/personas/` | V3.1 agentless model. |
| `commands/` (historical upstream) | Retired — skills are the entry points | V3 skills-first. |
| `hooks/` | `hooks/` | SF metadata gate + skill telemetry (opt-in); not a straight port of upstream hooks. |
| `PRINCIPLES.md` | `PRINCIPLES.md` | Fork-authored numbered principles; source of truth for this product. |
| `CLAUDE.md`, `README.md`, `CHANGELOG.md` | Same filenames | Salesforce identity, install paths, and catalog — not tracking-fork docs. |
| `schema.yaml` | `schema.yaml` | Validates `docs/solutions/` frontmatter. |
| Domain skills (none upstream) | `skills/` domain content historically (governor-limits, Apex/LWC/Flow patterns, Agentforce, hosted MCP, generators) → largely under `sf-generate` / `sf-know` / deploy modes in v4 | Salesforce-only; no upstream counterpart. |

## Sync rules

**Port**

- Core compound-engineering engine behavior (plan → work → review → compound / lfg loops).
- Workflow and skill/agent **format** changes (frontmatter, progressive disclosure, persona dispatch shape, harness manifest fields) when they improve portability.
- Bug fixes and reliability fixes in shared workflow skills (review, work, debug, compound, babysit, resolve-pr-feedback, etc.), adapted into the owning `sf-*` skill or mode.

**Adapt**

- Stack-neutral patterns: rewrite examples and checks for **Apex**, **LWC**, **Flow**, governor limits, CRUD/FLS, package/deploy, and **sf CLI** / Salesforce DX MCP.
- Keep `sf-` naming, `PRINCIPLES.md`, and Salesforce-only skills/modes (Agentforce, generators, deepen/tend heritage, org deploy gates).

**Skip**

- Rails-only, Ruby-gem, TypeScript-app-only, Xcode/iOS-only, RiffRec/design-tool, and Every.to marketing/site-only changes.
- Overlaying the upstream `ce-*` tree onto this catalog.
- Anything that conflicts with a numbered principle without an explicit principle citation and human decision.

## Weekly sync PRs

1. Once per week, open **one draft PR** from branch `upstream-sync/<YYYY-MM-DD>` (UTC date of the sync run).
2. Fetch read-only upstream (`git fetch upstream main`). Walk commits after the baseline (then after the last successfully merged sync) up to current `upstream/main`.
3. PR body must include three lists:
   - **Synced** — ported or cherry-adapted with file pointers.
   - **Adapted** — stack-neutral upstream change rewritten for Salesforce (Apex / LWC / sf CLI).
   - **Skipped** — Rails/TS-only, host-specific, or principle conflicts, with reason.
4. Update this file’s baseline SHA/date when a sync PR is **human-merged**.
5. **Human merge only.** Never auto-merge weekly sync PRs. Never merge this baseline PR as a substitute for a sync.

## Backlog for first weekly sync

Upstream commits **after** baseline `c553b957` through `upstream/main` at documentation time (`50532b00`, 2026-10-11, plugin **3.30.5**):

| Metric | Value |
| --- | --- |
| Commit count | **349** |
| Version span | 3.21.0 → 3.30.5 |
| Approx. mix | ~248 `fix`, ~35 `chore` (incl. ~31 releases), ~31 `docs`, ~21 `feat`, plus ci/refactor/test/perf |

### Themes (first sync triage)

High-signal areas to evaluate first (adapt if stack-neutral; skip if Rails/TS/site-only):

- **Review / code-review** — large volume of `ce-code-review` and persona/criteria fixes; map into `sf-review` lenses/personas.
- **Work / plan / debug / compound** — worker dispatch, commit conventions, compound learnings, plan scoping checkpoints.
- **Cross-model / harness** — peer review transport, OpenCode/omp peers, Agent Plugins manifest, skill-eval harnesses (port format ideas; skip non-SF host wiring as needed).
- **New upstream skills/features since 3.21** — e.g. `ce-prototype`, `ce-noslop`, `ce-bakeoff`, `wtf`, Compound Packs, live `ce-polish`, docs site — triage each: adapt, absorb into an existing `sf-*` mode, or skip.
- **Babysit / commit-push-pr / resolve-pr-feedback** — reliability fixes worth adapting into `sf-ship` / review flows.
- **Release chore commits** — usually no product port; use only as version landmarks.

Representative newest commits (tip of backlog):

```text
50532b00 chore: release main (#1841)                          # 3.30.5
0dd316d7 fix(ce-code-review): flag unrequested surface…
62ff8a71 fix(ce-code-review): clarify Stage 4 asset reads
6505f4be fix(ce-debug): honor project commit conventions
51aa5373 fix(ce-noslop): keep claim certainty…
```

Representative oldest commits (just after baseline):

```text
1b46bafa fix(babysit): harden the post-PR handoff…
c5358ed2 fix(ce-work): pin codex worker reasoning effort to high
5fe35052 fix(ce-handoff): stop resume from inventing fake choice menus
fea76d43 fix: rename mode:headless to mode:non-interactive
```

The first `upstream-sync/<date>` draft PR should work this **349**-commit window (or a justified subset with the rest deferred and listed under Skipped/deferred).
