# When to use

Read with `flow-generate/SKILL.md`. Procedure lives here.

## When to use
Use for any Flow type:

* **Screen Flow** — user-guided, multi-step data collection

* **Autolaunched Flow** — background processing, called from Apex / Process / button

* **Record-Triggered Flow (before-save)** — same-record field updates, validation

* **Record-Triggered Flow (after-save)** — related-record DML, async actions

* **Scheduled Flow** — recurring or time-based batch automation

If the request is ambiguous between a Flow and an Apex trigger, route via `/sf-brainstorm` first — the declarative-vs-code matrix lives there.

***

