# Phase 0: Discover the Data Space

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 0: Discover the Data Space</span>
<span data-proof="authored" data-by="ai:claude">Before any STDM query, get the active Data Cloud Data Space:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjgsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf api request rest "/services/data/v63.0/ssot/data-spaces" -o <org>
```

> <span data-proof="authored" data-by="ai:claude">Note:</span> <span data-proof="authored" data-by="ai:claude">`sf api request rest`</span> <span data-proof="authored" data-by="ai:claude">is beta. Do NOT pass</span> <span data-proof="authored" data-by="ai:claude">`--json`</span> <span data-proof="authored" data-by="ai:claude">— it's unsupported and errors out.</span>

<span data-proof="authored" data-by="ai:claude">Decision logic:</span>

* <span data-proof="authored" data-by="ai:claude">If the call fails (404, permission error), fall back to</span> <span data-proof="authored" data-by="ai:claude">`default`</span> <span data-proof="authored" data-by="ai:claude">and surface the assumption to the user.</span>

* <span data-proof="authored" data-by="ai:claude">Filter to</span> <span data-proof="authored" data-by="ai:claude">`status: "Active"`.</span>

* <span data-proof="authored" data-by="ai:claude">One active space → use it, confirm to user: "Using Data Space:</span> <span data-proof="authored" data-by="ai:claude">`<name>`".</span>

* <span data-proof="authored" data-by="ai:claude">Multiple → list</span> <span data-proof="authored" data-by="ai:claude">`label + name`, ask which.</span>

<span data-proof="authored" data-by="ai:claude">Store the chosen</span> <span data-proof="authored" data-by="ai:claude">`name`</span> <span data-proof="authored" data-by="ai:claude">as</span> <span data-proof="authored" data-by="ai:claude">`DATA_SPACE`.</span>

### <span data-proof="authored" data-by="ai:claude">Probe STDM availability</span>

<span data-proof="authored" data-by="ai:claude">Deploy the helper class</span> <span data-proof="authored" data-by="ai:claude">`AgentforceOptimizeService`</span> <span data-proof="authored" data-by="ai:claude">once per org (see upstream</span> <span data-proof="authored" data-by="ai:claude">`references/stdm-queries.md`</span> <span data-proof="authored" data-by="ai:claude">for the class source). Then probe:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDQ4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf apex run -o <org> -f /dev/stdin << 'APEX'
ConnectApi.CdpQueryInput qi = new ConnectApi.CdpQueryInput();
qi.sql = 'SELECT ssot__Id__c FROM "ssot__AiAgentSession__dlm" LIMIT 1';
try {
    ConnectApi.CdpQueryOutputV2 out = ConnectApi.CdpQuery.queryAnsiSqlV2(qi, '<DATA_SPACE>');
    System.debug('STDM_CHECK:OK rows=' + (out.data != null ? out.data.size() : 0));
} catch (Exception e) {
    System.debug('STDM_CHECK:FAIL ' + e.getMessage());
}
APEX
```

* <span data-proof="authored" data-by="ai:claude">`STDM_CHECK:OK`</span> <span data-proof="authored" data-by="ai:claude">→ proceed to Phase 1.</span>

* <span data-proof="authored" data-by="ai:claude">`STDM_CHECK:FAIL`</span> <span data-proof="authored" data-by="ai:claude">→ STDM is not activated. Switch to</span> **<span data-proof="authored" data-by="ai:claude">Phase 1-ALT (fallback)</span>**<span data-proof="authored" data-by="ai:claude">. Inform the user: "STDM Session Trace Data Model is not available in this org. Enable via Setup → Data Cloud → Data Streams (verify</span> *<span data-proof="authored" data-by="ai:claude">Agentforce Activity</span>* <span data-proof="authored" data-by="ai:claude">is active). Proceeding with fallback: test suites + local traces."</span>

***

