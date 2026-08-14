---
title: Fetch EveryInc updates, sync SF plugin, gaps doc, and Cursor Marketplace readiness
type: feat
status: completed
date: 2026-07-31
---

# feat: EveryInc sync verification + gaps document + Cursor Marketplace readiness

## Overview

Create a repeatable sync-and-compare workflow that:

1. Fetches the latest [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) (currently `compound-engineering-v3.21.0`).
2. Verifies this workspace against the SF Compound Engineering plugin remote(s).
3. Produces a **fresh gaps document** that supersedes the stale v2-era matrix in [`docs/plans/2026-03-02-feat-close-teardown-gaps-plan.md`](./2026-03-02-feat-close-teardown-gaps-plan.md).
4. Confirms local files are synced from the SF plugin source of truth.
5. Brings Cursor packaging to [plugin-template](https://github.com/cursor/plugin-template) / [cursor/plugins](https://github.com/cursor/plugins) parity and prepares Marketplace submission.

This plan is research-and-documentation first for EveryInc gaps. **Phase F** may include packaging edits required for Cursor Marketplace submit readiness (manifests, logo path, MCP filename, validation). Porting upstream skills remains out of scope unless explicitly selected after the gaps document is accepted.

## Problem Statement / Motivation

The March 2026 teardown gap plan is **no longer accurate**:

| Then (2026-03-02 plan) | Now (`/workspace` on `main`) |
| --- | --- |
| 4 commands + 23 agents + 7 skills | Skills-first V3.1: **62 skills**, **61 personas**, **0 agents/**, **0 commands/** |
| No MCP / hooks / docs | `.mcp.json`, `hooks/`, `docs/plans`, multi-platform manifests |
| Parallel dispatch missing | Persona dispatch via workflow skills |
| Compounding incomplete | Compound skill exists, but `docs/solutions/` and `docs/brainstorms/` still absent |

Meanwhile upstream EveryInc has moved to **v3.21.0** with native multi-harness packaging, `docs_root`, cross-model patterns, and several skills SF still lacks (or names differently). Without a current gaps document, porting work will re-open closed gaps and miss real ones.

## Repo identity note (important)

Two similarly named remotes exist historically:

| Repo | Role |
| --- | --- |
| `divingsbysangam/salesforce-compound-engineering-plugin` | **Current V3.1 source of truth** — this workspace’s `origin` |
| `gelladivingsbysangam/salesforce-compound-engineering-plugin` | Older/v2 lineage (and earlier Claude-plugin-parity experiments) |
| `divingsbysangam/salesforce-compound-engineering-plugin` | Public mirror created during earlier work |

**Default for this plan:** treat `salesforce-compound-engineering-plugin` as the SF local sync source (already checked out at `/workspace` @ `1351206`). If the user insists on the older `sf-compound-engineering-plugin` URL, document the mismatch and either rebase or explicitly fork-compare — do not silently mix trees.

## Research Decision

External research **is required** (cross-repo version delta + packaging posture change). Local patterns are strong, but the gap matrix must be grounded in upstream `compound-engineering-v3.21.0` and the current SF `3.1.0-beta.5` tree.

Key upstream references:

- https://github.com/EveryInc/compound-engineering-plugin
- Release: https://github.com/EveryInc/compound-engineering-plugin/releases/tag/compound-engineering-v3.21.0
- README philosophy / install: https://github.com/EveryInc/compound-engineering-plugin/blob/main/README.md
- Native install strategy: https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/solutions/integrations/native-plugin-install-strategy.md

Institutional note: prior gap work lives in [`docs/plans/2026-03-02-feat-close-teardown-gaps-plan.md`](./2026-03-02-feat-close-teardown-gaps-plan.md) and [`docs/plans/2026-04-25-001-feat-v3-architecture-migration-plan.md`](./2026-04-25-001-feat-v3-architecture-migration-plan.md). Mark those as historical inputs, not current truth.

## SpecFlow Analysis

| Flow | Expected | Risk if skipped |
| --- | --- | --- |
| Fetch upstream | Shallow clone/tag pin of EveryInc `compound-engineering-v3.21.0` | Comparing against stale main |
| Sync SF local | `git fetch/pull` on `salesforce-compound-engineering-plugin` | Gaps doc describes dirty/out-of-date tree |
| Diff axes | Skills inventory, personas, manifests, docs dirs, CLI posture, scripts | False gaps / missed gaps |
| Write gaps doc | New markdown under `docs/` with severity + status columns | Continues relying on stale March plan |
| Cursor Marketplace | Align manifests/assets/MCP/validate to plugin-template + examples | Rejected or incomplete Marketplace listing |
| Protect dirs | Create empty `docs/solutions/` + `docs/brainstorms/` with README placeholders if missing | Compound loop has nowhere to write |

Edge cases:

- Skill renamed (`ce-code-review` ↔ `sf-review`) must count as **parity**, not a gap.
- SF-only capabilities (`sf-tend`, `sf-deepen`, Agentforce/MCP domain skills) are **intentional deltas**, not deficits.
- Upstream native-harness dirs (`.kimi-plugin`, `.agy`, `.devin-plugin`, etc.) may be deferred if SF remains Claude-first — still document as packaging gaps.

## Proposed Solution

### Phase A — Sync SF local (verify / refresh)

1. Confirm remotes and HEAD:
   - Expected: `origin` → `divingsbysangam/salesforce-compound-engineering-plugin`
   - Expected: clean `main` tracking `origin/main`
2. `git fetch origin && git pull --ff-only origin main` (or equivalent).
3. Record fingerprint in the gaps doc: commit SHA, plugin version from `.claude-plugin/plugin.json` (`3.1.0-beta.5` at plan time), skill count, persona count.
4. If user also wants the older `sf-compound-engineering-plugin` tree: add as a second remote for comparison only; do not overwrite V3.1 workspace.

### Phase B — Fetch EveryInc updates

1. Shallow-fetch upstream into an isolated path (e.g. `/tmp/everyinc-compound-engineering` or `../_upstream/compound-engineering-plugin`).
2. Check out tag `compound-engineering-v3.21.0` (or newer if released during execution).
3. Capture fingerprint: tag, commit SHA, skill count, persona/agent-asset count, manifest list.
4. Do **not** merge upstream into SF. This is compare-only.

### Phase C — Map gaps (axes)

Build a matrix with columns: `Area`, `EveryInc`, `SF`, `Status` (`parity` / `sf_ahead` / `gap` / `intentional_sf`), `Severity`, `Notes`, `Suggested action`.

Primary axes:

1. **Workflow spine** — brainstorm/plan/work/review/compound/lfg (+ SF deepen/polish/strategy/tend).
2. **Skill inventory** — name-map `ce-*` → `sf-*`; list missing high-value skills (`handoff`, `babysit-pr`, `retune`, `dogfood`, `pov`, `explain`, `sweep`, product-pulse equivalents, etc.).
3. **Persona / research assets** — count and ownership (`sf-review` vs `ce-code-review`; plan research agents).
4. **Packaging** — `.claude-plugin` / `.cursor-plugin` / `.codex-plugin` vs upstream’s broader native manifests; Bun CLI as installer vs maintenance tooling; Cursor Marketplace checklist (Phase F).
5. **Docs compound surface** — `docs/solutions/`, `docs/brainstorms/`, `docs/ideation/`, `docs/skills/` catalog, `docs_root` support.
6. **Runtime scripts** — skill-local scripts, cross-model / peer-job patterns, release:validate discipline.
7. **Principles / glossary** — SF `PRINCIPLES.md` vs upstream CONCEPTS/README philosophy.
8. **Closed historical gaps** — explicitly mark March 2026 CRITICAL items that V3.1 already closed (parallel persona dispatch, MCP, hooks, deepen, etc.).

### Phase D — Write the gaps document

Create a durable artifact (recommended path):

```text
docs/plans/2026-07-31-002-audit-everyinc-v321-vs-sf-v31-gaps.md
```

or, if preferred as institutional audit (not a plan):

```text
docs/solutions/integrations/everyinc-v321-vs-sf-v31-gaps.md
```

(Requires creating `docs/solutions/` first — aligns with CLAUDE.md protected-dir expectations.)

Document must include:

- Fingerprints for both trees
- Summary counts table
- Severity-ranked open gaps
- Intentional SF deltas (keepers)
- Closed gaps since March 2026
- Recommended next port batch (top 5–10 only)

### Phase E — Minimal local hygiene tied to sync

While syncing/verifying, create missing protected directories if absent (empty scaffolds only):

- `docs/solutions/` (+ short README describing purpose + `schema.yaml` link)
- `docs/brainstorms/` (+ short README)

Do **not** bulk-port upstream skills in this plan.

### Phase F — Cursor Marketplace readiness

Align this repo with Cursor’s official packaging model so it can be submitted to the Cursor Marketplace.

**Canonical references:**

| Source | Role |
| --- | --- |
| [cursor/plugin-template](https://github.com/cursor/plugin-template) | Authoring template + submission checklist + `scripts/validate-template.mjs` |
| [cursor/plugins](https://github.com/cursor/plugins) | Live multi-plugin marketplace examples (`continual-learning`, `cursor-team-kit`, `pstack`, etc.) |

**Repo shape decision (single-plugin):**

The template defaults to **multi-plugin** (`plugins/*` + root `.cursor-plugin/marketplace.json`). For a **single plugin**, Cursor’s guidance is: keep one root `.cursor-plugin/plugin.json` and **do not** require a marketplace.json. This SF repo already matches the single-plugin shape (skills at repo root). Prefer that shape over restructuring into `plugins/sf-compound-engineering/`.

Optional later: if publishing a private multi-plugin marketplace of SF variants, add `.cursor-plugin/marketplace.json` listing `{ "name", "source", "description" }` entries — mirror Claude’s `.claude-plugin/marketplace.json` only if multi-plugin distribution is needed.

**Plan-time audit vs template / examples:**

| Checklist item | SF today (`3.1.0-beta.5`) | Status |
| --- | --- | --- |
| Root `.cursor-plugin/plugin.json` with unique kebab-case `name` | Present: `sf-compound-engineering` | parity |
| `displayName`, `author`, `description`, `keywords`, `license`, `version` | Present | parity |
| `category` + `tags` (common on `cursor/plugins` examples) | Missing | gap |
| `logo` + committed `assets/` image | Missing | gap |
| Path fields: `skills`, `hooks` (examples declare `./skills/`, `./hooks/hooks.json`) | Skills/hooks exist on disk; **not declared** in Cursor `plugin.json` | gap |
| `agents` / `rules` / `commands` | Intentionally absent (V3.1 agentless) | intentional_sf — do not invent empty dirs |
| MCP file named `mcp.json` at plugin root | Have `.mcp.json` only (Claude convention) | gap — dual-ship or symlink/copy for Cursor |
| Skill/rule frontmatter complete | Skills use `name`/`description`/`argument-hint` | verify during F |
| `node scripts/validate-template.mjs` (or SF equivalent) | Missing | gap |
| Public repo link ready for Cursor team submit | Repo exists; submission email `kniparko@anysphere.com` / Cursor Slack | process |

**Phase F execution steps:**

1. **Manifest parity** — update `.cursor-plugin/plugin.json` to match example richness without breaking Claude/Codex converters:
   - Add `category` (likely `developer-tools`), `tags`, `logo`, `skills: "./skills/"`, `hooks: "./hooks/hooks.json"`.
   - Add `mcpServers` / MCP path only if Cursor’s schema documents it; otherwise rely on root `mcp.json`.
   - Keep `name` stable (`sf-compound-engineering`) — marketplace uniqueness matter.
2. **Assets** — add `assets/logo.svg` or `assets/avatar.png` (committed relative path as in examples). Prefer a simple Salesforce/compound mark; no need for multi-resolution set at submit time.
3. **MCP dual-ship** — ensure Cursor consumers see `mcp.json`:
   - Preferred: commit `mcp.json` with the same content as `.mcp.json`, or generate both from CLI converter.
   - Document which file is canonical for maintainers (recommend `.mcp.json` as source; Cursor copy derived).
4. **Validation** — either vendor/adapt `scripts/validate-template.mjs` from the template for single-plugin layout, or extend Bun CLI lint to enforce Cursor checklist (name kebab-case, logo exists, skills path resolves, hooks path resolves, mcp.json present).
5. **README / install docs** — add a short “Install from Cursor Marketplace” section once listing is accepted; until then document “local / Git install” and submission status.
6. **Submission package** — prepare email/Slack packet for Cursor team:
   - Public GitHub URL
   - Plugin `name` + one-line description
   - Confirmation `validate` passes
   - Contact owner matching `author` in manifest
7. **Record findings** — append a “Cursor Marketplace readiness” section to the gaps doc (or a sibling `docs/plans/2026-07-31-003-feat-cursor-marketplace-readiness-plan.md` if Phase F grows large). Mark each checklist row `parity` / `gap` / `intentional_sf`.

**Out of scope for Phase F:**

- Publishing *into* Cursor’s official `cursor/plugins` monorepo (that is Cursor-owned).
- Creating registered Cursor `agents/` just to look like the advanced starter — contradicts V3.1 agentless principle.
- Renaming skills to drop `sf-` prefix for marketplace aesthetics.

## Technical Considerations

- Keep SF Salesforce domain depth; do not dilute with generic upstream content.
- Prefer **guidance-style** porting later (matches SF instruction-based culture).
- Preserve principle priority from [`PRINCIPLES.md`](../../PRINCIPLES.md) when ranking gaps.
- Converter/CLI changes should follow upstream’s “native install first” posture where feasible, without dropping SF’s existing Bun installer for users who rely on it.

## System-Wide Impact

- **Interaction graph:** Gaps doc informs future `/sf-compound`, `/sf-plan`, and CLI packaging work; does not change runtime until follow-on plans.
- **Error propagation:** Wrong remote sync could overwrite V3.1 with v2 tree — mitigated by explicit repo identity gate in Phase A.
- **State lifecycle:** Comparison clones are disposable; only gaps doc + optional empty docs dirs persist.
- **API surface parity:** Skill name mapping must cover slash commands, natural-language `description` routing, and converter outputs.
- **Integration test scenarios:**
  1. Fresh clone of SF remote matches `/workspace` HEAD after sync.
  2. Upstream tag checkout is reproducible.
  3. Gaps doc lists every `ce-*` skill with a mapped SF status.
  4. Historical CRITICAL gaps from March plan are marked closed or still-open with evidence paths.
  5. `docs/solutions/` and `docs/brainstorms/` exist after hygiene step.
  6. Cursor `plugin.json` path fields resolve; `mcp.json` or documented dual-ship present; validate script/lint passes.

## Acceptance Criteria

- [x] SF local tree verified/synced against `salesforce-compound-engineering-plugin` (SHA recorded).
- [x] EveryInc `compound-engineering-v3.21.0` (or newer) fetched and fingerprinted.
- [x] Fresh gaps document written with severity + status columns and closed-gap section.
- [x] Repo identity mismatch (`sf-` vs `salesforce-`) documented in the gaps doc.
- [x] `docs/solutions/` and `docs/brainstorms/` exist (scaffold OK).
- [x] March 2026 gap plan referenced as historical; not used as current inventory.
- [x] Top recommended port batch listed (≤10 items) with rationale.
- [x] Cursor Marketplace checklist completed against plugin-template + cursor/plugins examples (gaps documented; packaging fixes applied or explicitly deferred with owner).
- [x] `.cursor-plugin/plugin.json` declares skills/hooks (and logo when asset exists); `mcp.json` available for Cursor consumers.
- [x] Validation script or CLI lint covers Cursor single-plugin checklist.
- [x] Submission notes drafted (repo URL, plugin name, validate status, contact) for Cursor team / `kniparko@anysphere.com`.

## Success Metrics

- One gaps document that an implementer can execute without re-researching upstream.
- Zero ambiguity about which GitHub repo is the SF source of truth.
- Closed-gap accuracy: at least the March CRITICAL set reclassified with file evidence.

## Dependencies & Risks

| Risk | Mitigation |
| --- | --- |
| Mixing v2 `sf-compound-engineering-plugin` with V3.1 tree | Explicit Phase A identity gate |
| Upstream releases mid-work | Pin tag; note newer tags if present |
| Over-porting generic skills | Keepers list + intentional_sf status |
| Gaps doc becomes another stale plan | Date + version fingerprints; optional `status: active` frontmatter |

## Implementation Todos (execution order)

1. Verify/sync SF local from `salesforce-compound-engineering-plugin` and record fingerprint.
2. Fetch/pin EveryInc `compound-engineering-v3.21.0` into an isolated compare directory.
3. Generate skill/persona/manifest inventory diffs (`ce-*` ↔ `sf-*`).
4. Write fresh gaps document with severity, status, closed gaps, and recommended port batch.
5. Scaffold `docs/solutions/` and `docs/brainstorms/` if missing.
6. Mark historical March gap plan as superseded (frontmatter note or status) — edit only, do not delete.
7. Audit `.cursor-plugin/plugin.json` vs cursor/plugin-template + cursor/plugins examples; record Cursor readiness section.
8. Apply Cursor packaging fixes: logo asset, path fields, `mcp.json` dual-ship, category/tags, validation.
9. Draft Marketplace submission packet (do not email unless user asks).

## Sources & References

### Upstream

- https://github.com/EveryInc/compound-engineering-plugin
- https://github.com/EveryInc/compound-engineering-plugin/releases/tag/compound-engineering-v3.21.0
- https://every.to/guides/compound-engineering

### SF local / remotes

- https://github.com/divingsbysangam/salesforce-compound-engineering-plugin (workspace origin)
- https://github.com/divingsbysangam/sf-compound-engineering-plugin (legacy naming)
- Local: `/workspace` @ plan-time HEAD `1351206`, plugin `3.1.0-beta.5`

### Internal plans

- [`docs/plans/2026-03-02-feat-close-teardown-gaps-plan.md`](./2026-03-02-feat-close-teardown-gaps-plan.md) — historical 31-gap matrix (stale)
- [`docs/plans/2026-04-25-001-feat-v3-architecture-migration-plan.md`](./2026-04-25-001-feat-v3-architecture-migration-plan.md) — V3 migration
- [`docs/plans/2026-07-03-001-feat-superpowers-discipline-mechanisms-plan.md`](./2026-07-03-001-feat-superpowers-discipline-mechanisms-plan.md) — discipline protocols

### Local conventions

- [`CLAUDE.md`](../../CLAUDE.md) — agentless V3.1, protected docs dirs
- [`PRINCIPLES.md`](../../PRINCIPLES.md) — numbered principles for gap prioritization
- [`skills/index.md`](../../skills/index.md) — current skill catalog
- [`.cursor-plugin/plugin.json`](../../.cursor-plugin/plugin.json) — current Cursor manifest (partial vs examples)

### Cursor Marketplace

- https://github.com/cursor/plugin-template — single vs multi-plugin layout; submission checklist
- https://github.com/cursor/plugins — official example plugins and root marketplace.json pattern
- Example manifests: `continual-learning`, `cursor-team-kit`, `create-plugin`, `pstack` (path fields + logo + category/tags)
- Submit contact per template README: Cursor team Slack or `kniparko@anysphere.com`

## Preliminary gap snapshot (plan-time, to validate during execution)

Likely **open packaging/docs gaps**:

- Broader native harness manifests (Kimi/Grok/Devin/agy/OpenCode/Pi/Cline native dirs)
- Missing `docs/solutions/` and `docs/brainstorms/` trees
- CLI marketed as installer vs upstream native-first + converter-as-tooling
- Missing or incomplete ports: `handoff`, `babysit-pr`, and other ce-only utilities (confirm against inventory)
- **Cursor Marketplace:** missing `logo`/`assets/`, undeclared `skills`/`hooks` paths, no `mcp.json` (only `.mcp.json`), no `category`/`tags`, no validate script; single-plugin shape is otherwise correct

Likely **parity / SF-ahead**:

- Skills-first agentless architecture
- Parallel persona review model
- SF domain depth (governor/apex/flow/lwc/security/Agentforce/MCP)
- `PRINCIPLES.md`, `sf-deepen`, `sf-tend`, sandwich ideate/polish loop

Likely **closed since March 2026** (validate with paths):

- Parallel review dispatch, MCP, hooks, brainstorm/deepen/worktree/create-agent-skills, multi-platform converters baseline
