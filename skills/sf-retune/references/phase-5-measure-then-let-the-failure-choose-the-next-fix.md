# Phase 5: measure, then let the failure choose the next fix

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Phase 5: measure, then let the failure choose the next fix
After each pass, run the harness and read **where** it failed, not just whether it did.

A failure that moves to a later phase is progress and names the next target. A failure at the same site means the fix missed. A run that completes the task while skipping the workflow is a different defect than a halt, and only shows up if Phase 1's two metrics stayed separate.

Loop Phase 4 and 5 until the registered bar is cleared. Then stop; a bar cleared is done.

**Audit the phases the instrument cannot reach.** A probe that skips a phase can never fail in it, so a green streak certifies only what it exercised. List the phases your task never enters, read those files, and treat what you find there as equal in weight to what the runs found. Some of the most consequential defects live where no test looks.

**Report the limit.** Name the paths that remain unmeasured and what would be needed to measure them. Do not let a cleared bar imply coverage it does not have.

