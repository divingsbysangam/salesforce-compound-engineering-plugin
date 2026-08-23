# <span data-proof="authored" data-by="ai:claude">Phase 3: Validate (mandatory before reporting, Principle 2)</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`apex-generate/SKILL.md`. Procedure lives here.</span>

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

### <span data-proof="authored" data-by="ai:claude">Fail-closed contract</span>

<span data-proof="authored" data-by="ai:claude">Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record</span> <span data-proof="authored" data-by="ai:claude">`<check>=unavailable: <reason>`. An empty success payload is not a pass.</span>

| <span data-proof="authored" data-by="ai:claude">Check</span>    | <span data-proof="authored" data-by="ai:claude">Preferred</span>                                                                                             | <span data-proof="authored" data-by="ai:claude">Fallback</span>                                                                                                                                            | <span data-proof="authored" data-by="ai:claude">Report line</span>                                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Compile</span>  | <span data-proof="authored" data-by="ai:claude">`sf project deploy start --dry-run --metadata ApexClass:{ClassName},ApexClass:{ClassName}Test --json`</span> | <span data-proof="authored" data-by="ai:claude">`sf project deploy validate --json`</span> <span data-proof="authored" data-by="ai:claude">with the same scope</span>                                      | <span data-proof="authored" data-by="ai:claude">`Compile: <output>`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`compile=unavailable: <reason>`</span> |
| <span data-proof="authored" data-by="ai:claude">Analyzer</span> | <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target force-app/main/default/classes/{ClassName}.cls --json`</span>                 | <span data-proof="authored" data-by="ai:claude">MCP</span> <span data-proof="authored" data-by="ai:claude">`run_code_analyzer`</span> <span data-proof="authored" data-by="ai:claude">if registered</span> | <span data-proof="authored" data-by="ai:claude">`Analyzer: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`analyzer=unavailable: <reason>`</span>    |
| <span data-proof="authored" data-by="ai:claude">Testing</span>  | <span data-proof="authored" data-by="ai:claude">`sf apex run test --tests {ClassName}Test --code-coverage --result-format human --synchronous --json`</span> | <span data-proof="authored" data-by="ai:claude">none</span>                                                                                                                                                | <span data-proof="authored" data-by="ai:claude">`Testing: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`testing=unavailable: <reason>`</span>      |

***