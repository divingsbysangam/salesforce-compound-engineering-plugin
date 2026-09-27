# <span data-proof="authored" data-by="ai:claude">Post-generation validation (mandatory, Principle 2)</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`flow-generate/SKILL.md`. Procedure lives here.</span>

## <span data-proof="authored" data-by="ai:claude">Post-generation validation (mandatory, Principle 2)</span>

<span data-proof="authored" data-by="ai:claude">Once the pipeline returns XML, do</span> **<span data-proof="authored" data-by="ai:claude">not</span>** <span data-proof="authored" data-by="ai:claude">declare success without these checks:</span>

1. **<span data-proof="authored" data-by="ai:claude">Persist the metadata.</span>** <span data-proof="authored" data-by="ai:claude">Save under</span> <span data-proof="authored" data-by="ai:claude">`force-app/main/default/flows/<FlowApiName>.flow-meta.xml`.</span>
2. **<span data-proof="authored" data-by="ai:claude">Static analysis.</span>** <span data-proof="authored" data-by="ai:claude">Run</span> <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <path> --json`</span> <span data-proof="authored" data-by="ai:claude">and remediate sev0/sev1/sev2.</span>
3. **<span data-proof="authored" data-by="ai:claude">Parallel review agents</span>** <span data-proof="authored" data-by="ai:claude">(Principle 1):</span>

   * <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`flow-governor-monitor(flow_xml)`</span> <span data-proof="authored" data-by="ai:claude">— verifies no DML/SOQL in loops, fault paths present</span>

   * <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`flow-complexity-analyzer(flow_xml)`</span> <span data-proof="authored" data-by="ai:claude">— flags excessive branching, unbounded loops</span>

   * <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`process-automation-strategist(flow_xml)`</span> <span data-proof="authored" data-by="ai:claude">— confirms Flow vs Apex was the right call</span>
4. **<span data-proof="authored" data-by="ai:claude">Bulk-safe entry.</span>** <span data-proof="authored" data-by="ai:claude">For record-triggered flows, confirm entry conditions filter early to avoid wasted invocations across 200-record bulk imports.</span>
5. **<span data-proof="authored" data-by="ai:claude">Fault handling.</span>** <span data-proof="authored" data-by="ai:claude">Every flow with DML or callouts must have a fault path that captures and surfaces errors (Principle 1 — failures cannot be silent).</span>

### <span data-proof="authored" data-by="ai:claude">Fail-closed contract</span>

<span data-proof="authored" data-by="ai:claude">Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record</span> <span data-proof="authored" data-by="ai:claude">`<check>=unavailable: <reason>`. An empty success payload is not a pass.</span>

| <span data-proof="authored" data-by="ai:claude">Check</span>    | <span data-proof="authored" data-by="ai:claude">Preferred</span>                                                                | <span data-proof="authored" data-by="ai:claude">Fallback</span>                                                                                                                                            | <span data-proof="authored" data-by="ai:claude">Report line</span>                                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Analyzer</span> | <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <path> --json`</span>                            | <span data-proof="authored" data-by="ai:claude">MCP</span> <span data-proof="authored" data-by="ai:claude">`run_code_analyzer`</span> <span data-proof="authored" data-by="ai:claude">if registered</span> | <span data-proof="authored" data-by="ai:claude">`Analyzer: ...`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`analyzer=unavailable: <reason>`</span>    |
| <span data-proof="authored" data-by="ai:claude">Compile</span>  | <span data-proof="authored" data-by="ai:claude">`sf project deploy start --dry-run --metadata Flow:<FlowApiName> --json`</span> | <span data-proof="authored" data-by="ai:claude">`sf project deploy validate --json`</span> <span data-proof="authored" data-by="ai:claude">with the same scope</span>                                      | <span data-proof="authored" data-by="ai:claude">`Compile: <output>`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`compile=unavailable: <reason>`</span> |

***