# Size and structure

Read this before splitting or shortening a skill.

The 8,000-byte `SKILL.md` ceiling is a host injection limit, not a target. A body under the ceiling can still be too long when it front-loads procedure the run will not use. `bun run lint` enforces the ceiling; it does not reward a smaller file.

Savings come from structure. Move a phase's procedure into `references/` and name that file at the step that needs it. Squeezing sentences until a rule becomes absolute is a defect: the shortened rule must still say the condition it had. "Never re-enter an earlier phase" is wrong when the real rule is "do not redo a phase whose checkpoint already exists."

A required read named at the acting step is followed. A file mentioned once, far from the step, is not. A read made before the phase starts does not satisfy the acting-point read.

Do not relocate a stop, a status spelling a caller branches on, or a protected-path rule out of the always-loaded body. If the body no longer states it, a run that never opens the reference drops it.

When shared blocks already fill the ceiling, say so and name the block. Do not delete a safety rule to hit a number.

A check of a skill that delegates is sized to the decision, not the whole workflow. The receipt is an artifact the callee wrote (a file, or a structured return). A model-authored trailer is not that receipt. A stand-in that never invokes the callee does not validate the delegation.

Descriptions are context pointers: trigger phrases, plus which sibling owns the adjacent job. They do not summarize step counts or phase counts.
