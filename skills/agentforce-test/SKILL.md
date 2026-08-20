---
name: agentforce-test
description: "Write, run, and analyze test suites for Agentforce agents — preview-based smoke tests, Testing Center batch suites, action execution, trace diagnosis, and iterative fix loops. Use when running sf agent test create / run / run-eval / results, writing AiEvaluationDefinition test specs, building regression suites, integrating Agentforce tests into CI/CD, or interpreting test failures. Trigger phrases: 'test my Agentforce agent', 'run a smoke test on this agent', 'build a test suite for', 'write an AiEvaluationDefinition', 'why is my agent test failing'. Do NOT trigger for general Apex test class work — use sf-work / sf-review for that."
argument-hint: "[org alias, authoring bundle name, test spec path, or 'smoke' | 'batch' | 'action' for mode]"
---

# <span data-proof="authored" data-by="ai:claude">/agentforce-test</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">2 (verifiability), 1 (preserve the quality ceiling), 3 (jagged intelligence). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use this skill** — read `references/when-to-use-this-skill.md` before acting on this section.
- **Modes** — read `references/modes.md` before acting on this section.
- **Step 0: Plan the tests (always before running)** — read `references/step-0-plan-the-tests-always-before-running.md` before acting on this section.
- **Mode A: Ad-hoc preview testing** — read `references/mode-a-ad-hoc-preview-testing.md` before acting on this section.
- **Mode B: Testing Center batch testing** — read `references/mode-b-testing-center-batch-testing.md` before acting on this section.
- **Safety verdict (mandatory after any run, Principle 1)** — read `references/safety-verdict-mandatory-after-any-run-principle-1.md` before acting on this section.
- **Fix loop (max 3 iterations)** — read `references/fix-loop-max-3-iterations.md` before acting on this section.
- **Action execution (Mode C)** — read `references/action-execution-mode-c.md` before acting on this section.
- **Test file location convention** — read `references/test-file-location-convention.md` before acting on this section.
- **Capture learnings (Principle 7)** — read `references/capture-learnings-principle-7.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Test an Agentforce agent. Two modes: (A) ad-hoc smoke testing via sf agent preview with
--authoring-bundle for local trace files, used during authoring; (B) Testing Center batch
suites via sf agent test create + run + results, used for regression and CI/CD. Always
present the test plan to the user before running. Always include safety probes (Principle 1).
After a run, render an explicit safety verdict: SAFE / UNSAFE / NEEDS_REVIEW. Use the fix
loop (max 3 iterations) for diagnosed failures. Always pass --json on every sf CLI command.
```
