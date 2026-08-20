---
name: validation-rule-generate
description: "Generate Salesforce Validation Rule metadata (.validationRule-meta.xml) with correct formula syntax, CDATA-wrapped XML when required, and user-friendly error messages. Use when creating validation rules, enforcing data quality, blocking invalid records at save, or troubleshooting validation deployment errors. Trigger phrases: 'create a validation rule', 'add field validation for', 'block records when', 'enforce that <field> must be', 'add a data quality rule', 'prevent saving when'. Pairs with `validation-rule-reviewer` agent."
argument-hint: "[object name + condition + error message, e.g. 'Account: prevent save when Industry blank and AnnualRevenue > 1M']"
---

# <span data-proof="authored" data-by="ai:claude">/validation-rule-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **Required properties** — read `references/required-properties.md` before acting on this section.
- **Hard constraints** — read `references/hard-constraints.md` before acting on this section.
- **Step 0: Research (Principle 7)** — read `references/step-0-research-principle-7.md` before acting on this section.
- **Workflow** — read `references/workflow.md` before acting on this section.
- **Output report** — read `references/output-report.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Salesforce Validation Rule (.validationRule-meta.xml) with: a fullName under
40 characters, an active=true flag, an errorConditionFormula that returns TRUE to BLOCK
the save, an errorMessage under 255 characters, and CDATA-wrapped formula if the formula
contains XML special characters. Place under
force-app/main/default/objects/<Object>/validationRules/<fullName>.validationRule-meta.xml.
After generation, dispatch `validation-rule-reviewer` for a formula-quality review.
```
