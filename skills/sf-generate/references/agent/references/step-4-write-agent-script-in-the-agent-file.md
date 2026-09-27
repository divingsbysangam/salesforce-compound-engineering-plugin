# Step 4: Write Agent Script in the `.agent` file

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 4: Write Agent Script in the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file</span>
<span data-proof="authored" data-by="ai:claude">Edit the generated</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file. Agent Script syntax in one paragraph:</span>

* <span data-proof="authored" data-by="ai:claude">`->`</span> <span data-proof="authored" data-by="ai:claude">introduces a</span> **<span data-proof="authored" data-by="ai:claude">logic instruction</span>** <span data-proof="authored" data-by="ai:claude">— deterministic execution, business rules, variable assignment, conditionals.</span>

* <span data-proof="authored" data-by="ai:claude">`|`</span> <span data-proof="authored" data-by="ai:claude">introduces a</span> **<span data-proof="authored" data-by="ai:claude">prompt instruction</span>** <span data-proof="authored" data-by="ai:claude">— natural-language text sent to the LLM.</span>

* <span data-proof="authored" data-by="ai:claude">Indentation is whitespace-significant. Pick tabs OR spaces; do not mix.</span>

* <span data-proof="authored" data-by="ai:claude">Variable interpolation:</span> <span data-proof="authored" data-by="ai:claude">`{!@variables.name}`.</span>

* <span data-proof="authored" data-by="ai:claude">Comments:</span> <span data-proof="authored" data-by="ai:claude">`# this is a comment`.</span>

**<span data-proof="authored" data-by="ai:claude">Anti-patterns to avoid (Principle 5 — taste):</span>**

* <span data-proof="authored" data-by="ai:claude">Mixing personality and routing in</span> <span data-proof="authored" data-by="ai:claude">`start_agent`. Persona belongs in</span> <span data-proof="authored" data-by="ai:claude">`system: instructions:`</span> <span data-proof="authored" data-by="ai:claude">only;</span> <span data-proof="authored" data-by="ai:claude">`start_agent`</span> <span data-proof="authored" data-by="ai:claude">is a router.</span>

* <span data-proof="authored" data-by="ai:claude">Identical</span> <span data-proof="authored" data-by="ai:claude">`instructions:`</span> <span data-proof="authored" data-by="ai:claude">text across subagents. Each subagent's instructions must be distinct enough to drive routing.</span>

* <span data-proof="authored" data-by="ai:claude">"Dead hub" subagents — defined but never reached from any transition.</span>

* <span data-proof="authored" data-by="ai:claude">Orphan actions — listed in</span> <span data-proof="authored" data-by="ai:claude">`subagent: actions:`</span> <span data-proof="authored" data-by="ai:claude">Level 1 but never invoked from Level 2</span> <span data-proof="authored" data-by="ai:claude">`reasoning: actions:`.</span>

<span data-proof="authored" data-by="ai:claude">Agent Script is NOT JavaScript, AppleScript, or Python. Do not let LLM training-set pattern-matching pull syntax from those languages.</span>

***

