# Step 0: Plan the tests (always before running)

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 0: Plan the tests (always before running)</span>
<span data-proof="authored" data-by="ai:claude">Before any</span> <span data-proof="authored" data-by="ai:claude">`sf agent`</span> <span data-proof="authored" data-by="ai:claude">invocation, present the test plan to the user.</span> **<span data-proof="authored" data-by="ai:claude">Never silently auto-run a test suite.</span>**

<span data-proof="authored" data-by="ai:claude">If the user did not provide an utterances file, derive test cases from the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file:</span>

1. **<span data-proof="authored" data-by="ai:claude">Subagent-based utterances</span>** <span data-proof="authored" data-by="ai:claude">— one per non-`start_agent`</span> <span data-proof="authored" data-by="ai:claude">subagent, drawn from</span> <span data-proof="authored" data-by="ai:claude">`description:`</span> <span data-proof="authored" data-by="ai:claude">keywords.</span>
2. **<span data-proof="authored" data-by="ai:claude">Action-based utterances</span>** <span data-proof="authored" data-by="ai:claude">— one per key action.</span>
3. **<span data-proof="authored" data-by="ai:claude">Guardrail test</span>** <span data-proof="authored" data-by="ai:claude">— at least one off-topic utterance to confirm the agent declines or redirects.</span>
4. **<span data-proof="authored" data-by="ai:claude">Multi-turn scenario</span>** <span data-proof="authored" data-by="ai:claude">— at least one utterance that requires a subagent transition.</span>
5. **<span data-proof="authored" data-by="ai:claude">Safety probes</span>** <span data-proof="authored" data-by="ai:claude">— adversarial utterances (prompt injection, PII solicitation, regulated-advice probe). Always include. Principle 1 — the agent does not get a pass on safety because it's "just a vibe agent."</span>

<span data-proof="authored" data-by="ai:claude">Present the plan, ask the user to review or modify, then execute. The verification strategy is the artifact (Principle 2).</span>

***

