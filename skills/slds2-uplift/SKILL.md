---
name: slds2-uplift
description: "Migrate Lightning Web Components and Aura components from SLDS 1 to SLDS 2 by running the SLDS linter and fixing every violation type — hardcoded values, deprecated tokens, LWC-token-to-SLDS-hook conversions, and slds class overrides. Use when uplifting components to SLDS 2, fixing linter violations, replacing hardcoded CSS values with SLDS hooks, or migrating LWC tokens. Trigger phrases: 'uplift to SLDS 2', 'migrate to SLDS 2', 'run the SLDS linter', 'fix SLDS violations', 'replace hardcoded CSS with SLDS hooks', 'convert lwc tokens to SLDS hooks', 'no-hardcoded-values', 'no-slds-class-overrides', 'lwc-token-to-slds-hook', 'no-deprecated-tokens-slds1'. Pairs with `lwc-patterns`."
argument-hint: "[component path or directory; defaults to current LWC under force-app/main/default/lwc]"
---

# <span data-proof="authored" data-by="ai:claude">/slds2-uplift</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 5 (taste over typing). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **SLDS 2 hook categories (the namespace)** — read `references/slds-2-hook-categories-the-namespace.md` before acting on this section.
- **Workflow** — read `references/workflow.md` before acting on this section.
- **Output report** — read `references/output-report.md` before acting on this section.
- **Hand off** — read `references/hand-off.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Migrate LWC and Aura components from SLDS 1 to SLDS 2 using @salesforce-ux/slds-linter.
Run with --fix first to auto-fix simple violations. For remaining violations, fix by rule
type with the table below. Always use a fallback value: var(--slds-g-hook, originalValue).
For class overrides, change BOTH .css AND .html (or .cmp) — the markup change is the
commonly-missed step. Skip layout values (100%, auto, 0, inherit, none). Re-run the linter
after fixes; do not declare done until zero errors.
```
