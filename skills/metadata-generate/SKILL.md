---
name: metadata-generate
description: "Generate Salesforce metadata XML — custom objects, custom fields, custom applications, custom tabs, list views, and custom Lightning types. Single skill that takes a `--type` argument and produces the right metadata file with all required attributes, sharing-model rules, and naming conventions baked in. Use when creating any of these metadata types. Trigger phrases: 'create a custom object', 'add a field to', 'generate a Lookup field', 'create a Master-Detail relationship', 'set up a Roll-up Summary', 'add a custom application', 'create a tab for', 'create a list view filtered by', 'define a Custom Lightning Type'. Pairs with `metadata-consistency-checker` agent."
argument-hint: "--type <object|field|app|tab|listview|lightning-type> + the metadata-specific args (e.g., --object Account --field-name Industry__c --field-type Text)"
---

# <span data-proof="authored" data-by="ai:claude">/metadata-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 4 (spec is the artifact), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **Universal step 0: Research (Principle 7)** — read `references/universal-step-0-research-principle-7.md` before acting on this section.
- **Type: `object` — CustomObject** — read `references/type-object-customobject.md` before acting on this section.
- **Type: `field` — CustomField** — read `references/type-field-customfield.md` before acting on this section.
- **Type: `app` — CustomApplication (Lightning App)** — read `references/type-app-customapplication-lightning-app.md` before acting on this section.
- **Type: `tab` — CustomTab** — read `references/type-tab-customtab.md` before acting on this section.
- **Type: `listview` — ListView** — read `references/type-listview-listview.md` before acting on this section.
- **Type: `lightning-type` — CustomLightningType (CLT)** — read `references/type-lightning-type-customlightningtype-clt.md` before acting on this section.
- **Universal post-generation validation (every type, Principle 2)** — read `references/universal-post-generation-validation-every-type-principle-2.md` before acting on this section.
- **Output report** — read `references/output-report.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate Salesforce metadata XML for one of: CustomObject, CustomField, CustomApplication,
CustomTab, ListView, CustomLightningType. Read the type-specific section below for required
attributes, sharing-model rules, and forbidden elements. Always write to the canonical
project path (force-app/main/default/<type>/...). Always include description and
inlineHelpText for fields. After generation, dispatch `metadata-consistency-checker` for a
cross-metadata review. Hard-stop on any forbidden element — these cause silent deploy
failures.
```
