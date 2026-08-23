# <span data-proof="authored" data-by="ai:claude">Step 5: Validate compilation</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`agentforce-develop/SKILL.md`. Procedure lives here.</span>

## <span data-proof="authored" data-by="ai:claude">Step 5: Validate compilation</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjksImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf agent validate authoring-bundle --json --api-name <Developer_Name>
```

<span data-proof="authored" data-by="ai:claude">If validation fails, fix syntax and structural errors before generating any backing logic. A</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file that doesn't compile is not worth writing tests for.</span>

### <span data-proof="authored" data-by="ai:claude">Fail-closed contract</span>

<span data-proof="authored" data-by="ai:claude">`sf agent validate authoring-bundle --json --api-name <Developer_Name>`</span> <span data-proof="authored" data-by="ai:claude">is required. If the command errors, times out, returns empty/uncertain output, or is not installed: try</span> <span data-proof="authored" data-by="ai:claude">`sf agent validate --json`</span> <span data-proof="authored" data-by="ai:claude">with the same api-name. Then record</span> <span data-proof="authored" data-by="ai:claude">`validate=unavailable: <reason>`. Empty validation output is not a pass. Do not publish or generate backing logic until validation succeeded or was recorded unavailable and the user accepted the risk.</span>

***