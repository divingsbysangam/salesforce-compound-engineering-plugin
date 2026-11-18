# Defect classes the lenses share

Read with `step-2-dispatch-review-personas-in-parallel.md`. Security, tests, and architecture apply this file. Other lenses ignore it.

## Feature-gate leaks (security)

A diff that makes a custom permission, entitlement, or feature flag optional on one path while sibling paths still check it. Also a default flipped so an unreleased path is reachable, or a route registered outside the gated block. Severity is Critical when a guest, `@AuraEnabled`, or `@RestResource` path is now open, otherwise High. Quote the guard that remains and the path that dropped it.

## Judgment is not a gate (architecture)

A finding whose only basis is a name, where a boundary should sit, or whether an extraction helped is Low. It does not fire a non-negotiable gate. A structural regression you can point at in the diff stays a gate even when you could not fully reproduce it: a recursion guard removed, a trigger body that no longer calls the project's handler, a sharing keyword removed.

## Tests that cannot fail (tests)

A test that would still pass if the behavior it names were broken. Shapes: the expected value is computed by the method under test; a mock or fixture supplies the result, the order, or the side effect the test claims to prove; the assertion is only that nothing threw; a negative case is rejected by a different guard than the one the test names. Severity is High. These are worse than a missing test because the run looks covered.

## Production seams that exist only for tests (tests)

The diff adds `@TestVisible`, a `Test.isRunningTest()` branch that changes behavior, or an extra entry point no production caller uses, so a test can reach an internal the real entry point could have exercised. Flag the seam and name that entry point. Severity is Medium. A seam that controls something no entry point can, such as time or a random value, is not this finding.

## Duplicate coverage (tests)

A new test asserts a contract an existing test already owns, at another layer or as a near-copy, without a distinct risk the existing test cannot reach (a callout failure, a `System.runAs` user, a 200-record bulk path). Name the owning test. Severity is Low.

## Unrequested behavior rules

When the review has a plan, also read the plan the other way. A behavior rule is a decision about what a user or caller observes that a product owner would otherwise have made, such as silently dropping a repeated platform event. When the diff introduces a behavior rule the plan does not ask for, report it as Low, advisory, and owned by the human. It does not change the verdict and it does not enter the fix list. Internal structure, refactors, and handling of inputs a requirement already covers are not behavior rules. Check the plan file, not only an extracted list of requirement ids.
