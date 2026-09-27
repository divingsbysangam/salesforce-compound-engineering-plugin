# <span data-proof="authored" data-by="ai:claude">/agentforce-observe</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">7 (outsource thinking, not understanding), 3 (jagged intelligence in production), 5 (taste / drift detection), 1 (preserve the quality ceiling). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

* **When to use this skill** — read `references/when-to-use-this-skill.md` before acting on this section.

* **Inputs to gather before starting** — read `references/inputs-to-gather-before-starting.md` before acting on this section.

* **Phase 0: Discover the Data Space** — read `references/phase-0-discover-the-data-space.md` before acting on this section.

* **Phase 1: Observe — query STDM (preferred path)** — read `references/phase-1-observe-query-stdm-preferred-path.md` before acting on this section.

* **Phase 1-ALT: Fallback when STDM is unavailable** — read `references/phase-1-alt-fallback-when-stdm-is-unavailable.md` before acting on this section.

* **Phase 2: Reproduce — live preview, 3-run classification** — read `references/phase-2-reproduce-live-preview-3-run-classification.md` before acting on this section.

* **Phase 3: Improve — edit the** **`.agent`** **file directly** — read `references/phase-3-improve-edit-the-agent-file-directly.md` before acting on this section.

* **Capture learnings** — read `references/capture-learnings.md` before acting on this section.

* **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Improve a deployed Agentforce agent using session-trace evidence. Three phases: (1) Observe
— query STDM session traces from Data Cloud (or fall back to sf agent test + sf agent preview
--authoring-bundle when STDM is unavailable); (2) Reproduce — re-run problematic conversations
in sf agent preview, classify CONFIRMED / INTERMITTENT / NOT REPRODUCED across 3 runs; (3)
Improve — edit the .agent file with targeted fixes, validate, publish, activate, then verify
in preview and post 24-48h re-run Phase 1 against baseline. Always pass --json on every sf
CLI command. Always re-run safety probes after any fix. Fail-closed: if STDM cannot run,
use Phase 1-ALT and record `stdm=unavailable: <reason>` — do not invent production
evidence. If preview also cannot run, stop; do not mark the issue reproduced.
```

## Cross-skill integration

| Need                                  | Delegate to                       | Reason                              |
| ------------------------------------- | --------------------------------- | ----------------------------------- |
| Author or republish the `.agent` file | `sf-generate mode:agent`              | Observe proposes; develop publishes |
| Add a regression suite for the fix    | `sf-generate mode:agent-test`                 | Repeatable probes                   |
| Apex/Flow backing bug                 | `sf-generate mode:apex` / `sf-generate mode:flow` | Code, not script                    |
| Capture a production misroute pattern | `sf-compound`                     | Institutional memory                |