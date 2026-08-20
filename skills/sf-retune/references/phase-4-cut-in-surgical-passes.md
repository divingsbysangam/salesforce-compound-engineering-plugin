# Phase 4: cut in surgical passes

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Phase 4: cut in surgical passes
One problem per agent, each owning a disjoint file set so parallel work cannot collide. Read `references/cut-passes.md` for the loop, the isolation rules, and the shared-asset trap.

`references/halt-taxonomy.md` carries the regression classes to hunt, with the before and after of each. Load it when the symptom is stalling, halting, or a run that ends while naming work it did not do. Every one of those classes reduces to prose written as if a second party were waiting, and the fix is never to add capability.

Discipline that survives contact:

- **Fix at the smallest owning layer.** Reword only when rewording is the smallest mechanism; prefer deleting the structure that made the wording necessary.
- **Field names, enums, greppable markers and security guards are data.** They stay. What goes is the justification clause around them that teaches the model a separate consumer is waiting.
- **Not every stop is the enemy.** Some workflows exist to stop and ask; that is the product. Sort every stop by who is actually on the other side before touching it.
- **Never edit tests to make a suite green.** A removed string a test pins is a finding to report, not a test to weaken.

