# Phase 2: Reproduce — live preview, 3-run classification

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 2: Reproduce — live preview, 3-run classification</span>
<span data-proof="authored" data-by="ai:claude">For every confirmed issue from Phase 1, build one preview scenario per issue. Run each scenario</span> **<span data-proof="authored" data-by="ai:claude">3 times</span>** <span data-proof="authored" data-by="ai:claude">and classify:</span>

| <span data-proof="authored" data-by="ai:claude">Verdict</span>            | <span data-proof="authored" data-by="ai:claude">Criteria</span>                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`[CONFIRMED]`</span>      | <span data-proof="authored" data-by="ai:claude">Same failure in 3/3 runs</span> |
| <span data-proof="authored" data-by="ai:claude">`[INTERMITTENT]`</span>   | <span data-proof="authored" data-by="ai:claude">Failure in 1-2/3 runs</span>    |
| <span data-proof="authored" data-by="ai:claude">`[NOT REPRODUCED]`</span> | <span data-proof="authored" data-by="ai:claude">Passes 3/3</span>               |

<span data-proof="authored" data-by="ai:claude">Only</span> <span data-proof="authored" data-by="ai:claude">`[CONFIRMED]`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`[INTERMITTENT]`</span> <span data-proof="authored" data-by="ai:claude">proceed to Phase 3. The 3-run discipline exists because LLM jitter (Principle 3) will lie to you if you only run once.</span>

> **⚠️ Use `--use-live-actions` for reproduction.** Reproducing a production issue requires the same conditions: real Apex called. Without `--use-live-actions`, the preview runs in simulated mode and will likely succeed even for issues that fail in production. Always reproduce with:
> ```bash
> sf agent preview start --json --use-live-actions --apex-debug --authoring-bundle <Name> -o <org>
> ```

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MjUyLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent preview start --json --authoring-bundle <Name> -o <org>
sf agent preview send --json --session-id "$SID" --utterance "<text>" --authoring-bundle <Name> -o <org>
sf agent preview end --json --session-id "$SID" --authoring-bundle <Name> -o <org>
```

<span data-proof="authored" data-by="ai:claude">Trace path:</span> <span data-proof="authored" data-by="ai:claude">`.sfdx/agents/<Name>/sessions/<sessionId>/traces/<planId>.json`.</span>

***

