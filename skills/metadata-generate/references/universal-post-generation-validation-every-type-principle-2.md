# <span data-proof="authored" data-by="ai:claude">Universal post-generation validation (every type, Principle 2)</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`metadata-generate/SKILL.md`. Procedure lives here.</span>

## <span data-proof="authored" data-by="ai:claude">Universal post-generation validation (every type, Principle 2)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTgsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf code-analyzer run --target <generated-file-path> --json
```

<span data-proof="authored" data-by="ai:claude">Then dispatch in parallel:</span>

* <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`metadata-consistency-checker(file_path)`</span> <span data-proof="authored" data-by="ai:claude">— cross-metadata coherence (e.g., the field references an object that exists; the tab references an object that exists)</span>

* <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`pattern-recognition-specialist(file_path)`</span> <span data-proof="authored" data-by="ai:claude">— naming conventions, taste</span>

<span data-proof="authored" data-by="ai:claude">Remediate sev0/sev1/sev2. Don't declare done until both review agents return clean.</span>

### <span data-proof="authored" data-by="ai:claude">Fail-closed contract</span>

<span data-proof="authored" data-by="ai:claude">Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record</span> <span data-proof="authored" data-by="ai:claude">`<check>=unavailable: <reason>`. An empty success payload is not a pass.</span>

| <span data-proof="authored" data-by="ai:claude">Check</span>    | <span data-proof="authored" data-by="ai:claude">Preferred</span>                                                            | <span data-proof="authored" data-by="ai:claude">Fallback</span>                                                                                                                                            | <span data-proof="authored" data-by="ai:claude">Report line</span>                                                                                                                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Analyzer</span> | <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <generated-file-path> --json`</span>         | <span data-proof="authored" data-by="ai:claude">MCP</span> <span data-proof="authored" data-by="ai:claude">`run_code_analyzer`</span> <span data-proof="authored" data-by="ai:claude">if registered</span> | <span data-proof="authored" data-by="ai:claude">`Analyzer: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`analyzer=unavailable: <reason>`</span>    |
| <span data-proof="authored" data-by="ai:claude">Compile</span>  | <span data-proof="authored" data-by="ai:claude">`sf project deploy start --dry-run --metadata <Type:ApiName> --json`</span> | <span data-proof="authored" data-by="ai:claude">`sf project deploy validate --json`</span> <span data-proof="authored" data-by="ai:claude">with the same scope</span>                                      | <span data-proof="authored" data-by="ai:claude">`Compile: <output>`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`compile=unavailable: <reason>`</span> |

***