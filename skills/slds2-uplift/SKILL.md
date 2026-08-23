---
name: slds2-uplift
description: "Migrate Lightning Web Components and Aura components from SLDS 1 to SLDS 2 by running the SLDS linter and fixing every violation type — hardcoded values, deprecated tokens, LWC-token-to-SLDS-hook conversions, and slds class overrides. Use when uplifting components to SLDS 2, fixing linter violations, replacing hardcoded CSS values with SLDS hooks, or migrating LWC tokens. Trigger phrases: 'uplift to SLDS 2', 'migrate to SLDS 2', 'run the SLDS linter', 'fix SLDS violations', 'replace hardcoded CSS with SLDS hooks', 'convert lwc tokens to SLDS hooks', 'no-hardcoded-values', 'no-slds-class-overrides', 'lwc-token-to-slds-hook', 'no-deprecated-tokens-slds1'. Do NOT trigger for new LWC feature work (`lwc-patterns` / `sf-work`), UI taste without a linter pass (`sf-polish`), Apex (`apex-generate`), or FlexiPages (`lightning-page-generate`)."
argument-hint: "[component path or directory; defaults to current LWC under force-app/main/default/lwc]"
---

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
| LWC conventions / wire / a11y reference | `lwc-patterns`            | Reference, not migration |
| Taste / copy / WCAG polish after tokens | `sf-polish`               | Uplift is linter-driven  |
| New component, not a migration          | `sf-work`                 | Feature implementation   |
| FlexiPage / app UI shell                | `lightning-page-generate` | Metadata, not CSS tokens |
| Capture a hook-selection judgment       | `sf-compound`             | Institutional memory     |