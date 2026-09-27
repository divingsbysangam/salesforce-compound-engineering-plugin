# <span data-proof="authored" data-by="ai:claude">/validation-rule-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Required properties</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/required-properties.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hard constraints</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hard-constraints.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 0: Research (Principle 7)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-0-research-principle-7.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Workflow</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/workflow.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Output report</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/output-report.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Salesforce Validation Rule (.validationRule-meta.xml) with: a fullName under
40 characters, an active=true flag, an errorConditionFormula that returns TRUE to BLOCK
the save, an errorMessage under 255 characters, and CDATA-wrapped formula if the formula
contains XML special characters. Place under
force-app/main/default/objects/<Object>/validationRules/<fullName>.validationRule-meta.xml.
After generation, fail-closed validate with sf code-analyzer then a metadata dry-run.
Dispatch `validation-rule-reviewer`. Paste actual tool output on Analyzer / Compile lines,
or `<check>=unavailable: <reason>` after attempting the fallback.
```

## Cross-skill integration

| Need                                    | Delegate to         | Reason                                   |
| --------------------------------------- | ------------------- | ---------------------------------------- |
| Object / field does not exist yet       | `sf-generate mode:metadata` | Rule XML cannot reference missing schema |
| Record-triggered Flow instead of a rule | `sf-generate mode:flow`     | Automation, not save-blocking formula    |
| Apex `addError` / domain validation     | `sf-generate mode:apex`     | Code-path validation                     |
| Deploy the rule                         | `sf-deploy mode:cli`            | Fail-closed deploy                       |
| Capture a formula gotcha                | `sf-compound`       | Institutional memory                     |