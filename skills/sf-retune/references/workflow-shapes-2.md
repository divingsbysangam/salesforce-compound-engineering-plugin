# Workflow shapes

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Workflow shapes
Each phase has an orchestration shape that fits it, and using the wrong one is the common failure. Read `references/workflow-shapes.md` before dispatching a phase: it covers when to fan out by skill versus by problem, why a shared contract must be authored before a parallel rewrite, and which phases must stay serial.

The one rule worth stating inline: **fan out by disjoint file ownership, never by item.** Items cross files; agents that share a file lose each other's edits.
