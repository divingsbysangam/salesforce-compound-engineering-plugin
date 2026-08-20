# Step 5: Validate (mandatory, Principle 2)

Read with `apex-trigger-refactor/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 5: Validate (mandatory, Principle 2)</span>
```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzY2LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Static analysis on every changed file
sf code-analyzer run --target force-app/main/default/triggers/<TriggerName>.trigger,force-app/main/default/classes/<HandlerClassName>.cls,force-app/main/default/classes/<HandlerClassName>Test.cls --json

# Run the tests
sf apex run test --tests <HandlerClassName>Test --code-coverage --result-format human --synchronous --json
```

<span data-proof="authored" data-by="ai:claude">Remediate every sev0/sev1/sev2. Coverage target:</span> **<span data-proof="authored" data-by="ai:claude">90%+</span>** <span data-proof="authored" data-by="ai:claude">on the handler class.</span>

<span data-proof="authored" data-by="ai:claude">Dispatch</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-architect`</span> <span data-proof="authored" data-by="ai:claude">review agent for a pattern review.</span>

***

