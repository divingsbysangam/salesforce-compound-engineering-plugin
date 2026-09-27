# <span data-proof="authored" data-by="ai:claude">/slds2-uplift</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">SLDS 2 hook categories (the namespace)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/slds-2-hook-categories-the-namespace.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Workflow</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/workflow.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Output report</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/output-report.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hand off</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hand-off.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Migrate LWC and Aura components from SLDS 1 to SLDS 2 using @salesforce-ux/slds-linter.
Run with --fix first to auto-fix simple violations. For remaining violations, fix by rule
type with the table below. Always use a fallback value: var(--slds-g-hook, originalValue).
For class overrides, change BOTH .css AND .html (or .cmp) — the markup change is the
commonly-missed step. Skip layout values (100%, auto, 0, inherit, none). Fail-closed:
re-run the linter, then existing Jest tests. Paste actual output on Linter / Tests lines,
or `<check>=unavailable: <reason>` after attempting the fallback. Do not declare done
until zero linter errors.
```

## Cross-skill integration

| Need                                    | Delegate to               | Reason                   |
| --------------------------------------- | ------------------------- | ------------------------ |
| LWC conventions / wire / a11y reference | `sf-know topic:lwc`            | Reference, not migration |
| Taste / copy / WCAG polish after tokens | `sf-review mode:polish`               | Uplift is linter-driven  |
| New component, not a migration          | `sf-work`                 | Feature implementation   |
| FlexiPage / app UI shell                | `sf-generate type:lightning-page` | Metadata, not CSS tokens |
| Capture a hook-selection judgment       | `sf-compound`             | Institutional memory     |