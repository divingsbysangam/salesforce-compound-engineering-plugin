# <span data-proof="authored" data-by="ai:claude">Step 6: Report</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-refactor/SKILL.md`. Procedure lives here.</span>

## <span data-proof="authored" data-by="ai:claude">Step 6: Report</span>

```
Refactor: <TriggerName>

Anti-patterns identified (Step 1):
- {n} DML-in-loop occurrences (lines …)
- {n} SOQL-in-loop occurrences (lines …)
- {n} mixed-context blocks
- recursion guard: {present|missing}
- handler delegation: {present|missing}

Phases applied:
1. SOQL hoist:        OK
2. DML hoist:         OK
3. Handler extract:   OK (created <HandlerClassName>)
4. Context split:     OK (onBeforeInsert, onAfterUpdate, ...)
5. Recursion guard:   OK
6. Sharing audit:     OK ({with|without} sharing — {justified|default})

Files changed:
- triggers/<TriggerName>.trigger    (legacy logic removed; now 1-line dispatch)
- classes/<HandlerClassName>.cls    (new)
- classes/<HandlerClassName>.cls-meta.xml (new)
- classes/<HandlerClassName>Test.cls (new or extended)

Compile:  {dry-run deploy JSON summary} or "unavailable: <reason>"
Analyzer: {sev0=0, sev1=0, sev2=0} or "unavailable: <reason>"
Testing:  {pass=N, fail=0, coverage=NN%} or "unavailable: <reason>"
Review:   apex-trigger-architect — {findings count}

Before/After diff: {one paragraph summary of the most important behavioral guarantees preserved}
```

***