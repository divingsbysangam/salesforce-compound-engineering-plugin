---
name: sf-review
tier: discipline-gate
description: "Review Salesforce code for quality, governor limits, bulkification, security (CRUD/FLS/SOQL injection), sharing model, performance, and platform best practices using parallel agent dispatch. Use when the user says 'review this Apex', 'review this LWC', 'review this Flow', 'check this trigger', 'audit this SOQL', 'security review', or wants multi-persona review of a PR or local diff. Supports fast, thorough, and comprehensive depth levels."
argument-hint: "[optional: file path, directory, PR number; defaults to uncommitted changes; pass 'fast'/'thorough'/'comprehensive' for depth]"
---

# /sf-review

> **Principles enforced:** 1 (preserve the quality ceiling), 3 (jagged intelligence), 5 (taste and oversight). See `PRINCIPLES.md`.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Review Depth Levels** — read `references/review-depth-levels.md` before acting on this section.
- **Step 1: Identify and Classify Files** — read `references/step-1-identify-and-classify-files.md` before acting on this section.
- **Step 2: Dispatch Review Personas in Parallel** — read `references/step-2-dispatch-review-personas-in-parallel.md` before acting on this section.
- **Step 3: Parallel Research (comprehensive depth only)** — read `references/step-3-parallel-research-comprehensive-depth-only.md` before acting on this section.
- **Step 4: Consolidate Findings** — read `references/step-4-consolidate-findings.md` before acting on this section.
- **Output Format** — read `references/output-format.md` before acting on this section.

## Copy-paste-to-agent

```
Review Salesforce code by dispatching parallel review agents based on file type
(Apex / LWC / Flow / Integration / Architecture). Output findings categorized as
Critical / High / Medium / Low. Critical and High findings are non-negotiable
abort triggers — see "Non-Negotiable Gates" below. If the target isn't specified,
review the current git diff.
```

You are reviewing Salesforce code using parallel agent dispatch for speed and thoroughness.

## Goal

Review the code at: `$ARGUMENTS.target`

If no target specified, review uncommitted changes (`git diff`).

***

## Non-Negotiable Gates (Principle 1)

The following findings are **abort triggers**, not warnings. They block the review from passing regardless of how minor the surrounding diff is. They exist because vibe coding does not exempt the diff from production-grade Salesforce constraints.

| Gate                    | What it catches                                                                                                                                                 | Owning agent                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security regression** | CRUD/FLS bypass, SOQL injection, sharing-model violation, hardcoded credential, unsafe `without sharing` | `apex-security-sentinel`, `lwc-security-reviewer`, `integration-security-sentinel` |
| **Governor regression** | SOQL/DML inside loops, missing bulkification, non-selective query on >100k-row object                                                                           | `apex-governor-guardian`, `apex-bulkification-reviewer`, `flow-governor-monitor`   |
| **Test coverage regression**                                                   | Production class without test class, test class with no `assertEquals`/`assertTrue`, bulk path untested at 200+ records                                                                                                | `apex-test-coverage-analyst`                                                                                                                                                                                                                            |
| **Trigger context regression**                                                 | Recursion guard missing, mixed-DML violation, handler bypassing the project's trigger framework                                                                                                                        | `apex-trigger-architect`                                                                                                                                                                                                                                |
| **Sharing regression**                                                         | `without sharing` introduced without justification, sharing-recalculation skipped on owner change        | `sharing-security-analyst` (when present)                                                                                                 |

If any gate fires, the review output must include the gate name in the Critical section, and `/sf-lfg` must abort the pipeline. Do not route gate findings to "warnings."

**Clearing a gate requires evidence, not a self-report.** A gate is only cleared when the review output cites the proof — the pasted `sf apex run test --result-format human` coverage output, the specific `file:line` and the check that passed, or the `Limits.get*()` calculation — not "looks fine" or "no issues found." A gate marked clear without its underlying evidence is treated as unverified, and the finding stays open.

### Rationalizations (Excuse → Reality)

_Pressure-test-pending hypotheses (see `docs/pressure-tests/`): guidance to pre-empt the excuses used to wave a gate through under deadline, not yet independently validated._

| Excuse | Reality |
| --- | --- |
| "This trigger only ever gets one record from the UI." | Data Loader, the REST/Bulk API, and Flow-triggered DML all pass collections on day one — and the org cannot stop them. Bulk safety is not optional. |
| "Governor limits don't matter in a scratch org, it's just for testing." | Scratch-org and sandbox limits mirror production Enterprise Edition. There is no test-only exemption. |
| "We'll fix sharing after it ships — it's admin-only for now." | Profile/permission-set assignment is a config change an admin makes without redeploying code. `without sharing` does not auto-correct when the audience widens. |
| "Coverage is at 75%, we're good." | 75% is a deploy gate, not a behavior check. Coverage counts lines executed, not assertions made — a test with no asserts hits coverage and proves nothing. |
| "It's just a config/Flow change, there's no code to review." | Flow, validation-rule, and formula changes still change behavior and can bypass CRUD/FLS or sharing. They get the same gate scrutiny as Apex. |

***

