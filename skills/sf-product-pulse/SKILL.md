---
name: sf-product-pulse
description: "Generate a time-windowed pulse report for a Salesforce org — role-aware. Business lens (BA/consultant): requirements traceability against BRD/BFRD/FRD/SOW, adoption vs target personas, business-process friction, scope/change, stakeholder narrative. Technical lens (dev/admin): Apex exceptions, governor near-misses, test-coverage trend, deploy health, limits. Use when the user says 'run a pulse', 'how's adoption', 'requirements traceability', 'delivery status report', 'weekly recap', 'are users actually using this', or 'org health check'. Requires a connected org. Saves to docs/pulse-reports/."
argument-hint: "[window like '7d' / '30d' / 'sprint', optionally a mode: business | technical | full]"
allowed-tools:
 - Read
 - Write
 - Glob
 - Grep
 - Bash
 - AskUserQuestion
---

# /sf-product-pulse

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). `sf-business-analyst-pulse` is this skill's own persona at `references/personas/sf-business-analyst-pulse.md`; `sf-issue-intelligence-analyst`, when used, lives at `../sf-plan/references/personas/`.

> **Principles enforced:** especially 3 (stay in the loop — the pulse feeds human judgment, it doesn't act) and 7 (outsource thinking, not understanding — surface the numbers, the human decides). See `PRINCIPLES.md`.

Produce a compact, single-page pulse report for a Salesforce org over a time window, then surface the key points in chat and save the full report to `docs/pulse-reports/`. The skill is **read-only**: it queries the org via SOQL / Tooling API / metadata / `/limits` (through the salesforce-dx MCP or `sf` CLI) and reads requirements docs. It never deploys, mutates data, or changes metadata. **No PII in saved reports** (no user emails, names, account IDs, or record content).

This is the Salesforce-flavored, role-aware counterpart to the upstream product pulse: it serves both the BA/consultant (business outcomes) and the dev/admin (org health).

## Interaction Method

Use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options only when no blocking tool exists or the call errors. Never silently skip the question.

## Inputs

<args> #$ARGUMENTS </args>

Parse the argument for a **window** (`7d`, `30d`, `sprint`/current sprint, default `7d`) and an optional **mode** (`business`, `technical`, `full`).

## Phase 0: Require a connected org

This skill requires live org data. Verify an authenticated default org first (`sf org display --json`, or `get_username` / `list_all_orgs` via the salesforce-dx MCP).

* **No org / not authenticated** → stop and instruct: `sf org login web`, then `sf config set target-org <alias>`. Do not attempt a docs-only run; org telemetry is the point.

* **Org found** → announce which org (instance + alias) so the user can confirm it's the right one, then proceed.

## Phase 1: Resolve mode

If the mode wasn't given in the argument, choose:

* If requirements docs exist (under `docs/requirements/`, or files named like `*BRD*`, `*FRD*`, `*SOW*`) → default to **business** and say so.

* Else default to **technical**.

* If ambiguous, ask once (business / technical / full).

## Phase 2: Determine data tier

Probe what's available and degrade gracefully — report which tier ran:

* **Tier 1 (always):** SOQL + Tooling API + metadata + `/limits`. `LoginHistory`, Lightning Usage objects, `AsyncApexJob`, `ApexCodeCoverageAggregate`, validation/flow error signals where queryable.

* **Tier 2 (if Event Monitoring / Shield):** `EventLogFile` for deep usage, report exports, page performance, API usage.

Probe for `EventLogFile` access once; if absent, note "Event Monitoring not available — usage depth limited to Tier 1" in the report rather than failing.

## Phase 3: Gather

### Business lens (mode = business | full)

Dispatch `Task sf-business-analyst-pulse` with the requirements docs, target personas/profiles, and window. It returns the requirements-traceability matrix, adoption-vs-persona, friction, and scope/change. (Optionally also `Task sf-issue-intelligence-analyst` if an issue tracker is wired, for change-request context.)

### Technical lens (mode = technical | full)

Query directly (read-only, parallel where safe):

* **Errors:** Apex exceptions / unhandled errors over the window (via `EventLogFile` ApexUnexpectedException if Tier 2, else recent `AsyncApexJob` failures + debug-log signals).

* **Governor near-misses:** flag jobs/transactions approaching limits where observable.

* **Coverage trend:** org-wide and per-class from `ApexCodeCoverageAggregate`.

* **Deploy health:** recent deployments and pass/fail (Tooling API `DeployRequest` where available).

* **Limits:** `/limits` — daily API, async, storage headroom.

## Phase 4: Write the report

Target 30–40 lines on screen. Save the full report to `docs/pulse-reports/YYYY-MM-DD-pulse-{mode}.md`. Present numbers without hardcoded "good/bad" labels — let the reader judge (Principle 7). Structure:

```
# Pulse — {org alias} — {window} — {mode}

## Headline
{2-3 lines: the one thing the reader should know}

## Business (business | full)
- Requirements: {x delivered+adopted / y delivered+unused / z partial / w not started}
- Adoption: {persona → active vs target}
- Friction: {top 1-3 process pain points}
- Scope/change: {additions since baseline}

## Technical (technical | full)
- Errors: {count / top classes}
- Coverage: {org-wide %, classes below bar}
- Deploys: {n succeeded / m failed}
- Limits: {API %, storage %}

## Signals worth investigating
- {1-3 items — candidates for /sf-ideate next cycle}
```

## Phase 5: Compound the loop

Note in chat where the report was saved and that the "Signals worth investigating" are candidate inputs for `/sf-ideate` — closing the compound loop from observed reality back to what to build next.

## Config (optional)

Reads/writes pulse settings in `.compound-engineering/config.local.yaml` (gitignored, machine-local) when present: `pulse_window_default`, `pulse_target_profiles`, `pulse_requirements_path`. If `STRATEGY.md` exists, seed target personas and key metrics from it. The skill works without config — it just asks for what it needs.