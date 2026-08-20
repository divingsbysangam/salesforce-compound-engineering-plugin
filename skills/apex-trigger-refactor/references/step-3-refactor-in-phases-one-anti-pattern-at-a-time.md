# Step 3: Refactor in phases (one anti-pattern at a time)

Read with `apex-trigger-refactor/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 3: Refactor in phases (one anti-pattern at a time)</span>
<span data-proof="authored" data-by="ai:claude">Phase the refactor so each commit is a small, testable improvement (Principle 5 — taste says one fix per commit, not a big-bang rewrite):</span>

1. **<span data-proof="authored" data-by="ai:claude">Move SOQL out of loops.</span>** <span data-proof="authored" data-by="ai:claude">Pre-fetch related records into a</span> <span data-proof="authored" data-by="ai:claude">`Map<Id, SObject>`. Verify behavior unchanged.</span>
2. **<span data-proof="authored" data-by="ai:claude">Move DML out of loops.</span>** <span data-proof="authored" data-by="ai:claude">Aggregate into a list, single DML at the end. Verify.</span>
3. **<span data-proof="authored" data-by="ai:claude">Split trigger body into handler.</span>** <span data-proof="authored" data-by="ai:claude">Trigger becomes a 1-line dispatch:</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTMzLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
trigger OpportunityTrigger on Opportunity (before insert, before update, after update) {
    new OpportunityTriggerHandler().run();
}
```

1. **<span data-proof="authored" data-by="ai:claude">Separate by context.</span>** <span data-proof="authored" data-by="ai:claude">Handler dispatches</span> <span data-proof="authored" data-by="ai:claude">`onBeforeInsert`,</span> <span data-proof="authored" data-by="ai:claude">`onBeforeUpdate`,</span> <span data-proof="authored" data-by="ai:claude">`onAfterUpdate`, etc.</span>
2. **<span data-proof="authored" data-by="ai:claude">Add recursion guard.</span>** <span data-proof="authored" data-by="ai:claude">Static</span> <span data-proof="authored" data-by="ai:claude">`Set<Id>`</span> <span data-proof="authored" data-by="ai:claude">of processed IDs OR framework-provided guard.</span>
3. **<span data-proof="authored" data-by="ai:claude">Validate sharing keyword.</span>** <span data-proof="authored" data-by="ai:claude">Default</span> <span data-proof="authored" data-by="ai:claude">`with sharing`</span> <span data-proof="authored" data-by="ai:claude">unless explicitly justified.</span>

<span data-proof="authored" data-by="ai:claude">After each phase, run the test suite. If a phase breaks tests,</span> **<span data-proof="authored" data-by="ai:claude">stop and diagnose</span>** <span data-proof="authored" data-by="ai:claude">— do not press forward layering more changes on top of broken behavior (Principle 3).</span>

***

