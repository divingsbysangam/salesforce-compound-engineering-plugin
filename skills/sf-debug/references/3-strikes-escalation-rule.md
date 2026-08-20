# 3-strikes escalation rule

Read with `sf-debug/SKILL.md`. Procedure lives here.

## 3-strikes escalation rule
After **3 failed** trigger or governor-limit patch attempts on the same symptom, **STOP**. Do not propose patch #4. Three failed patches is a quantitative signal that the problem is architectural, not local — convert it into a qualitative gate: ask whether this needs an asynchronous architecture change (Queueable, Batch Apex, or Platform Events) or a fundamentally different design, and surface that question to the human via the blocking question tool. Escalating early is cheaper than a fourth guess.

