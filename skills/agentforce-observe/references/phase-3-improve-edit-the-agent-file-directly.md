# Phase 3: Improve — edit the `.agent` file directly

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 3: Improve — edit the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file directly</span>
### <span data-proof="authored" data-by="ai:claude">3.0 Pre-flight</span>

<span data-proof="authored" data-by="ai:claude">Verify all action targets exist and are registered in the org before editing. If any are missing, present options to the user: deploy stubs, remove the actions, register via UI, or proceed with routing-only fixes.</span>

### <span data-proof="authored" data-by="ai:claude">3.1–3.3 Map each issue to a fix location</span>

| <span data-proof="authored" data-by="ai:claude">Confirmed issue</span>          | <span data-proof="authored" data-by="ai:claude">Fix location</span>                     | <span data-proof="authored" data-by="ai:claude">Strategy</span>                                                                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Subagent misroute</span>        | <span data-proof="authored" data-by="ai:claude">`subagent: description:`</span>         | <span data-proof="authored" data-by="ai:claude">Add keywords from production utterances</span>                                                                                                           |
| <span data-proof="authored" data-by="ai:claude">Wrong action</span>             | <span data-proof="authored" data-by="ai:claude">Action descriptions</span>              | <span data-proof="authored" data-by="ai:claude">Add exclusion language</span>                                                                                                                            |
| <span data-proof="authored" data-by="ai:claude">LOW grounding</span>            | <span data-proof="authored" data-by="ai:claude">`instructions: ->`</span>               | <span data-proof="authored" data-by="ai:claude">Inject</span> <span data-proof="authored" data-by="ai:claude">`{!@variables.x}`</span> <span data-proof="authored" data-by="ai:claude">references</span> |
| <span data-proof="authored" data-by="ai:claude">Persona leak</span>             | <span data-proof="authored" data-by="ai:claude">`system: instructions:`</span>          | <span data-proof="authored" data-by="ai:claude">Move persona out of subagents</span>                                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">Dead hub</span>                 | <span data-proof="authored" data-by="ai:claude">Transitions in upstream subagent</span> | <span data-proof="authored" data-by="ai:claude">Add transition action</span>                                                                                                                             |
| <span data-proof="authored" data-by="ai:claude">Entry answering directly</span> | <span data-proof="authored" data-by="ai:claude">`start_agent: instructions:`</span>     | <span data-proof="authored" data-by="ai:claude">Add router-only constraint</span>                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">Safety regression</span>        | <span data-proof="authored" data-by="ai:claude">`system: instructions:`</span>          | <span data-proof="authored" data-by="ai:claude">Re-state safety guidelines, response constraints</span>                                                                                                  |

<span data-proof="authored" data-by="ai:claude">Instruction principles (Principle 5 — taste over typing):</span>

* <span data-proof="authored" data-by="ai:claude">Name actions explicitly. Don't rely on the LLM to infer.</span>

* <span data-proof="authored" data-by="ai:claude">State pre-conditions clearly. Use</span> <span data-proof="authored" data-by="ai:claude">`available when:`</span> <span data-proof="authored" data-by="ai:claude">guards.</span>

* <span data-proof="authored" data-by="ai:claude">Scope tightly. One subagent, one job.</span>

* <span data-proof="authored" data-by="ai:claude">Persona in</span> <span data-proof="authored" data-by="ai:claude">`system:`</span> <span data-proof="authored" data-by="ai:claude">only — never in subagents.</span>

### <span data-proof="authored" data-by="ai:claude">3.4 Regression prevention</span>

* <span data-proof="authored" data-by="ai:claude">Establish a baseline before editing (the Phase 1 metrics).</span>

* <span data-proof="authored" data-by="ai:claude">Make minimal edits.</span>

* <span data-proof="authored" data-by="ai:claude">Test immediately after each edit.</span>

* <span data-proof="authored" data-by="ai:claude">One fix per publish cycle.</span>

* <span data-proof="authored" data-by="ai:claude">Check cross-subagent dependencies before touching shared variables.</span>

* <span data-proof="authored" data-by="ai:claude">Test adjacent subagents — fixing one routing description can break a sibling.</span>

### <span data-proof="authored" data-by="ai:claude">3.5 Apply</span>

<span data-proof="authored" data-by="ai:claude">Read the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file with the Read tool. Edit with the Edit tool (use tabs for indentation if the file uses tabs). Show the diff to the user.</span>

### <span data-proof="authored" data-by="ai:claude">3.6 Validate, deploy, publish, activate</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MjE4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent validate authoring-bundle --json --api-name <AGENT_API_NAME> -o <org>
sf agent publish authoring-bundle --json --api-name <AGENT_API_NAME> -o <org>
sf agent activate --json --api-name <AGENT_API_NAME> -o <org>
```

<span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`publish`</span> <span data-proof="authored" data-by="ai:claude">fails, the deploy + activate fallback is incomplete — it does not propagate</span> <span data-proof="authored" data-by="ai:claude">`reasoning: actions:`</span> <span data-proof="authored" data-by="ai:claude">to live metadata. Fix the publish error rather than working around it.</span>

### <span data-proof="authored" data-by="ai:claude">3.7 Verify</span>

<span data-proof="authored" data-by="ai:claude">Re-run Phase 2 scenarios post-fix. Check the trace for correct routing, grounding, tools, and variables. Then</span> **<span data-proof="authored" data-by="ai:claude">schedule a re-run of Phase 1 in 24–48 hours</span>** <span data-proof="authored" data-by="ai:claude">to compare against baseline. Production lag is real; preview-only verification is not enough (Principle 3).</span>

### <span data-proof="authored" data-by="ai:claude">3.7b Safety re-verification (mandatory, Principle 1)</span>

<span data-proof="authored" data-by="ai:claude">Re-run safety probes against the modified</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file.</span> **<span data-proof="authored" data-by="ai:claude">Revert any change that introduces a BLOCK finding.</span>** <span data-proof="authored" data-by="ai:claude">A regressed safety surface is not allowed to ship regardless of what other improvement it brings.</span>

### <span data-proof="authored" data-by="ai:claude">3.8 Capture regression tests</span>

<span data-proof="authored" data-by="ai:claude">Convert each</span> <span data-proof="authored" data-by="ai:claude">`[CONFIRMED]`</span> <span data-proof="authored" data-by="ai:claude">issue into a Testing Center YAML test case. Deploy with</span> <span data-proof="authored" data-by="ai:claude">`sf agent test create`</span> <span data-proof="authored" data-by="ai:claude">and verify all previously-broken scenarios pass. The regression suite is institutional memory — Principle 7.</span>

***

