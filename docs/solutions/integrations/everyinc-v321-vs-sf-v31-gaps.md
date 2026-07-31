---
title: EveryInc v3.21.0 vs SF Compound Engineering v3.1 gaps audit
type: audit
status: active
date: 2026-07-31
supersedes: docs/plans/2026-03-02-feat-close-teardown-gaps-plan.md
---

# Audit: EveryInc `compound-engineering-v3.21.0` vs SF `3.1.0-beta.6`

Fresh gap matrix produced while executing [`2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md`](../../plans/2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md). The March 2026 teardown plan is **historical only**. Skill ports from the recommended batch landed in **`3.1.0-beta.6`**.

## Fingerprints

| Tree | Identity | Version | Commit / tag | Skills | Personas |
| --- | --- | --- | --- | --- | --- |
| **SF (post-port)** | `gellasangameshgupta/salesforce-compound-engineering-plugin` | `3.1.0-beta.6` | this change | 68 | 61 |
| **SF audit baseline** | `origin/main` at audit time | `3.1.0-beta.5` | `135120693dc1181d2d4cf1672815b8dcc7c38a29` | 62 | 61 |
| **EveryInc compare pin** | `EveryInc/compound-engineering-plugin` | `3.21.0` | tag `compound-engineering-v3.21.0` @ `c553b957842fbd87f65f90ff5af4f18deb91f56c` | 32 | 27 |

### Repo identity note

| Repo | Role |
| --- | --- |
| `gellasangameshgupta/salesforce-compound-engineering-plugin` | **Current V3.1 source of truth** (this workspace `origin`) |
| `gellasangameshgupta/sf-compound-engineering-plugin` | Older / v2 lineage — do not mix into this tree |
| `sangameshgupta/sf-compound-engineering-plugin` | Earlier public mirror — not the sync source for this audit |

## Summary counts

| Axis | EveryInc v3.21.0 | SF v3.1.0-beta.6 | Notes |
| --- | --- | --- | --- |
| Skills | 32 | 68 | SF denser (domain + workflow); +6 EveryInc gap ports |
| Persona / research assets | 27 | 61 | SF agentless personas under skills |
| Native plugin manifests | Many (`.claude-plugin`, `.cursor-plugin`, `.codex-plugin`, `.kimi-plugin`, `.grok-plugin`, `.devin-plugin`, `.agy`, `.agents`, `.opencode`, `.pi`, `.cline`, …) | `.claude-plugin`, `.cursor-plugin`, `.codex-plugin` (+ Bun CLI converters for more) | Packaging gap for native-first dirs |
| `docs/solutions/` | Present | Scaffolded this change | Was missing at audit start |
| `docs/brainstorms/` | Present | Scaffolded this change | Was missing at audit start |
| Hooks | Present (skill/plugin packaging) | `hooks/hooks.json` | Parity for Claude/Cursor hooks surface |
| MCP | Context7-oriented upstream packaging | `.mcp.json` + Cursor `mcp.json` dual-ship; Context7 + Salesforce DX | SF ahead on Salesforce DX |

## Workflow spine

| Capability | EveryInc | SF | Status |
| --- | --- | --- | --- |
| brainstorm | `ce-brainstorm` | `sf-brainstorm` | parity |
| plan | `ce-plan` | `sf-plan` | parity |
| work | `ce-work` | `sf-work` | parity |
| review | `ce-code-review` | `sf-review` | parity |
| compound | `ce-compound` | `sf-compound` | parity |
| lfg | `lfg` | `sf-lfg` | parity |
| ideate | `ce-ideate` | `sf-ideate` | parity |
| polish | `ce-polish` | `sf-polish` | parity |
| strategy | `ce-strategy` | `sf-strategy` | parity |
| deepen | — | `sf-deepen` | intentional_sf / sf_ahead |
| tend | — | `sf-tend` | intentional_sf / sf_ahead |

## Skill inventory (`ce-*` → `sf-*`)

Status values: `parity` | `gap` | `intentional_sf` | `sf_ahead`

### Mapped parity

| EveryInc | SF | Status | Notes |
| --- | --- | --- | --- |
| `ce-brainstorm` | `sf-brainstorm` | parity | |
| `ce-code-review` | `sf-review` | parity | Name differs; same role |
| `ce-commit` | `sf-commit` | parity | |
| `ce-commit-push-pr` | `sf-commit-push-pr` | parity | |
| `ce-compound` | `sf-compound` | parity | |
| `ce-compound-refresh` | `sf-compound-refresh` | parity | |
| `ce-debug` | `sf-debug` | parity | |
| `ce-doc-review` | `sf-doc-review` | parity | |
| `ce-ideate` | `sf-ideate` | parity | |
| `ce-optimize` | `sf-optimize` | parity | |
| `ce-plan` | `sf-plan` | parity | |
| `ce-polish` | `sf-polish` | parity | |
| `ce-product-pulse` | `sf-product-pulse` | parity | |
| `ce-proof` | `sf-proof` | parity | |
| `ce-resolve-pr-feedback` | `sf-resolve-pr-feedback` | parity | |
| `ce-setup` | `sf-setup` | parity | |
| `ce-simplify-code` | `sf-simplify-code` | parity | |
| `ce-strategy` | `sf-strategy` | parity | |
| `ce-work` | `sf-work` | parity | |
| `ce-worktree` | `git-worktree` | parity | Prefix/name differs |
| `lfg` | `sf-lfg` | parity | |

### Upstream-only (open gaps — not ports yet)

| EveryInc skill | Severity | Suggested action |
| --- | --- | --- |
| `ce-handoff` | high | **ported** → `sf-handoff` |
| `ce-babysit-pr` | high | **ported** → `sf-babysit-pr` |
| `ce-explain` | medium | **ported** → `sf-explain` |
| `ce-sweep` | medium | **ported** → `sf-sweep` (feedback-source sweep; SF-aware verify) |
| `ce-retune` | medium | **ported** → `sf-retune` (distinct: measurement-first corpus retune; requires harness) |
| `ce-dogfood` | low | Optional — dogfood protocol for plugin authors |
| `ce-pov` | low | Optional product POV skill |
| `ce-promote` | low | Evaluate release promote vs SF release-notes / CLI |
| `ce-riffrec-feedback-analysis` | low | Niche; defer unless RiffRec used |
| `ce-test-browser` | medium | **ported** → `sf-test-browser` (LWC/Aura/Experience route mapping) |
| `ce-test-xcode` | low | Not relevant to Salesforce — skip / intentional non-port |

### SF-only keepers (intentional / ahead)

Representative set (not exhaustive): `sf-deepen`, `sf-tend`, `sf-cli`, Agentforce trio, Apex/LWC/Flow/metadata generators, `governor-limits`, `security-guide`, `hosted-mcp-servers`, `mcp-tool-builder`, `dispatching-parallel-personas`, `PRINCIPLES.md`-backed workflow skills, session/tend surfaces.

## Packaging matrix

| Area | EveryInc | SF | Status | Severity | Suggested action |
| --- | --- | --- | --- | --- | --- |
| Claude / Cursor / Codex manifests | Yes | Yes | parity | — | Keep converter sync |
| Extra native harness dirs (Kimi, Grok, Devin, agy, …) | Yes | Via Bun CLI install targets | gap | medium | Document native-first roadmap; optional native dirs later |
| `docs/solutions` + `docs/brainstorms` | Yes | Scaffolded | parity (new) | — | Start compounding into them |
| `docs/ideation`, `docs/skills`, `docs/specs` | Yes | Partial / missing | gap | low | Optional catalog ports |
| CLI posture | Native install + convert tooling | Bun installer primary | gap | medium | Keep installer; market native manifests more clearly |
| Principles / concepts | `CONCEPTS.md` / README | `PRINCIPLES.md` | sf_ahead / intentional_sf | — | Keep numbered principles |

## Closed since March 2026 (CRITICAL + HIGH from stale plan)

Evidence paths relative to this repo:

| # | March gap | Status now | Evidence |
| --- | --- | --- | --- |
| 1 | Parallel agent dispatch | **closed** | `skills/dispatching-parallel-personas/`, workflow skills Task dispatch |
| 2 | Multi-agent parallel review | **closed** | `skills/sf-review/` + `skills/sf-review/references/personas/` |
| 3 | Knowledge compounding system | **mostly closed** | `skills/sf-compound/`, `schema.yaml`, `sf-learnings-researcher`; dirs scaffolded `docs/solutions/` |
| 4 | Formal workflows | **closed** | skills spine: brainstorm → plan → deepen → work → review → compound (+ lfg) |
| 5 | Brainstorm phase | **closed** | `skills/sf-brainstorm/` |
| 6 | Hooks | **closed** | `hooks/hooks.json` |
| 7 | MCP | **closed** | `.mcp.json` (+ Cursor `mcp.json`) |
| 8 | Git worktree | **closed** | `skills/git-worktree/` |
| 9 | Learnings researcher | **closed** | `skills/sf-plan/references/personas/sf-learnings-researcher.md` |
| 10–14 | Research / deepen / skill creation / CLI | **closed** | personas under `sf-plan`/`sf-review`; `sf-deepen`; `create-agent-skills`; `sf-cli` |

Still open from March spirit: populated institutional `docs/solutions/**` content (scaffold only until teams compound).

## Severity-ranked open gaps (actionable)

1. **high** — Grow real `docs/solutions/` learnings (process + content), not just README.
2. **medium** — Cursor Marketplace submission (packaging ready; external submit remaining).
3. **medium** — Broader native harness manifests vs CLI-only install.
4. **low** — Optional `dogfood` / `pov` / `promote` / `riffrec` (skip xcode).
5. ~~Port handoff / babysit-pr / explain / sweep / retune / test-browser~~ — **done in 3.1.0-beta.6**.

## Recommended next port batch (≤10)

**Completed in `3.1.0-beta.6`:** `sf-handoff`, `sf-babysit-pr`, `sf-explain`, `sf-sweep`, `sf-retune`, `sf-test-browser`.

### Retune evaluation (done)

| Skill | Role |
| --- | --- |
| `sf-update` | Plugin self-update from GitHub releases |
| `sf-compound-refresh` | Refresh stale `docs/solutions/` learnings |
| `sf-retune` | Measurement-first **skill-corpus** retune for a new model (requires A/B harness); refuses without one |

These are complementary, not duplicates.

### Remaining / deferred

1. Seed 3–5 real `docs/solutions/` entries from recent SF work
2. Native-manifest spike for one additional harness (e.g. OpenCode/Pi) if CLI friction reported
3. Optional `ce-dogfood` → `sf-dogfood` for plugin maintainers
4. Optional `ce-pov` / `ce-promote` / `ce-riffrec-feedback-analysis` only if product need appears
5. Skip `ce-test-xcode` (non-Salesforce)

## Cursor Marketplace readiness

Aligned to [cursor/plugin-template](https://github.com/cursor/plugin-template) (single-plugin shape) and [cursor/plugins](https://github.com/cursor/plugins) examples.

| Checklist item | Status after this change |
| --- | --- |
| Root `.cursor-plugin/plugin.json` kebab-case name | parity (`sf-compound-engineering`) |
| displayName / author / description / keywords / license / version | parity |
| `category` + `tags` | parity |
| `logo` + `assets/logo.svg` | parity |
| `skills` + `hooks` path fields | parity |
| No empty `agents/` / `rules/` / `commands/` | intentional_sf (V3.1 agentless) |
| Root `mcp.json` for Cursor | parity (dual-ship; `.mcp.json` remains Claude canonical) |
| Skill frontmatter `name` + `description` | parity (fixed 4 legacy skills) |
| `node scripts/validate-cursor-plugin.mjs` | parity |
| External Marketplace listing / email submit | process — draft below; do not send unless requested |

### Submission packet (draft — do not send yet)

- **Repository:** https://github.com/gellasangameshgupta/salesforce-compound-engineering-plugin
- **Plugin name:** `sf-compound-engineering`
- **Display name:** Salesforce Compound Engineering
- **One-liner:** Salesforce-focused compound engineering skills for Cursor (plan → work → review → compound) with Apex/LWC/Flow/Agentforce depth.
- **Validate:** `node scripts/validate-cursor-plugin.mjs` (expect pass)
- **Contact:** Gella Sangamesh Gupta — https://github.com/gellasangameshgupta
- **Submit to:** Cursor team Slack or `kniparko@anysphere.com` (per plugin-template README)

### Maintainer note on MCP

- Canonical Claude file: `.mcp.json`
- Cursor Marketplace / consumers: `mcp.json` (keep content in sync when editing MCP servers)

## Sources

- EveryInc tag: https://github.com/EveryInc/compound-engineering-plugin/releases/tag/compound-engineering-v3.21.0
- Cursor template: https://github.com/cursor/plugin-template
- Cursor examples: https://github.com/cursor/plugins
- Historical: [`docs/plans/2026-03-02-feat-close-teardown-gaps-plan.md`](../../plans/2026-03-02-feat-close-teardown-gaps-plan.md)
