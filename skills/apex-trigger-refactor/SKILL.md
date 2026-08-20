---
name: apex-trigger-refactor
description: "Modernize legacy Salesforce triggers — move SOQL/DML out of loops, separate concerns into a Trigger Handler / Trigger Actions Framework class, generate matching test coverage, and re-deploy. Use when you find a trigger with inline business logic, DML inside loops, no recursion guard, or no handler class. Trigger phrases: 'refactor this trigger', 'modernize this legacy trigger', 'fix this trigger to be bulk-safe', 'add a handler for', 'this trigger has DML in a loop', 'split this trigger into a handler', 'move logic out of trigger body'. Pairs with `apex-trigger-architect` agent."
argument-hint: "[trigger name or path, e.g. OpportunityTrigger or force-app/main/default/triggers/OpportunityTrigger.trigger]"
---

# <span data-proof="authored" data-by="ai:claude">/apex-trigger-refactor</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 2 (verifiability), 3 (jagged intelligence — recursion / context edges), 5 (taste). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **Step 0: Research (Principle 7)** — read `references/step-0-research-principle-7.md` before acting on this section.
- **Step 1: Analyze the trigger** — read `references/step-1-analyze-the-trigger.md` before acting on this section.
- **Step 2: Choose the target pattern** — read `references/step-2-choose-the-target-pattern.md` before acting on this section.
- **Step 3: Refactor in phases (one anti-pattern at a time)** — read `references/step-3-refactor-in-phases-one-anti-pattern-at-a-time.md` before acting on this section.
- **Step 4: Generate or update the test class (Principle 2)** — read `references/step-4-generate-or-update-the-test-class-principle-2.md` before acting on this section.
- **Step 5: Validate (mandatory, Principle 2)** — read `references/step-5-validate-mandatory-principle-2.md` before acting on this section.
- **Step 6: Report** — read `references/step-6-report.md` before acting on this section.
- **Hand off** — read `references/hand-off.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Refactor a legacy Salesforce trigger into a Trigger Handler (or Trigger Actions Framework)
pattern. Move all SOQL and DML out of loops. Separate concerns by trigger context. Add
recursion guard. Generate matching tests with 251+ records that cross the trigger batch
boundary. Validate with sf code-analyzer. Run sf apex run test before declaring done.
Capture the before/after diff in the report — Principle 5 demands taste, not just correctness.
```
