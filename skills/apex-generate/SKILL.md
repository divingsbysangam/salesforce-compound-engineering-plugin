---
name: apex-generate
description: "Generate Apex classes and tests with bulkification, CRUD/FLS, and the project's trigger framework wired in. Covers services, selectors, domain classes, batch / queueable / schedulable, invocable methods, REST resources, and the matching test classes with TestDataFactory + 251+ record bulk tests. Trigger phrases: 'create an Apex class', 'generate a service class', 'write a queueable for', 'scaffold a batch class', 'build an @InvocableMethod', 'add a REST resource', 'generate Apex tests for', 'cover this class with tests'. Pairs with `apex-patterns` (reference) and `test-factory` (TDF reference). Do NOT trigger for triggers themselves — use `apex-trigger-refactor` for trigger work."
argument-hint: "[class type, target object, business intent, or 'test for <ClassName>']"
---

# <span data-proof="authored" data-by="ai:claude">/apex-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 2 (verifiability), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Required inputs (gather or infer before authoring)** — read `references/required-inputs-gather-or-infer-before-authoring.md` before acting on this section.
- **Step 0: Pre-implementation research (parallel, Principle 7)** — read `references/step-0-pre-implementation-research-parallel-principle-7.md` before acting on this section.
- **Phase 1: Author the production class** — read `references/phase-1-author-the-production-class.md` before acting on this section.
- **Phase 2: Author the test class (mandatory, Principle 2)** — read `references/phase-2-author-the-test-class-mandatory-principle-2.md` before acting on this section.
- **Phase 3: Validate (mandatory before reporting, Principle 2)** — read `references/phase-3-validate-mandatory-before-reporting-principle-2.md` before acting on this section.
- **Phase 4: Report** — read `references/phase-4-report.md` before acting on this section.
- **Test-only mode (`apex-generate test for `)** — read `references/test-only-mode-apex-generate-test-for.md` before acting on this section.
- **Hand off to /sf-compound** — read `references/hand-off-to-sf-compound.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate production-grade Apex (class + .cls-meta.xml) AND its test class (Test.cls +
.cls-meta.xml) as one unit. Test generation is mandatory, not optional. Bulkify all SOQL
and DML out of loops. Enforce CRUD/FLS via Schema.* checks or USER_MODE. Declare an explicit
sharing keyword on every class. Test with 251+ records to cross the 200-trigger boundary.
Use TestDataFactory — never inline record creation in @TestSetup. Use Assert.* class only —
never legacy System.assertEquals. After generation, run sf code-analyzer and sf apex run
test; remediate sev0/sev1/sev2 violations and capture pass/fail + coverage in the report.
```
