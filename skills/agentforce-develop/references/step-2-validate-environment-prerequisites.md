# Step 2: Validate environment prerequisites

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 2: Validate environment prerequisites</span>
<span data-proof="authored" data-by="ai:claude">Pick the right path based on agent type:</span>

* **<span data-proof="authored" data-by="ai:claude">Employee agent</span>** <span data-proof="authored" data-by="ai:claude">— verify the</span> <span data-proof="authored" data-by="ai:claude">`config:`</span> <span data-proof="authored" data-by="ai:claude">block does NOT include</span> <span data-proof="authored" data-by="ai:claude">`default_agent_user`,</span> <span data-proof="authored" data-by="ai:claude">`connection messaging:`, or</span> <span data-proof="authored" data-by="ai:claude">`MessagingSession`-linked variables. Remove if present.</span>

* **<span data-proof="authored" data-by="ai:claude">Service agent</span>** <span data-proof="authored" data-by="ai:claude">— query the org for an Einstein Agent User. If none exists, walk the user through creating one before code generation.</span>

<span data-proof="authored" data-by="ai:claude">Do not generate the authoring bundle until environment is validated.</span>

***

