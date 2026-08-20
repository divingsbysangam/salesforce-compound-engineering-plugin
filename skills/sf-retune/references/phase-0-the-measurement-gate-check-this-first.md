# Phase 0: the measurement gate — check this first

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Phase 0: the measurement gate — check this first
This skill cannot run without a way to observe behavior. Check for all three, and name whichever is missing:

1. **A run archive or a harness that produces one** — per-run logs carrying the tool-call trace, a terminal marker, token counts, and the final message.
2. **A build selector** — the harness can point a run at a specific source checkout of the corpus (a `--plugin-dir`-style override, a configurable skills path, an env var), so two builds are comparable under one runner.
3. **A repeatable task** the corpus actually executes end to end.

If any is missing, **stop and say so**, naming what to build. Do not fall back to a static audit and present it as retuning: an audit can say what looks cuttable and can never say whether cutting helped, which is the error this skill exists to prevent. An audit-only pass is a legitimate thing to want; it is a different request.

State the target model and the harness you found before continuing.

