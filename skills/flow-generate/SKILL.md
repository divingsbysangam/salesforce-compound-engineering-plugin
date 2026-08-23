---
name: flow-generate
description: "Generate Salesforce Flow metadata (Screen / Autolaunched / Record-Triggered before-save and after-save / Scheduled) using the MCP `execute_metadata_action` pipeline (fetchGroundedObjectMetadata → flowElementSelection → flowElementGeneration). Use this skill for any Flow generation. Trigger phrases: 'create a flow', 'build a flow that', 'when a record is created send', 'trigger daily at', 'send an email when', 'update the field when', 'automate this with a flow', 'generate flow XML', 'autolaunched flow for'. Do NOT trigger for Apex classes or triggers (`apex-generate` / `apex-trigger-refactor`), validation-rule XML (`validation-rule-generate`), LWC (`lwc-patterns` / `sf-work`), permission sets (`permission-set-generate`), or CLI syntax lookup (`sf-cli`). Pair with `flow-patterns` as reference, not as the generator."
argument-hint: "[flow type and intent, e.g. 'before-save flow on Lead to populate territory' or 'screen flow for case escalation']"
---

# <span data-proof="authored" data-by="ai:claude">/flow-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 4 (spec is the artifact), 2 (verifiability). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">The pipeline is non-negotiable</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/the-pipeline-is-non-negotiable.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 0: Pre-implementation research (parallel, Principle 7)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-0-pre-implementation-research-parallel-principle-7.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Post-generation validation (mandatory, Principle 2)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/post-generation-validation-mandatory-principle-2.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hard constraints (every rule fails the deliverable if violated)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hard-constraints-every-rule-fails-the-deliverable-if-violated.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Output report</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/output-report.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hand off</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hand-off.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Salesforce Flow by running the strict 3-step MCP pipeline. The pipeline IS the
contract: fetchGroundedObjectMetadata → flowElementSelection → flowElementGeneration.
Loop on flowElementGeneration with the same operationId until isComplete=true. Never
hand-write Flow XML. Never skip steps. After XML is returned, validate with
sf code-analyzer, then a dry-run deploy of the Flow. Dispatch flow-governor-monitor +
flow-complexity-analyzer in parallel. Bulkify: no DML/SOQL inside loops. Paste actual
tool output on Analyzer / Compile report lines, or `<check>=unavailable: <reason>` after
attempting the fallback. Never treat a skipped or empty tool result as a pass.
```

## Cross-skill integration

| Need                              | Delegate to                | Reason                            |
| --------------------------------- | -------------------------- | --------------------------------- |
| Flow vs Apex decision still open  | `sf-brainstorm`            | Declarative-vs-code matrix        |
| Pattern lookup                    | `flow-patterns`            | Reference, not generation         |
| Invocable Apex the Flow will call | `apex-generate`            | Backing code                      |
| Validation rule instead of a Flow | `validation-rule-generate` | Save-time formula, not automation |
| Deploy / retrieve                 | `sf-cli`                   | Fail-closed deploy                |
| Capture a Flow gotcha             | `sf-compound`              | Institutional memory              |