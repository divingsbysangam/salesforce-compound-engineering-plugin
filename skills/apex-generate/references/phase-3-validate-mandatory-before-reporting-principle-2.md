# Phase 3: Validate (mandatory before reporting, Principle 2)

Read with `apex-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 3: Validate (mandatory before reporting, Principle 2)</span>
<span data-proof="authored" data-by="ai:claude">Writing files is the midpoint. The deliverable isn't done until both checks pass.</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mjc0LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Static analysis
sf code-analyzer run --target force-app/main/default/classes/{ClassName}.cls --json
# Or via MCP: run_code_analyzer on the generated files

# Test execution
sf apex run test --tests {ClassName}Test --code-coverage --result-format human --synchronous --json
```

<span data-proof="authored" data-by="ai:claude">Remediate every sev0/sev1/sev2 violation and re-run. If tests fail, fix and re-run — don't paper over with</span> <span data-proof="authored" data-by="ai:claude">`try/catch`.</span>

***

