# <span data-proof="authored" data-by="ai:claude">Phase 1-ALT: Fallback when STDM is unavailable</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`agentforce-observe/SKILL.md`. Procedure lives here.</span>

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

> **<span data-proof="authored" data-by="ai:claude">⚠️ Debug logs must be on the Agent User, not the admin user.</span>**<span data-proof="authored" data-by="ai:claude">
> When using</span> <span data-proof="authored" data-by="ai:claude">`--use-live-actions`, Apex runs as the Einstein Agent User (the</span> <span data-proof="authored" data-by="ai:claude">`@agentforce.com`</span> <span data-proof="authored" data-by="ai:claude">scoped user), not your admin. If you set debug logs on your admin user, you will see zero Apex logs even when actions are being called. In Setup → Debug Logs, add the</span> **<span data-proof="authored" data-by="ai:claude">agent user</span>** <span data-proof="authored" data-by="ai:claude">specifically. Check the agent user's email in Setup → Users, filtered by "Einstein Agent".</span>

> **<span data-proof="authored" data-by="ai:claude">⚠️</span>** **<span data-proof="authored" data-by="ai:claude">`available when:`</span><span data-proof="authored" data-by="ai:claude">gate behavior.</span>**  <span data-proof="authored" data-by="ai:claude">If a variable hasn't been captured yet (e.g.</span> <span data-proof="authored" data-by="ai:claude">`customer_email`</span> <span data-proof="authored" data-by="ai:claude">is still</span> <span data-proof="authored" data-by="ai:claude">`""`), an action guarded by</span> <span data-proof="authored" data-by="ai:claude">`available when @variables.customer_email != ""`</span> <span data-proof="authored" data-by="ai:claude">will simply not appear in the</span> <span data-proof="authored" data-by="ai:claude">`EnabledToolsStep`</span> <span data-proof="authored" data-by="ai:claude">of the trace. The action is silently skipped — no error is thrown. If your action is never called, check the trace's</span> <span data-proof="authored" data-by="ai:claude">`VariableUpdateStep`</span> <span data-proof="authored" data-by="ai:claude">entries to confirm the variable was actually set before the action was invoked.</span>

### <span data-proof="authored" data-by="ai:claude">1-ALT.3 Preview with</span> <span data-proof="authored" data-by="ai:claude">`--authoring-bundle`</span> <span data-proof="authored" data-by="ai:claude">(local traces)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent preview start --json --authoring-bundle <BundleName> -o <org> | tee /tmp/preview_start.json
SESSION_ID=$(python3 -c "import json; print(json.load(open('/tmp/preview_start.json'))['result']['sessionId'])")

sf agent preview send --json --session-id "$SESSION_ID" --authoring-bundle <BundleName> --utterance "<UTT>" -o <org> | tee /tmp/preview_response.json

sf agent preview end --json --session-id "$SESSION_ID" --authoring-bundle <BundleName> -o <org>
```

<span data-proof="authored" data-by="ai:claude">Trace files:</span> <span data-proof="authored" data-by="ai:claude">`.sfdx/agents/<BundleName>/sessions/<sessionId>/traces/<planId>.json`.</span>

### <span data-proof="authored" data-by="ai:claude">1-ALT.4 Local trace diagnosis</span>

| <br />                                                                       | <br />                                                                 | <span data-proof="authored" data-by="ai:claude">Issue type</span>                          | <span data-proof="authored" data-by="ai:claude">Trace command</span>                                    |
| :--------------------------------------------------------------------------- | :--------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Subagent misroute</span>     | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[]</span> | <span data-proof="authored" data-by="ai:claude">select(.type=="NodeEntryStateStep")</span> | <span data-proof="authored" data-by="ai:claude">.data.agent_name' "$TRACE"`</span></span>               |
| <span data-proof="authored" data-by="ai:claude">Action not called</span>     | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[]</span> | <span data-proof="authored" data-by="ai:claude">select(.type=="EnabledToolsStep")</span>   | <span data-proof="authored" data-by="ai:claude">.data.enabled_tools[]' "$TRACE"`</span></span>          |
| <span data-proof="authored" data-by="ai:claude">LOW adherence</span>         | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[]</span> | <span data-proof="authored" data-by="ai:claude">select(.type=="ReasoningStep")</span>      | <span data-proof="authored" data-by="ai:claude">{category, reason}' "$TRACE"`</span></span>             |
| <span data-proof="authored" data-by="ai:claude">Variable capture fail</span> | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[]</span> | <span data-proof="authored" data-by="ai:claude">select(.type=="VariableUpdateStep")</span> | <span data-proof="authored" data-by="ai:claude">.data.variable_updates[]' "$TRACE"`</span></span>       |
| <span data-proof="authored" data-by="ai:claude">Vague instructions</span>    | <span data-proof="authored" data-by="ai:claude">`jq -r '.plan[]</span> | <span data-proof="authored" data-by="ai:claude">select(.type=="LLMStep")</span>            | <span data-proof="authored" data-by="ai:claude">.data.messages_sent[0].content' "$TRACE"`</span></span> |

> **<span data-proof="authored" data-by="ai:claude">DefaultTopic trace quirk.</span>** <span data-proof="authored" data-by="ai:claude">With</span> <span data-proof="authored" data-by="ai:claude">`--authoring-bundle`, the root</span> <span data-proof="authored" data-by="ai:claude">`.topic`</span> <span data-proof="authored" data-by="ai:claude">field often shows</span> <span data-proof="authored" data-by="ai:claude">`"DefaultTopic"`</span> <span data-proof="authored" data-by="ai:claude">even when routing works. Always use</span> <span data-proof="authored" data-by="ai:claude">`NodeEntryStateStep.data.agent_name`</span> <span data-proof="authored" data-by="ai:claude">for the real subagent chain.</span>

> **<span data-proof="authored" data-by="ai:claude">Entry-answering-directly (SMALL_TALK pattern).</span>** <span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`start_agent`</span> <span data-proof="authored" data-by="ai:claude">trace shows</span> <span data-proof="authored" data-by="ai:claude">`SMALL_TALK`</span> <span data-proof="authored" data-by="ai:claude">grounding and transition tools are visible but none invoked, add</span> <span data-proof="authored" data-by="ai:claude">`"You are a router only. Do NOT answer questions directly."`</span> <span data-proof="authored" data-by="ai:claude">to</span> <span data-proof="authored" data-by="ai:claude">`start_agent: instructions:`.</span>

<span data-proof="authored" data-by="ai:claude">Record</span> <span data-proof="authored" data-by="ai:claude">`stdm=unavailable: <reason>`</span> <span data-proof="authored" data-by="ai:claude">whenever Phase 1 could not query Data Cloud. Do not invent production evidence. If preview also cannot run, stop; do not mark the issue reproduced.</span>

***