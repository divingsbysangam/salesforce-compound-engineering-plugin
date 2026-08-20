# Step 2.5: Test-First (Red → Green → Refactor)

Read with `sf-work/SKILL.md`. Procedure lives here.

## Step 2.5: Test-First (Red → Green → Refactor)
**Iron Law: NO APEX / LWC / FLOW PRODUCTION LOGIC WITHOUT A FAILING TEST FIRST.**

* **RED** — write the `@isTest` method (or Jest spec) that asserts the not-yet-built behavior, then run it and confirm it fails for the expected reason: `sf apex run test --result-format human` (Apex) or `npm run test:unit` (LWC Jest). Paste the red failure.

* **GREEN** — write the minimal production code that makes the test pass. Nothing more.

* **REFACTOR** — simplify with the tests green.

**Forcing function:** production code written before its test is deleted and rewritten test-first — not "kept as reference." A draft written first bakes in whatever bulk-safety or sharing bug it has before any test can catch it.

**Scope:** production logic — Apex classes/triggers, LWC JS, Flow decision logic. Pure config/metadata with no behavioral change is exempt (record the reason), but Flow, validation-rule, and formula *behavior* changes still need before/after assertions, not just a deploy-succeeded check.

This precedes — it does not replace — the Step 4 System-Wide Test Check, which is a completeness gate, not a red/green loop.

***

