---
name: lightning-page-generate
description: "Generate Salesforce Lightning pages — FlexiPages (RecordPage / AppPage / HomePage) and entire Lightning apps that orchestrate object + fields + tabs + flexipage + permission set. Use when creating Lightning record pages, app home pages, or building a complete LEX app from a description. Trigger phrases: 'create a Lightning record page', 'build a Lightning page', 'add a flexipage', 'generate a record page for', 'build a Lightning app', 'create a complete LEX app', 'I need a project management app', 'generate a flexipage with', 'add components to the record page'. Pairs with `metadata-consistency-checker`."
argument-hint: "[--type page|app + page intent OR app intent, e.g. '--type page record-page for Account' or '--type app project-management app with Tasks Resources Supplies']"
---

# /lightning-page-generate

> **Principles enforced:** 1 (preserve the quality ceiling), 4 (spec is the artifact), 7 (institutional memory). See `PRINCIPLES.md`.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **Mode: `--type page` — single FlexiPage** — read `references/mode-type-page-single-flexipage.md` before acting on this section.
- **Mode: `--type app` — complete Lightning app** — read `references/mode-type-app-complete-lightning-app.md` before acting on this section.
- **Forbidden shortcuts (Principle 1)** — read `references/forbidden-shortcuts-principle-1.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## Copy-paste-to-agent

```
Generate a Lightning page (FlexiPage) OR a complete Lightning app. Two modes:
(--type page) — single FlexiPage. ALWAYS bootstrap with `sf template generate flexipage`
first; never write FlexiPage XML from scratch (region IDs and component configs are too
fragile to hand-author). Then add components.
(--type app) — full LEX app. Orchestrate metadata in dependency order: object → fields →
tab → flexipage → custom application → list view → validation rule → permission set.
Dispatch /metadata-generate for each piece. End with /permission-set-generate to grant
access. Always include a Verification Strategy: how does a user actually exercise this app.
```
