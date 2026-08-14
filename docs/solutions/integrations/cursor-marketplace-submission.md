---
title: Cursor Marketplace submission for Salesforce Compound Engineering
date: 2026-08-01
category: patterns
severity: medium
tags: ["cursor", "marketplace", "packaging", "distribution"]
status: active
---

# Cursor Marketplace submission

Maintainer runbook for listing **Salesforce Compound Engineering** (`sf-compound-engineering`) in the Cursor Marketplace.

This is a **one-time listing action** (plus occasional re-submit notes if Cursor asks for a SHA or metadata refresh). Day-to-day Cursor users can already install via the Bun CLI or by opening this repo; Marketplace listing makes discovery easier.

## Marketplace form fields (fill these)

| Field | Value |
| --- | --- |
| **Logotype URL** | `https://raw.githubusercontent.com/divingsbysangam/salesforce-compound-engineering-plugin/main/assets/logo.png` |
| **Description** | Salesforce-focused compound engineering for Cursor: skills for ideate → brainstorm → plan → deepen → work → review → polish → compound, with Apex, LWC, Flow, governor limits, security, and Agentforce depth. |
| **GitHub repository** | `https://github.com/divingsbysangam/salesforce-compound-engineering-plugin` |

Alternate logotype (SVG, same 1:1 plate):

`https://raw.githubusercontent.com/divingsbysangam/salesforce-compound-engineering-plugin/main/assets/logo.svg`

Logo assets in-repo: `assets/logo.png` (512×512 RGB, solid background plate) and `assets/logo.svg`. Manifest `.cursor-plugin/plugin.json` → `"logo": "assets/logo.png"`.

## Packaging shape (already done)

This repo uses Cursor’s **single-plugin** layout ([plugin-template](https://github.com/cursor/plugin-template)):

| Requirement | Location |
| --- | --- |
| Manifest | `.cursor-plugin/plugin.json` |
| Skills | `skills/` (declared as `"skills": "./skills/"`) |
| Hooks | `hooks/hooks.json` (declared as `"hooks": "./hooks/hooks.json"`) |
| MCP | root `mcp.json` (Cursor); `.mcp.json` remains Claude canonical — keep in sync |
| Logo | `assets/logo.svg` |
| Validate | `node scripts/validate-cursor-plugin.mjs` |

Do **not** add a root `.cursor-plugin/marketplace.json` unless this repo becomes a multi-plugin marketplace. Claude’s `.claude-plugin/marketplace.json` is unrelated.

Intentional omissions (V3.1 agentless): no `agents/`, `rules/`, or `commands/` directories.

## Pre-submit checklist

Run from repo root on the commit you will submit:

```bash
node scripts/validate-cursor-plugin.mjs
git rev-parse HEAD
git ls-remote https://github.com/divingsbysangam/salesforce-compound-engineering-plugin.git HEAD
```

Confirm:

- [x] `name` is unique kebab-case: `sf-compound-engineering`
- [x] `displayName`, `author`, `description`, `keywords`, `license`, `version` present
- [x] `logo` path resolves
- [x] `skills` / `hooks` paths resolve
- [x] `mcp.json` present
- [x] Skill `SKILL.md` files have `name` + `description` frontmatter
- [x] Public repo URL is correct
- [ ] Email (or Slack message) sent to Cursor — **your action** (paste packet below)

## Copy-paste submission email

**To:** `kniparko@anysphere.com`  
**Subject:** Cursor Marketplace submission — sf-compound-engineering

```text
Hi Cursor team,

I'd like to submit a plugin for the Cursor Marketplace.

Plugin name: sf-compound-engineering
Display name: Salesforce Compound Engineering
Version: 3.1.0-beta.6
Repository: https://github.com/divingsbysangam/salesforce-compound-engineering-plugin
Homepage: https://github.com/divingsbysangam/salesforce-compound-engineering-plugin
License: MIT
Category: developer-tools

One-liner:
Salesforce-focused compound engineering skills for Cursor (plan → work → review → compound) with Apex, LWC, Flow, and Agentforce depth.

Author:
Gella Sangamesh Gupta — https://github.com/divingsbysangam

Logo: `assets/logo.png`
Hooks/MCP: `hooks/hooks.json`, root `mcp.json`
Validate: `node scripts/validate-cursor-plugin.mjs`

Happy to adjust metadata, logo, or packaging if anything doesn't match your current Marketplace requirements.

Thanks,
Gella Sangamesh Gupta
```

Also acceptable per [plugin-template](https://github.com/cursor/plugin-template): Cursor team Slack instead of email.

## After Cursor accepts

1. Update the README **Cursor** section: replace “submission ready” with Marketplace install instructions Cursor provides (plugin id / browse path).
2. Set `status: shipped` (or add a dated note) in this file’s frontmatter / Related.
3. Optionally bump a stable (non-beta) version before asking Cursor to refresh a pinned listing, if they pin SHAs.

## Related

- Gaps audit: [`everyinc-v321-vs-sf-v31-gaps.md`](./everyinc-v321-vs-sf-v31-gaps.md)
- Template: https://github.com/cursor/plugin-template
- Examples: https://github.com/cursor/plugins
