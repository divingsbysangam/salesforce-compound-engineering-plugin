# Step 2: Dispatch Review Personas in Parallel

Read with `sf-review/SKILL.md`. Procedure lives here.

## Step 2: Dispatch Review Personas in Parallel
Review personas live in `skills/sf-review/references/personas/<name>.md` as **prompt assets — not registered agents** — this skill owns them. Dispatch them as isolated subagents per the `dispatching-parallel-personas` skill (isolated subagents, same-response parallelism, same-file-conflict check); pass each persona file's contents plus the files and code context. Review personas are read-only, so dispatch every applicable one in the same message.

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

