# Direct and Chat brief

Read this only after `sf-plan/SKILL.md` selects Direct or Chat brief. A Durable plan does not read this file.

Both tiers are delivered in chat. Nothing is written under `docs/plans/` unless the user asks for a file. No research subagent, no document review, and no handoff menu. `sf-plan` still does not implement.

## Direct

Say what changes, where (object, field, class, or flow), and how it is verified (the assertion, the `sf` command, or the dry-run). Then one line: hand it to `sf-work`, or the user makes the change. Invoke `sf-work` with that statement only when the user accepts. Done when the statement and the offer are in chat.

## Chat brief

Deliver, in chat:

- what changes and why, in a few sentences
- the implementation units, each with its files and its test expectations (bulk, sharing, or governor check when the change can trip one)
- one decisions line when the request already settled a choice the implementer must honor, otherwise none

Close with one line offering to save the brief or hand it to `sf-work`. "Proceed" hands the brief to `sf-work` as its prompt.

## Saving a brief

Write plain markdown under `docs/plans/` using the same filename shape as a plan, with frontmatter `title`, `type`, and `date` only. Reserve the path with an exclusive create; on collision add the smallest numeric suffix. Do not set a readiness field that would tell `sf-work` or `sf-lfg` the file is a full plan. A request for the full plan floor is a Durable request: re-enter `sf-plan` on the Durable path.
