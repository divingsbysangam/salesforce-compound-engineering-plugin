# Phase 1: mine the archive before spending a run

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Phase 1: mine the archive before spending a run
Historical runs are a free baseline, usually larger than any experiment affordable this week. Read `references/baseline-mining.md` and follow it.

It carries the outcome taxonomy, the fields to extract, and the two corrections that decide whether the baseline is usable at all:

- **Broken runs are a first-class outcome, not a failure.** Empty transcripts and error exits score as model failures and silently inflate every effect. Exclude them and check whether they land evenly across arms; a lopsided split is a harness fault wearing a model-effect costume.
- **Track "followed the process" and "did the job" separately.** A run can complete the task while skipping the workflow entirely. Collapsed into one number, that reads as success.

