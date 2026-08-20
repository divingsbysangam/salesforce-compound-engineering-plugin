# Phase 1-ALT: Fallback when STDM is unavailable

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 1-ALT: Fallback when STDM is unavailable</span>
| <span data-proof="authored" data-by="ai:claude">Source</span>                             | <span data-proof="authored" data-by="ai:claude">Pros</span>                                      | <span data-proof="authored" data-by="ai:claude">Cons</span>                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">STDM (Phase 1)</span>                     | <span data-proof="authored" data-by="ai:claude">Real production data, volume</span>              | <span data-proof="authored" data-by="ai:claude">Requires Data Cloud, ~15 min lag</span> |
| <span data-proof="authored" data-by="ai:claude">Test suites + local traces (1-ALT)</span> | <span data-proof="authored" data-by="ai:claude">Instant, full LLM prompt + variable state</span> | <span data-proof="authored" data-by="ai:claude">No real users; preview-only</span>      |

### <span data-proof="authored" data-by="ai:claude">1-ALT.1 Run an existing test suite, if any</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzI1LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent test list --json -o <org>
sf agent test run --json --api-name <SuiteName> --wait 10 --result-format json -o <org> | tee /tmp/test_run.json
JOB_ID=$(python3 -c "import json; print(json.load(open('/tmp/test_run.json'))['result']['runId'])")
sf agent test results --json --job-id "$JOB_ID" --result-format json -o <org>
```

### <span data-proof="authored" data-by="ai:claude">1-ALT.2 Derive utterances from the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file</span>

<span data-proof="authored" data-by="ai:claude">Use the same derivation rules as</span> <span data-proof="authored" data-by="ai:claude">`/agentforce-test`</span> <span data-proof="authored" data-by="ai:claude">Step 0: subagent-based, action-based, guardrail, multi-turn, safety probes.</span>

> **⚠️ Debug logs must be on the Agent User, not the admin user.**
> When using `--use-live-actions`, Apex runs as the Einstein Agent User (the `@agentforce.com` scoped user), not your admin. If you set debug logs on your admin user, you will see zero Apex logs even when actions are being called. In Setup → Debug Logs, add the **agent user** specifically. Check the agent user's email in Setup → Users, filtered by "Einstein Agent".

> **⚠️ `available when:` gate behavior.** If a variable hasn't been captured yet (e.g. `customer_email` is still `""`), an action guarded by `available when @variables.customer_email != ""` will simply not appear in the `EnabledToolsStep` of the trace. The action is silently skipped — no error is thrown. If your action is never called, check the trace's `VariableUpdateStep` entries to confirm the variable was actually set before the action was invoked.

### <span data-proof="authored" data-by="ai:claude">1-ALT.3 Preview with</span> <span data-proof="authored" data-by="ai:claude">`--authoring-bundle`</span> <span data-proof="authored" data-by="ai:claude">(local traces)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent preview start --json --authoring-bundle <BundleName> -o <org> | tee /tmp/preview_start.json
SESSION_ID=$(python3 -c "import json; print(json.load(open('/tmp/preview_start.json'))['result']['sessionId'])")

sf agent preview send --json --session-id "$SESSION_ID" --authoring-bundle <BundleName> --utterance "<UTT>" -o <org> | tee /tmp/preview_response.json

sf agent preview end --json --session-id "$SESSION_ID" --authoring-bundle <BundleName> -o <org>
```

<span data-proof="authored" data-by="ai:claude">Trace files:</span> <span data-proof="authored" data-by="ai:claude">`.sfdx/agents/<BundleName>/sessions/<sessionId>/traces/<planId>.json`.</span>

### <span data-proof="authored" data-by="ai:claude">1-ALT.4 Local trace diagnosis</span>

| <span data-proof="authored" data-by="ai:claude">Issue type</span>            | <span data-proof="authored" data-by="ai:claude">Trace command</span>                                                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Subagent misroute</span>     | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[] | select(.type=="NodeEntryStateStep") | .data.agent_name' "$TRACE"`</span>         |
| <span data-proof="authored" data-by="ai:claude">Action not called</span>     | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[] | select(.type=="EnabledToolsStep") | .data.enabled_tools[]' "$TRACE"`</span>      |
| <span data-proof="authored" data-by="ai:claude">LOW adherence</span>         | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[] | select(.type=="ReasoningStep") | {category, reason}' "$TRACE"`</span>            |
| <span data-proof="authored" data-by="ai:claude">Variable capture fail</span> | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[] | select(.type=="VariableUpdateStep") | .data.variable_updates[]' "$TRACE"`</span> |
| <span data-proof="authored" data-by="ai:claude">Vague instructions</span>    | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[] | select(.type=="LLMStep") | .data.messages_sent[0].content' "$TRACE"`</span>      |

> **<span data-proof="authored" data-by="ai:claude">DefaultTopic trace quirk.</span>** <span data-proof="authored" data-by="ai:claude">With</span> <span data-proof="authored" data-by="ai:claude">`--authoring-bundle`, the root</span> <span data-proof="authored" data-by="ai:claude">`.topic`</span> <span data-proof="authored" data-by="ai:claude">field often shows</span> <span data-proof="authored" data-by="ai:claude">`"DefaultTopic"`</span> <span data-proof="authored" data-by="ai:claude">even when routing works. Always use</span> <span data-proof="authored" data-by="ai:claude">`NodeEntryStateStep.data.agent_name`</span> <span data-proof="authored" data-by="ai:claude">for the real subagent chain.</span>

> **<span data-proof="authored" data-by="ai:claude">Entry-answering-directly (SMALL_TALK pattern).</span>** <span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`start_agent`</span> <span data-proof="authored" data-by="ai:claude">trace shows</span> <span data-proof="authored" data-by="ai:claude">`SMALL_TALK`</span> <span data-proof="authored" data-by="ai:claude">grounding and transition tools are visible but none invoked, add</span> <span data-proof="authored" data-by="ai:claude">`"You are a router only. Do NOT answer questions directly."`</span> <span data-proof="authored" data-by="ai:claude">to</span> <span data-proof="authored" data-by="ai:claude">`start_agent: instructions:`.</span>

***

