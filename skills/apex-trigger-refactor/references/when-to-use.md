# When to use

Read with `apex-trigger-refactor/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">When to use</span>
<span data-proof="authored" data-by="ai:claude">Run this skill when any of the following are true:</span>

* <span data-proof="authored" data-by="ai:claude">The trigger contains SOQL or DML inside a</span> <span data-proof="authored" data-by="ai:claude">`for`</span> <span data-proof="authored" data-by="ai:claude">loop</span>

* <span data-proof="authored" data-by="ai:claude">The trigger has business logic in the trigger body (not delegated to a handler)</span>

* <span data-proof="authored" data-by="ai:claude">The trigger has no recursion guard</span>

* <span data-proof="authored" data-by="ai:claude">The trigger mixes multiple contexts (`isInsert`,</span> <span data-proof="authored" data-by="ai:claude">`isUpdate`,</span> <span data-proof="authored" data-by="ai:claude">`isAfter`,</span> <span data-proof="authored" data-by="ai:claude">`isBefore`) without separation</span>

* <span data-proof="authored" data-by="ai:claude">Test coverage is below 90% on the trigger or its handler</span>

* <span data-proof="authored" data-by="ai:claude">A code review flagged a</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-architect`</span> <span data-proof="authored" data-by="ai:claude">finding</span>

<span data-proof="authored" data-by="ai:claude">If the trigger is already well-architected, do not refactor for taste alone — Principle 5 says taste matters, but Principle 1 + the YAGNI rule say don't refactor what works without a real defect.</span>

***

