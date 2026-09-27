# <span data-proof="authored" data-by="ai:claude">/lightning-page-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 4 (spec is the artifact), 7 (institutional memory). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Mode:</span>** **<span data-proof="authored" data-by="ai:claude">`--type page`</span><span data-proof="authored" data-by="ai:claude">— single FlexiPage</span>**  <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/mode-type-page-single-flexipage.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Mode:</span>** **<span data-proof="authored" data-by="ai:claude">`--type app`</span><span data-proof="authored" data-by="ai:claude">— complete Lightning app</span>**  <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/mode-type-app-complete-lightning-app.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Forbidden shortcuts (Principle 1)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/forbidden-shortcuts-principle-1.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **Post-generation validation** — read `references/post-generation-validation.md` before acting on this section.

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Lightning page (FlexiPage) OR a complete Lightning app. Two modes:
(--type page) — single FlexiPage. ALWAYS bootstrap with `sf template generate flexipage`
first; never write FlexiPage XML from scratch (region IDs and component configs are too
fragile to hand-author). Then add components.
(--type app) — full LEX app. Orchestrate metadata in dependency order: object → fields →
tab → flexipage → custom application → list view → validation rule → permission set.
Dispatch /metadata-generate for each piece. End with /permission-set-generate to grant
access. Always include a Verification Strategy: how does a user actually exercise this app.
Fail-closed: dry-run deploy the generated metadata. Paste actual output on Compile, or
`compile=unavailable: <reason>` after attempting the fallback.
```

## Cross-skill integration

| Need | Delegate to | Reason |
| --- | --- | --- |
| Object, field, tab, list view, app XML | `sf-generate mode:metadata` | This skill orchestrates; that skill writes schema |
| Permission set for the app | `sf-generate mode:permission-set` | Least-privilege access |
| Validation rules on new objects | `sf-generate mode:validation-rule` | Formula metadata |
| LWC that sits on the page | `sf-work` / `sf-know mode:lwc` | Component implementation |
| Deploy | `sf-deploy mode:cli` | Fail-closed deploy |
| Capture a FlexiPage gotcha | `sf-compound` | Institutional memory |
