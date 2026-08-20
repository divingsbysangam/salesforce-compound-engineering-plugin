# Action execution (Mode C)

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Action execution (Mode C)</span>
<span data-proof="authored" data-by="ai:claude">For testing a single Flow or Apex action in isolation:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTYyLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
TOKEN=$(sf org display -o <org> --json | jq -r '.result.accessToken')
INSTANCE_URL=$(sf org display -o <org> --json | jq -r '.result.instanceUrl')

# Flow action
curl -s "$INSTANCE_URL/services/data/v63.0/actions/custom/flow/<FlowApiName>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"inputs": [{"param": "value"}]}'

# Apex action
curl -s "$INSTANCE_URL/services/data/v63.0/actions/custom/apex/<ClassName>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"inputs": [{"param": "value"}]}'
```

**<span data-proof="authored" data-by="ai:claude">Safety gate before any action execution:</span>**

1. **<span data-proof="authored" data-by="ai:claude">Org check</span>** <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`sf data query -q "SELECT IsSandbox FROM Organization" -o <org> --json`. Warn and require explicit confirmation for production orgs.</span>
2. **<span data-proof="authored" data-by="ai:claude">DML check</span>** <span data-proof="authored" data-by="ai:claude">— warn if the action performs writes (CREATE / UPDATE / DELETE).</span>
3. **<span data-proof="authored" data-by="ai:claude">Synthetic test data only</span>** <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`test@example.com`,</span> <span data-proof="authored" data-by="ai:claude">`000-00-0000`. Never feed real PII into a test invocation.</span>

***

