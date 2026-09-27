# Step 4: Generate or update the test class (Principle 2)

Read with `apex-trigger-refactor/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 4: Generate or update the test class (Principle 2)</span>
<span data-proof="authored" data-by="ai:claude">Tests are not optional. After refactor:</span>

* <span data-proof="authored" data-by="ai:claude">Test class targets the</span> **<span data-proof="authored" data-by="ai:claude">handler class</span>**<span data-proof="authored" data-by="ai:claude">, not the trigger directly. Triggers remain a 1-line dispatch.</span>

* **<span data-proof="authored" data-by="ai:claude">251+ records</span>** <span data-proof="authored" data-by="ai:claude">in</span> <span data-proof="authored" data-by="ai:claude">`@TestSetup`</span> <span data-proof="authored" data-by="ai:claude">to cross the 200-record trigger batch boundary.</span>

* <span data-proof="authored" data-by="ai:claude">Cover every refactored context: insert path, update path with stage change, update path without stage change, delete path, etc.</span>

* <span data-proof="authored" data-by="ai:claude">For each anti-pattern that was fixed, add a test that would have</span> **<span data-proof="authored" data-by="ai:claude">caught</span>** <span data-proof="authored" data-by="ai:claude">the original bug (e.g., a 251-record bulk insert test that would have hit the SOQL-101 limit on the legacy trigger).</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`/apex-generate test for <HandlerClassName>`</span> <span data-proof="authored" data-by="ai:claude">if you need help authoring the test class.</span>

***

