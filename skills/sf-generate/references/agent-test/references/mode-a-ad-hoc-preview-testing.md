# Mode A: Ad-hoc preview testing

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Mode A: Ad-hoc preview testing</span>
### <span data-proof="authored" data-by="ai:claude">Run the preview session</span>

> **⚠️ SIMULATED vs LIVE mode — critical distinction.**
>
> By default, `sf agent preview` runs in **simulated mode**: the agent runtime mocks all action responses and never calls your real Apex classes or Flows. This means:
> - Variable capture via `@utils.setVariables` works normally
> - Routing logic and `available when:` guards are exercised
> - But `@InvocableMethod` classes are **never invoked** — you will not receive real results or emails
>
> To invoke real deployed Apex/Flow actions, **always add `--use-live-actions`**:
> ```bash
> sf agent preview start --json --use-live-actions --authoring-bundle <BundleName> --target-org <org>
> ```
> Add `--apex-debug` to capture Apex debug logs during the session:
> ```bash
> sf agent preview start --json --use-live-actions --apex-debug --authoring-bundle <BundleName> --target-org <org>
> ```
> **Debug logs must be on the Agent User.** Apex runs as the Einstein Agent User (e.g. `agentforce.com` email), not your admin user. In Setup → Debug Logs, add the **agent user** — adding admin produces no logs.
>
> Note: `--mode live` is NOT a valid flag. The correct flag is `--use-live-actions`.

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjIwLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
SESSION_ID=$(sf agent preview start --json \
  --authoring-bundle <BundleName> \
  --target-org <org> \
  | python3 -c "import json,sys,re; print(json.loads(re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]','',sys.stdin.read()))['result']['sessionId'])")

sf agent preview send --json \
  --session-id "$SESSION_ID" \
  --authoring-bundle <BundleName> \
  --utterance "<test utterance>" \
  --target-org <org>

TRACES_PATH=$(sf agent preview end --json \
  --session-id "$SESSION_ID" \
  --authoring-bundle <BundleName> \
  --target-org <org> \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['result']['tracesPath'])")
```

<span data-proof="authored" data-by="ai:claude">`--authoring-bundle`</span> <span data-proof="authored" data-by="ai:claude">must be on all three subcommands. It compiles from the local</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file and writes local trace files, which is what makes Mode A useful for iteration.</span>

### <span data-proof="authored" data-by="ai:claude">Trace file layout</span>

<span data-proof="authored" data-by="ai:claude">`.sfdx/agents/<BundleName>/sessions/<sessionId>/traces/<planId>.json`</span>

### <span data-proof="authored" data-by="ai:claude">Trace queries (the jq vocabulary you actually need)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA5NSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
TRACE=".sfdx/agents/<BundleName>/sessions/<SID>/traces/<PID>.json"

# Topic / subagent routing (use NodeEntryStateStep, not the root .topic field — it lies)
jq -r '.plan[] | select(.type == "NodeEntryStateStep") | .data.agent_name' "$TRACE"

# Action invocation
jq -r '.plan[] | select(.type == "BeforeReasoningIterationStep") | .data.action_names[]' "$TRACE"

# Tools that were available (but might not have been called)
jq -r '.plan[] | select(.type == "EnabledToolsStep") | .data.enabled_tools[]' "$TRACE"

# Grounding (LOW vs HIGH adherence)
jq -r '.plan[] | select(.type == "ReasoningStep") | {category: .category, reason: .reason}' "$TRACE"

# Safety score
jq -r '.plan[] | select(.type == "PlannerResponseStep") | .safetyScore.safetyScore.safety_score' "$TRACE"

# Final response text
jq -r '.plan[] | select(.type == "PlannerResponseStep") | .message' "$TRACE"

# Variable updates with reasons
jq -r '.plan[] | select(.type == "VariableUpdateStep") | .data.variable_updates[] | "\(.variable_name): \(.variable_past_value) -> \(.variable_new_value) (\(.variable_change_reason))"' "$TRACE"
```

<span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`jq`</span> <span data-proof="authored" data-by="ai:claude">chokes on control characters in the CLI output, strip with Python:</span> <span data-proof="authored" data-by="ai:claude">`re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', raw)`</span> <span data-proof="authored" data-by="ai:claude">before parsing.</span>

***

