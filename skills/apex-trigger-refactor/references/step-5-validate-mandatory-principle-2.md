# <span data-proof="authored" data-by="ai:claude">Step 5: Validate (mandatory, Principle 2)</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-refactor/SKILL.md`. Procedure lives here.</span>

## <span data-proof="authored" data-by="ai:claude">Step 5: Validate (mandatory, Principle 2)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzY2LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Static analysis on every changed file
sf code-analyzer run --target force-app/main/default/triggers/<TriggerName>.trigger,force-app/main/default/classes/<HandlerClassName>.cls,force-app/main/default/classes/<HandlerClassName>Test.cls --json

# Run the tests
sf apex run test --tests <HandlerClassName>Test --code-coverage --result-format human --synchronous --json
```

<span data-proof="authored" data-by="ai:claude">Remediate every sev0/sev1/sev2. Coverage target:</span> **<span data-proof="authored" data-by="ai:claude">90%+</span>** <span data-proof="authored" data-by="ai:claude">on the handler class.</span>

<span data-proof="authored" data-by="ai:claude">Dispatch</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-architect`</span> <span data-proof="authored" data-by="ai:claude">review agent for a pattern review.</span>

### <span data-proof="authored" data-by="ai:claude">Fail-closed contract</span>

<span data-proof="authored" data-by="ai:claude">Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record</span> <span data-proof="authored" data-by="ai:claude">`<check>=unavailable: <reason>`. An empty success payload is not a pass.</span>

| <span data-proof="authored" data-by="ai:claude">Check</span>    | <span data-proof="authored" data-by="ai:claude">Preferred</span>                                                                                                                                     | <span data-proof="authored" data-by="ai:claude">Fallback</span>                                                                                                                                            | <span data-proof="authored" data-by="ai:claude">Report line</span>                                                                                                                                                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Compile</span>  | <span data-proof="authored" data-by="ai:claude">`sf project deploy start --dry-run --metadata ApexTrigger:<TriggerName>,ApexClass:<HandlerClassName>,ApexClass:<HandlerClassName>Test --json`</span> | <span data-proof="authored" data-by="ai:claude">`sf project deploy validate --json`</span> <span data-proof="authored" data-by="ai:claude">with the same scope</span>                                      | <span data-proof="authored" data-by="ai:claude">`Compile: <output>`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`compile=unavailable: <reason>`</span> |
| <span data-proof="authored" data-by="ai:claude">Analyzer</span> | <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <changed files> --json`</span>                                                                                        | <span data-proof="authored" data-by="ai:claude">MCP</span> <span data-proof="authored" data-by="ai:claude">`run_code_analyzer`</span> <span data-proof="authored" data-by="ai:claude">if registered</span> | <span data-proof="authored" data-by="ai:claude">`Analyzer: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`analyzer=unavailable: <reason>`</span>    |
| <span data-proof="authored" data-by="ai:claude">Testing</span>  | <span data-proof="authored" data-by="ai:claude">`sf apex run test --tests <HandlerClassName>Test --code-coverage --result-format human --synchronous --json`</span>                                  | <span data-proof="authored" data-by="ai:claude">none</span>                                                                                                                                                | <span data-proof="authored" data-by="ai:claude">`Testing: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`testing=unavailable: <reason>`</span>      |

***