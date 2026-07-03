---
name: sf-review
description: "Review Salesforce code for quality, governor limits, bulkification, security (CRUD/FLS/SOQL injection), sharing model, performance, and platform best practices using parallel agent dispatch. Use when the user says 'review this Apex', 'review this LWC', 'review this Flow', 'check this trigger', 'audit this SOQL', 'security review', or wants multi-persona review of a PR or local diff. Supports fast, thorough, and comprehensive depth levels."
argument-hint: "[optional: file path, directory, PR number; defaults to uncommitted changes; pass 'fast'/'thorough'/'comprehensive' for depth]"
---

# /sf-review

> **Principles enforced:** 1 (preserve the quality ceiling), 3 (jagged intelligence), 5 (taste and oversight). See `PRINCIPLES.md`.

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

<span data-proof="authored" data-by="ai:claude">If no target specified, review uncommitted changes (`git diff`).</span>

***

## <span data-proof="authored" data-by="ai:claude">Non-Negotiable Gates (Principle 1)</span>

<span data-proof="authored" data-by="ai:claude">The following findings are</span> **<span data-proof="authored" data-by="ai:claude">abort triggers</span>**<span data-proof="authored" data-by="ai:claude">, not warnings. They block the review from passing regardless of how minor the surrounding diff is. They exist because vibe coding does not exempt the diff from production-grade Salesforce constraints.</span>

| <span data-proof="authored" data-by="ai:claude">Gate</span>                    | <span data-proof="authored" data-by="ai:claude">What it catches</span>                                                                                                                                                 | <span data-proof="authored" data-by="ai:claude">Owning agent</span>                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<span data-proof="authored" data-by="ai:claude">Security regression</span>** | <span data-proof="authored" data-by="ai:claude">CRUD/FLS bypass, SOQL injection, sharing-model violation, hardcoded credential, unsafe</span> <span data-proof="authored" data-by="ai:claude">`without sharing`</span> | <span data-proof="authored" data-by="ai:claude">`apex-security-sentinel`,</span> <span data-proof="authored" data-by="ai:claude">`lwc-security-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`integration-security-sentinel`</span> |
| **<span data-proof="authored" data-by="ai:claude">Governor regression</span>** | <span data-proof="authored" data-by="ai:claude">SOQL/DML inside loops, missing bulkification, non-selective query on >100k-row object</span>                                                                           | <span data-proof="authored" data-by="ai:claude">`apex-governor-guardian`,</span> <span data-proof="authored" data-by="ai:claude">`apex-bulkification-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`flow-governor-monitor`</span>   |
| **Test coverage regression**                                                   | Production class without test class, test class with no `assertEquals`/`assertTrue`, bulk path untested at 200+ records                                                                                                | `apex-test-coverage-analyst`                                                                                                                                                                                                                            |
| **Trigger context regression**                                                 | Recursion guard missing, mixed-DML violation, handler bypassing the project's trigger framework                                                                                                                        | `apex-trigger-architect`                                                                                                                                                                                                                                |
| **Sharing regression**                                                         | <span data-proof="authored" data-by="ai:claude">`without sharing`</span> <span data-proof="authored" data-by="ai:claude">introduced without justification, sharing-recalculation skipped on owner change</span>        | <span data-proof="authored" data-by="ai:claude">`sharing-security-analyst`</span> <span data-proof="authored" data-by="ai:claude">(when present)</span>                                                                                                 |

<span data-proof="authored" data-by="ai:claude">If any gate fires, the review output must include the gate name in the Critical section, and</span> <span data-proof="authored" data-by="ai:claude">`/sf-lfg`</span> <span data-proof="authored" data-by="ai:claude">must abort the pipeline. Do not route gate findings to "warnings."</span>

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

## <span data-proof="authored" data-by="ai:claude">Review Depth Levels</span>

<span data-proof="authored" data-by="ai:claude">Select depth based on</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.depth`</span> <span data-proof="authored" data-by="ai:claude">(default: thorough):</span>

| <span data-proof="authored" data-by="ai:claude">Level</span>             | <span data-proof="authored" data-by="ai:claude">Agents</span>                                   | <span data-proof="authored" data-by="ai:claude">Use Case</span>                    |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **<span data-proof="authored" data-by="ai:claude">fast</span>**          | <span data-proof="authored" data-by="ai:claude">Stack-specific agents only</span>               | <span data-proof="authored" data-by="ai:claude">Quick checks, small changes</span> |
| **<span data-proof="authored" data-by="ai:claude">thorough</span>**      | <span data-proof="authored" data-by="ai:claude">All applicable agents</span>                    | <span data-proof="authored" data-by="ai:claude">Standard review (default)</span>   |
| **<span data-proof="authored" data-by="ai:claude">comprehensive</span>** | <span data-proof="authored" data-by="ai:claude">All + research + deployment verification</span> | Pre-production, risky changes                                                      |

***

## Step 1: Identify and Classify Files

1. Get files in scope (git diff, directory listing, or PR files).
2. Classify each file by type:

   * `.cls`, `.trigger` → APEX

   * `.flow-meta.xml` → AUTOMATION

   * `.js`, `.html` (in `lwc/`) → LWC

   * `.xml` (metadata) → ARCHITECTURE

   * Callout/API related → INTEGRATION

***

## Step 2: Dispatch Review Personas in Parallel

Review personas live in `skills/sf-review/references/personas/<name>.md` as **prompt assets — not registered agents**. Dispatch each applicable persona as an **isolated subagent**: use the Task tool with a general-purpose subagent and pass the persona file's contents as its instructions, along with the files and code context. On Claude Code these run in parallel with isolated context — that isolation is the whole point of splitting them. On harnesses without a subagent primitive, apply each persona's prompt **inline, one after another**, against the matching files.

Based on file classification, dispatch applicable personas (each `Task <name>` below = the persona at `references/personas/<name>.md`):

### For APEX files — dispatch in parallel:

* Task apex-governor-guardian(files, code\_context)

* Task apex-security-sentinel(files, code\_context)

* Task apex-bulkification-reviewer(files, code\_context)

* Task apex-trigger-architect(files, code\_context) — if triggers present

* Task apex-exception-handler(files, code\_context)

* Task apex-test-coverage-analyst(files, code\_context) — if test classes present

### For AUTOMATION files — dispatch in parallel:

* Task flow-governor-monitor(files, code\_context)

* Task flow-complexity-analyzer(files, code\_context)

* Task process-automation-strategist(files, code\_context)

* Task validation-rule-reviewer(files, code\_context) — if validation rules

### For LWC files — dispatch in parallel:

* Task lwc-architecture-strategist(files, code\_context)

* Task lwc-performance-oracle(files, code\_context)

* Task lwc-security-reviewer(files, code\_context)

* Task lwc-accessibility-guardian(files, code\_context)

### For INTEGRATION files — dispatch in parallel:

* Task rest-api-architect(files, code\_context)

* Task callout-pattern-reviewer(files, code\_context)

* Task integration-security-sentinel(files, code\_context)

### Always include (ARCHITECTURE — universal):

* Task pattern-recognition-specialist(files, code\_context)

* Task metadata-consistency-checker(files, code\_context)

### Additional agents for "comprehensive" depth:

* Task sf-code-simplicity-reviewer(files, code\_context)

* Task sf-deployment-verification-agent(files, code\_context)

* Task sf-git-history-analyzer(files, code\_context)

***

## Step 3: Parallel Research (comprehensive depth only)

For comprehensive reviews, also dispatch:

* Task sf-best-practices-researcher(feature\_context)

* Task sf-framework-docs-researcher(feature\_context)

Validate findings against official docs:

* `site:developer.salesforce.com`

* `site:salesforce.stackexchange.com`

***

## Step 4: Consolidate Findings

Collect results from all dispatched agents and:

1. Deduplicate findings across agents using the merge/dedup rule in `references/subagent-confidence-rubric.md` (same `file:line` + same root cause → merge; conflicting severity → take the higher).
2. Attach a confidence tier (High / Medium / Low) to every finding per the tiers in `references/subagent-confidence-rubric.md`; a finding confirmed by a second agent upgrades to High.
3. Categorize by severity: Critical, High, Medium, Low.
4. Group by file for easy navigation.
5. Include fix suggestions with code references.

***

## Output Format

```
## Review: {target}
**Depth:** {fast|thorough|comprehensive}
**Agents dispatched:** {count}

### Critical ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### High ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Medium ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Low ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Summary
{overall assessment}

Next: Fix issues and run /sf-review again
```