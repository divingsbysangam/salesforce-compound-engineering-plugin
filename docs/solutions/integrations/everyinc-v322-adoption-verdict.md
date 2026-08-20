---
title: "8KB skill layout and catalog completeness for SF Compound Engineering 3.1.0"
date: 2026-08-20
category: integration-issues
severity: medium
tags:
  - "skill-layout"
  - "progressive-disclosure"
  - "codex"
  - "catalog"
module: "Skill packaging and host size limits"
problem_type: tooling_decision
component: tooling
status: active
applies_when:
  - "A workflow SKILL.md is large enough that a host may truncate the always-loaded body"
  - "Choosing whether to overlay an external plugin tree onto this Salesforce catalog"
  - "Shipping a stable (non-beta) plugin version"
---

# 8KB skill layout and catalog completeness for SF Compound Engineering 3.1.0

## Context

This plugin is a skills-first Salesforce product (`sf-*` names, `PRINCIPLES.md`, Agentforce and generator skills). It is not an instruction pack and not a tracking fork of another compound-engineering tree. Some hosts have truncated large always-loaded skill bodies (observed around 8,000 bytes on Codex Agent Plugin sources).

## Guidance

Keep `PRINCIPLES.md` as the numbered source of truth. Keep Salesforce-only skills (`sf-deepen`, `sf-tend`, Agentforce, generators). Do not overlay an external plugin namespace onto this catalog.

1. **Progressive-disclosure `SKILL.md` layout.** Always-loaded skill bodies stay under 8KB. Procedure lives in sibling `references/` files under the same skill. This tree targets Codex (`.codex-plugin/plugin.json`) and does not ship Agent Plugins `$schema`.
2. **Harness-safe workflow skills.** UTF-8 `gh` output in `sf-babysit-pr`, worker fallback when a host has no skill-invocation primitive, `sf-debug mode:pipeline` for babysit, writable-checkout / no-checkout honesty in `sf-work`. Adapt any “ship despite security findings” wording to Principle 1: `sf-lfg` aborts on Critical/High security findings.
3. **Do not import** non-Salesforce host skills (Xcode, design-tool prototypes, RiffRec) unless this product actually uses them.

`sf-update` only checks **this** GitHub repo.

## Why This Matters

A second namespace would duplicate babysit/worktree/lfg and dilute Salesforce review personas. Oversized always-loaded skills fail silently on truncating hosts.

## When to Apply

- When editing a workflow `SKILL.md` that would exceed 8KB.
- When a host starts truncating skill bodies.
- Before treating an external plugin tree as something to merge.

**Before (wrong):** Overlay another plugin’s `ce-*` tree, keep `$schema`, call it an upgrade.

**After (right):** Split oversized `SKILL.md` files in this catalog; keep Salesforce names and never-merge babysit; bump this plugin to a stable version when the catalog is ready.

## Related

- [`skills/index.md`](../../../skills/index.md) — catalog map.
- README Credits — the only place this repo records that an external compound-engineering plugin was considered.
