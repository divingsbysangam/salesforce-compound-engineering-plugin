# Step 1: Design the agent and produce an Agent Spec

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 1: Design the agent and produce an Agent Spec</span>
<span data-proof="authored" data-by="ai:claude">The Agent Spec is the artifact. Write it before any code.</span>

<span data-proof="authored" data-by="ai:claude">The spec must include:</span>

* **<span data-proof="authored" data-by="ai:claude">Purpose</span>** <span data-proof="authored" data-by="ai:claude">— one paragraph stating what the agent does and what it explicitly does</span> *<span data-proof="authored" data-by="ai:claude">not</span>* <span data-proof="authored" data-by="ai:claude">do.</span>

* **<span data-proof="authored" data-by="ai:claude">Agent type</span>** <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`employee`</span> <span data-proof="authored" data-by="ai:claude">(internal user-facing) or</span> <span data-proof="authored" data-by="ai:claude">`service`</span> <span data-proof="authored" data-by="ai:claude">(external messaging-facing). Drives environment prerequisites.</span>

* **<span data-proof="authored" data-by="ai:claude">Subagents</span>** <span data-proof="authored" data-by="ai:claude">— one per coherent topic. Name, description (with routing keywords), and the actions each subagent calls.</span>

* **<span data-proof="authored" data-by="ai:claude">Actions</span>** <span data-proof="authored" data-by="ai:claude">— for each, mark</span> <span data-proof="authored" data-by="ai:claude">`EXISTS`</span> <span data-proof="authored" data-by="ai:claude">(with file path) or</span> <span data-proof="authored" data-by="ai:claude">`NEEDS STUB`</span> <span data-proof="authored" data-by="ai:claude">(with proposed Apex/Flow/Template name and signature). Don't generate stubs for actions that already exist somewhere in the package.</span>

* **<span data-proof="authored" data-by="ai:claude">Flow control</span>** <span data-proof="authored" data-by="ai:claude">— start agent, transitions between subagents, and any</span> <span data-proof="authored" data-by="ai:claude">`available when:`</span> <span data-proof="authored" data-by="ai:claude">guards.</span>

* **<span data-proof="authored" data-by="ai:claude">Variables</span>** <span data-proof="authored" data-by="ai:claude">— names, types, scope, and which subagents read/write them.</span>

* **<span data-proof="authored" data-by="ai:claude">Verification Strategy (Principle 2)</span>** <span data-proof="authored" data-by="ai:claude">— what utterances will prove this agent works? Name at least one routing test, one happy-path action invocation test, one guardrail test (off-topic), and one safety probe.</span>

**<span data-proof="authored" data-by="ai:claude">STOP. Save the spec to</span>** **<span data-proof="authored" data-by="ai:claude">`docs/plans/YYYY-MM-DD-feat-<agent-slug>-spec.md`. Present to the user. Do not proceed without explicit approval.</span>**

***

