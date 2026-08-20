# Step 7: Preview with live actions and read traces (Principle 3)

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 7: Preview with live actions and read traces (Principle 3)</span>
```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6ODQsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf agent preview start --json --use-live-actions --authoring-bundle <Developer_Name>
```

<span data-proof="authored" data-by="ai:claude">Capture the session ID, then:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTkzLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent preview send --json --authoring-bundle <Developer_Name> --session-id <ID> --utterance "<test message>"
sf agent preview end --json --authoring-bundle <Developer_Name> --session-id <ID>
```

<span data-proof="authored" data-by="ai:claude">Trace files land at:</span> <span data-proof="authored" data-by="ai:claude">`.sfdx/agents/<Developer_Name>/sessions/<sessionId>/traces/<planId>.json`.</span>

> **⚠️ Default preview is SIMULATED — Apex is never called.** By default, `sf agent preview` runs in simulated mode and mocks all action responses. To invoke real deployed Apex, you MUST pass `--use-live-actions`:
> ```bash
> sf agent preview start --json --use-live-actions --authoring-bundle <Developer_Name> -o <org>
> ```
> Add `--apex-debug` to generate Apex debug logs during the preview session:
> ```bash
> sf agent preview start --json --use-live-actions --apex-debug --authoring-bundle <Developer_Name> -o <org>
> ```
> **Debug logs must be set on the Agent User, not the admin user.** The Apex runs in the context of the Einstein Agent User created for your service agent. In Setup → Debug Logs, add the agent user (e.g. `sangameshgella.51a07bde9b13@agentforce.com`) — adding the admin user will produce no logs for agent-invoked Apex.

<span data-proof="authored" data-by="ai:claude">Confirm subagent routing, gating, and action invocations match the Agent Spec. If behavior diverges from spec, the diagnosis flow is in</span> <span data-proof="authored" data-by="ai:claude">`/agentforce-observe`</span> <span data-proof="authored" data-by="ai:claude">(jq queries against trace JSON to surface routing, action invocation, grounding, and safety scores). Return here only after correcting.</span>

**<span data-proof="authored" data-by="ai:claude">Checkpoint — do NOT proceed to publish unless ALL of the following are true:</span>**

* <span data-proof="authored" data-by="ai:claude">`validate authoring-bundle`</span> <span data-proof="authored" data-by="ai:claude">passes with zero errors</span>

* <span data-proof="authored" data-by="ai:claude">Live preview run with at least one representative utterance per subagent</span>

* <span data-proof="authored" data-by="ai:claude">Traces confirm correct subagent routing and action invocation</span>

* <span data-proof="authored" data-by="ai:claude">Safety probe utterances handled correctly</span>

* <span data-proof="authored" data-by="ai:claude">User explicitly approves deployment</span>

***

