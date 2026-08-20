---
title: "EveryInc v3.22.4 adoption verdict for SF Compound Engineering 3.1.0-beta.6"
date: 2026-08-20
category: integration-issues
severity: medium
tags:
  - "everyinc"
  - "compound-engineering"
  - "plugin-integration"
  - "adoption-verdict"
  - "progressive-disclosure"
  - "skill-layout"
  - "cherry-pick"
module: "EveryInc compound-engineering-plugin integration"
problem_type: tooling_decision
component: tooling
status: active
applies_when:
  - "Evaluating EveryInc compound-engineering-plugin releases for port into this Salesforce plugin"
  - "Choosing wholesale merge versus compare-only cherry-pick for upstream sync"
  - "Oversized workflow SKILL.md files need an 8KB progressive-disclosure layout"
  - "Deciding which EveryInc 3.22 capabilities to skip or defer"
---

# EveryInc v3.22.4 adoption verdict for SF Compound Engineering 3.1.0-beta.6

## Context

EveryInc shipped [`compound-engineering-v3.22.4`](https://github.com/EveryInc/compound-engineering-plugin/releases/tag/compound-engineering-v3.22.4) on 2026-08-18. This plugin’s last structured compare pin is EveryInc **3.21.0** (`docs/solutions/integrations/everyinc-v321-vs-sf-v31-gaps.md` fingerprint table). The incumbent here is `sf-compound-engineering` **3.1.0-beta.6** (`.claude-plugin/plugin.json`).

The 2026-07-31 sync plan already forbade a git merge: “Do **not** merge upstream into SF. This is compare-only.” (`docs/plans/2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md` Phase B step 4). Skill ports after that audit landed via [PR #4](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin/pull/4), not by overlaying Every’s tree.

A 2026-08-20 POV graded **Trial** for cherry-picking portable patterns and **Reject** for wholesale adoption. This doc is that decision, not a replacement gap matrix.

## Guidance

**Do not merge EveryInc `main` or retag this plugin as 3.22.** Keep `sf-*` names, `PRINCIPLES.md` as the numbered source of truth (`PRINCIPLES.md` opening; `CLAUDE.md` “Principles are the source of truth”), and Salesforce-only keepers (`sf-deepen`, `sf-tend`, Agentforce, generators). Every’s 3.22.4 tree ships 33 bundled skills (32 `ce-*` directories plus `lfg`); this catalog is 68 skills plus 61 personas (`CHANGELOG.md` Unreleased).

**Do compare-only, then cherry-pick**, in this order:

1. **8KB / progressive-disclosure `SKILL.md` layout.** Codex 0.147 truncated Agent Plugin skills at 8,000 bytes after Every added `$schema` (EveryInc [#1412](https://github.com/EveryInc/compound-engineering-plugin/issues/1412), [#1426](https://github.com/EveryInc/compound-engineering-plugin/pull/1426)). They removed `$schema` in 3.22.3. After 3.22.4, Every’s `main` moved oversized always-loaded skill bodies into sibling reference files (the size-driven sweep; [#1490](https://github.com/EveryInc/compound-engineering-plugin/pull/1490) completed the below-cap pass on skills that were already under 8KB). This tree already targets Codex (`.codex-plugin/plugin.json`) and does **not** ship that `$schema`. Several always-loaded skills still exceed 8KB. The first layout spike landed on this branch: `skills/sf-babysit-pr/SKILL.md` was 75,843 bytes and is now an orchestrator under 8KB, with procedure in `references/{envelope,setup,tick,settle,report}.md` (pre-existing `watch-loop.md` unchanged). Remaining oversized skills are a later slice. Every’s [#1426](https://github.com/EveryInc/compound-engineering-plugin/pull/1426) notes that if Codex applies the 8KB bound to all skill sources, dropping `$schema` stops helping — treat that as an upstream hypothesis, not current behavior in this tree. Port the *layout pattern* (procedure out of the always-loaded skill body into sibling reference files under that skill), not Every’s files.

2. **Backport bugfixes onto skills already ported from 3.21** (`sf-babysit-pr`, `sf-work`, `sf-sweep`, `sf-handoff`, `sf-debug`, `sf-commit-push-pr`). Adapt any “review-then-ship” wording to Principle 1: `sf-lfg` aborts on Critical/High security findings (`PRINCIPLES.md` principle 1).

3. **Skip:** Agent Plugins `$schema`; `ce-test-xcode`; `ce-riffrec-feedback-analysis` unless RiffRec is in use. **Defer** `ce-pov`, `ce-dogfood`, and `ce-promote` unless product need appears (3.21 gaps audit remaining/deferred). Also defer **`ce-prototype`**, which Every added in 3.22.0 and is not in that 3.21 deferred list. A workspace glob on 2026-08-20 found no `sf-pov` or `sf-prototype` skill directories (verified absence, not missing files to restore). Authoring already lives in `create-agent-skills`, not Every’s repo-local `ce-skill-work`.

`sf-update` only checks **this** GitHub repo (`skills/sf-update/SKILL.md` Salesforce Angle). Every releases will never surface through `/sf-update`.

## Why This Matters

Wholesale overlay would duplicate babysit/worktree/lfg under two namespaces, dilute Salesforce review personas, and can fight Principle 1. Staying frozen on 3.21 snapshots of already-ported skills leaves harness fixes (UTF-8, no-checkout hosts, Codex size) unapplied. The 8KB layout is insurance for Codex users of this plugin, not a reason to become a tracking fork of Every.

## When to Apply

- Before any “install Every 3.22” or `ce-*` → overwrite `sf-*` change.
- When refreshing the EveryInc gap matrix past the 3.21.0 pin.
- When editing a workflow `SKILL.md` that is already over 8KB.
- When Codex (or another host) starts truncating skill bodies.

Reversal: if Codex ships an 8KB cap for **all** plugins, treat the slimming pattern as Adopt (not Trial) for oversized `sf-*` skills. If Every ships a clearly Salesforce-workflow skill (not design/Xcode/RiffRec), re-open a named port — do not reopen wholesale merge.

## Examples

**Before (wrong):** Merge `EveryInc/compound-engineering-plugin` into this tree, rename nothing, keep Agent Plugins `$schema`, and call it an upgrade to 3.22.

**After (right):** Shallow-fetch tag `compound-engineering-v3.22.4` (and note `main` if the 8KB sweep is still untagged). Produce a compare-only matrix like the 3.21 audit. Spike `sf-babysit-pr` by splitting the 75,843-byte always-loaded `SKILL.md` until it is under the host cap (done on this branch: orchestrator + sibling reference files; Salesforce `sf-*` names and never-merge babysit contract kept). Cherry-pick equivalent bugfixes into existing `sf-*` skills. Leave Apex/LWC/Flow/Agentforce skills untouched.

Historical precedent of the right shape: [PR #3](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin/pull/3) (gaps audit at 3.21.0) then [PR #4](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin/pull/4) (six named skill ports).

## Related

- [`everyinc-v321-vs-sf-v31-gaps.md`](./everyinc-v321-vs-sf-v31-gaps.md) — inventory pin at EveryInc 3.21.0; still the matrix, not this verdict. Refresh that pin when the next compare-only audit runs.
- [`2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md`](../../plans/2026-07-31-001-feat-everyinc-gap-sync-and-gaps-doc-plan.md) — compare-only fetch rule.
- EveryInc [3.22.4](https://github.com/EveryInc/compound-engineering-plugin/releases/tag/compound-engineering-v3.22.4), [#1412](https://github.com/EveryInc/compound-engineering-plugin/issues/1412), [#1426](https://github.com/EveryInc/compound-engineering-plugin/pull/1426), [#1429](https://github.com/EveryInc/compound-engineering-plugin/pull/1429), [#1490](https://github.com/EveryInc/compound-engineering-plugin/pull/1490).
