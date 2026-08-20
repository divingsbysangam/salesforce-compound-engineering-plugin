# Inputs to gather before starting

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Inputs to gather before starting</span>
<span data-proof="authored" data-by="ai:claude">Ask the user (or auto-detect) the following before running any query:</span>

* **<span data-proof="authored" data-by="ai:claude">Org alias</span>** <span data-proof="authored" data-by="ai:claude">— required.</span>

* **<span data-proof="authored" data-by="ai:claude">Agent API name</span>** <span data-proof="authored" data-by="ai:claude">— required for preview and deploy. Ask if not provided.</span>

* **<span data-proof="authored" data-by="ai:claude">Agent file path</span>** <span data-proof="authored" data-by="ai:claude">— optional; default search is</span> <span data-proof="authored" data-by="ai:claude">`force-app/main/default/aiAuthoringBundles/<AgentName>/<AgentName>.agent`. If not local, retrieve from org.</span>

* **<span data-proof="authored" data-by="ai:claude">Session IDs</span>** <span data-proof="authored" data-by="ai:claude">— optional; if absent, query the last 7 days.</span>

* **<span data-proof="authored" data-by="ai:claude">Days to look back</span>** <span data-proof="authored" data-by="ai:claude">— optional; default 7.</span>

### <span data-proof="authored" data-by="ai:claude">Resolve the agent name (mandatory before STDM queries)</span>

<span data-proof="authored" data-by="ai:claude">STDM uses</span> <span data-proof="authored" data-by="ai:claude">`MasterLabel`</span> <span data-proof="authored" data-by="ai:claude">for filtering; the CLI uses</span> <span data-proof="authored" data-by="ai:claude">`DeveloperName`</span> <span data-proof="authored" data-by="ai:claude">(without the</span> <span data-proof="authored" data-by="ai:claude">`_vN`</span> <span data-proof="authored" data-by="ai:claude">suffix). Get both:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MjA4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf data query --json \
  --query "SELECT Id, MasterLabel, DeveloperName FROM GenAiPlannerDefinition WHERE MasterLabel LIKE '%<user-provided-name>%' OR DeveloperName LIKE '%<user-provided-name>%'" \
  -o <org>
```

<span data-proof="authored" data-by="ai:claude">Store:</span>

* <span data-proof="authored" data-by="ai:claude">`AGENT_MASTER_LABEL`</span> <span data-proof="authored" data-by="ai:claude">— for STDM</span> <span data-proof="authored" data-by="ai:claude">`findSessions()`</span> <span data-proof="authored" data-by="ai:claude">filter (e.g.</span> <span data-proof="authored" data-by="ai:claude">`"Order Service"`)</span>

* <span data-proof="authored" data-by="ai:claude">`AGENT_API_NAME`</span> <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`DeveloperName`</span> <span data-proof="authored" data-by="ai:claude">minus the</span> <span data-proof="authored" data-by="ai:claude">`_vN`</span> <span data-proof="authored" data-by="ai:claude">suffix (e.g.</span> <span data-proof="authored" data-by="ai:claude">`OrderService`)</span>

* <span data-proof="authored" data-by="ai:claude">`PLANNER_ID`</span> <span data-proof="authored" data-by="ai:claude">— Salesforce record ID</span>

### <span data-proof="authored" data-by="ai:claude">Locate the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file</span>

<span data-proof="authored" data-by="ai:claude">Search locally first:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6ODksImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
find <project-root>/force-app/main/default/aiAuthoringBundles -name "*.agent" 2>/dev/null
```

<span data-proof="authored" data-by="ai:claude">If not found, retrieve from org:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6ODksImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf project retrieve start --json --metadata "AiAuthoringBundle:<AGENT_API_NAME>" -o <org>
```

> **<span data-proof="authored" data-by="ai:claude">Known platform bug.</span>**<span data-proof="authored" data-by="ai:claude"></span> <span data-proof="authored" data-by="ai:claude">`sf project retrieve start`</span> <span data-proof="authored" data-by="ai:claude">for</span> <span data-proof="authored" data-by="ai:claude">`AiAuthoringBundle`</span> <span data-proof="authored" data-by="ai:claude">creates a double-nested path:</span> <span data-proof="authored" data-by="ai:claude">`force-app/main/default/main/default/aiAuthoringBundles/...`. Fix immediately:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MjgzLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
if [ -d "force-app/main/default/main/default/aiAuthoringBundles" ]; then
  mkdir -p force-app/main/default/aiAuthoringBundles
  cp -r force-app/main/default/main/default/aiAuthoringBundles/* \
        force-app/main/default/aiAuthoringBundles/
  rm -rf force-app/main/default/main
fi
```

***

