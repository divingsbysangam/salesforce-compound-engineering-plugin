---
name: agentforce-test
description: "Write, run, and analyze test suites for Agentforce agents — preview-based smoke tests, Testing Center batch suites, action execution, trace diagnosis, and iterative fix loops. Use when running sf agent test create / run / run-eval / results, writing AiEvaluationDefinition test specs, building regression suites, integrating Agentforce tests into CI/CD, or interpreting test failures. Trigger phrases: 'test my Agentforce agent', 'run a smoke test on this agent', 'build a test suite for', 'write an AiEvaluationDefinition', 'why is my agent test failing'. Do NOT trigger for first-time agent authoring (`agentforce-develop`), production STDM investigation (`agentforce-observe`), or Apex test classes (`apex-generate` / `sf-work`)."
argument-hint: "[org alias, authoring bundle name, test spec path, or 'smoke' | 'batch' | 'action' for mode]"
---

# <span data-proof="authored" data-by="ai:claude">/agentforce-test</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">2 (verifiability), 1 (preserve the quality ceiling), 3 (jagged intelligence). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use this skill</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use-this-skill.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Modes</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/modes.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 0: Plan the tests (always before running)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-0-plan-the-tests-always-before-running.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Mode A: Ad-hoc preview testing</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/mode-a-ad-hoc-preview-testing.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Mode B: Testing Center batch testing</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/mode-b-testing-center-batch-testing.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Safety verdict (mandatory after any run, Principle 1)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/safety-verdict-mandatory-after-any-run-principle-1.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Fix loop (max 3 iterations)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/fix-loop-max-3-iterations.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Action execution (Mode C)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/action-execution-mode-c.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Test file location convention</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/test-file-location-convention.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Capture learnings (Principle 7)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/capture-learnings-principle-7.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Test an Agentforce agent. Two modes: (A) ad-hoc smoke testing via sf agent preview with
--authoring-bundle for local trace files, used during authoring; (B) Testing Center batch
suites via sf agent test create + run + results, used for regression and CI/CD. Always
present the test plan to the user before running. Always include safety probes (Principle 1).
After a run, render an explicit safety verdict: SAFE / UNSAFE / NEEDS_REVIEW. Use the fix
loop (max 3 iterations) for diagnosed failures. Always pass --json on every sf CLI command.
Fail-closed: a run that was not executed is `test_run=unavailable: <reason>`, never an
implied pass. Safety verdict is still mandatory after any completed run.
```

## Cross-skill integration

| Need | Delegate to | Reason |
| --- | --- | --- |
| Agent does not exist / Spec not approved | `agentforce-develop` | Author first |
| Production-only failure, no local repro | `agentforce-observe` | Session traces |
| Apex unit tests | `apex-generate` | Not Agentforce evals |
| Capture a probe that should be standard | `sf-compound` | Institutional memory |