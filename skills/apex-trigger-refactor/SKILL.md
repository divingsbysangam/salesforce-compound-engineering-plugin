---
name: apex-trigger-refactor
description: "Modernize legacy Salesforce triggers — move SOQL/DML out of loops, separate concerns into a Trigger Handler / Trigger Actions Framework class, generate matching test coverage, and re-deploy. Use when you find a trigger with inline business logic, DML inside loops, no recursion guard, or no handler class. Trigger phrases: 'refactor this trigger', 'modernize this legacy trigger', 'fix this trigger to be bulk-safe', 'add a handler for', 'this trigger has DML in a loop', 'split this trigger into a handler', 'move logic out of trigger body'. Do NOT trigger for net-new service/selector/domain/async classes (`apex-generate`), Flow automation (`flow-generate`), or CLI deploy syntax (`sf-cli`)."
argument-hint: "[trigger name or path, e.g. OpportunityTrigger or force-app/main/default/triggers/OpportunityTrigger.trigger]"
---

# <span data-proof="authored" data-by="ai:claude">/apex-trigger-refactor</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 2 (verifiability), 3 (jagged intelligence — recursion / context edges), 5 (taste). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 0: Research (Principle 7)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-0-research-principle-7.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 1: Analyze the trigger</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-1-analyze-the-trigger.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 2: Choose the target pattern</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-2-choose-the-target-pattern.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 3: Refactor in phases (one anti-pattern at a time)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-3-refactor-in-phases-one-anti-pattern-at-a-time.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 4: Generate or update the test class (Principle 2)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-4-generate-or-update-the-test-class-principle-2.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 5: Validate (mandatory, Principle 2)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-5-validate-mandatory-principle-2.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 6: Report</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-6-report.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hand off</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hand-off.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Refactor a legacy Salesforce trigger into a Trigger Handler (or Trigger Actions Framework)
pattern. Move all SOQL and DML out of loops. Separate concerns by trigger context. Add
recursion guard. Generate matching tests with 251+ records that cross the trigger batch
boundary. Fail-closed validate: compile dry-run, sf code-analyzer, sf apex run test.
Paste actual tool output on Compile / Analyzer / Testing lines, or `<check>=unavailable:
<reason>` after attempting the fallback. Capture the before/after diff in the report.
```

## Cross-skill integration

| Need                                 | Delegate to     | Reason                                |
| ------------------------------------ | --------------- | ------------------------------------- |
| New Apex class with no trigger       | `apex-generate` | This skill owns trigger modernization |
| Trigger handler pattern lookup       | `apex-patterns` | Reference                             |
| TestDataFactory                      | `test-factory`  | Bulk test data                        |
| Record-triggered Flow instead        | `flow-generate` | Declarative alternative               |
| Deploy                               | `sf-cli`        | Fail-closed deploy                    |
| Capture an order-of-execution gotcha | `sf-compound`   | Institutional memory                  |