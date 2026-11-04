# Stage 4: REVIEW

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 4: REVIEW

This stage is the review receipt later ship steps require. Do not skip it and do not invent a second pass only to satisfy that gate.

Load `sf-review` from the host catalog's listed path and invoke it once, at comprehensive depth, on the diff this pipeline produced. A host skill named `review` is not this step. Do not invent `skills/review/SKILL.md`, and do not dispatch lenses from this stage — `sf-review` owns that dispatch, including foreground collection of each lens return.

**Done when** you hold a completed result from that invocation: a findings list, including an empty list, or an explicit pass.

**If that invocation cannot produce a receipt** — the cataloged skill fails to load, or the invocation terminates without a usable result — write `Code review skipped: review unavailable` and name the evidence (the load error or the terminal status) in the stage line. A missing Salesforce DX MCP login or target org is not that evidence. The local review still runs.

**Gate:** No Critical or High findings remaining before proceeding. Gate findings abort the pipeline; they are not warnings.
