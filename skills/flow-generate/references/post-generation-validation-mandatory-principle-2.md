# Post-generation validation (mandatory, Principle 2)

Read with `flow-generate/SKILL.md`. Procedure lives here.

## Post-generation validation (mandatory, Principle 2)
Once the pipeline returns XML, do **not** declare success without these checks:

1. **Persist the metadata.** Save under `force-app/main/default/flows/<FlowApiName>.flow-meta.xml`.
2. **Static analysis.** Run `sf code-analyzer run --target <path> --json` and remediate sev0/sev1/sev2.
3. **Parallel review agents** (Principle 1):

   * Task `flow-governor-monitor(flow_xml)` — verifies no DML/SOQL in loops, fault paths present

   * Task `flow-complexity-analyzer(flow_xml)` — flags excessive branching, unbounded loops

   * Task `process-automation-strategist(flow_xml)` — confirms Flow vs Apex was the right call
4. **Bulk-safe entry.** For record-triggered flows, confirm entry conditions filter early to avoid wasted invocations across 200-record bulk imports.
5. **Fault handling.** Every flow with DML or callouts must have a fault path that captures and surfaces errors (Principle 1 — failures cannot be silent).

***

