# Test file location convention

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Test file location convention</span>
<span data-proof="authored" data-by="ai:claude">Place tests under the project root:</span>

```
<project-root>/tests/
  <AgentApiName>-testing-center.yaml   # Full smoke suite (Mode B)
  <AgentApiName>-regression.yaml       # Regression tests carried back from /agentforce-observe (Mode B)
  <AgentApiName>-smoke.yaml            # Ad-hoc smoke tests (Mode A)
```

***

