# Stage 3.5: VERIFY (independent)

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 3.5: VERIFY (independent)
Dispatch `sf-implementation-verifier` (persona under `../sf-review/references/personas/`) as an isolated, read-only subagent with a clean context. It independently re-runs the 5 System-Wide Test Check questions against the diff and returns PASS/FAIL per question with pasted evidence — it does not trust the implementer's self-report.

**Gate:** independent verification returns PASS on all 5 questions (overall GO) before proceeding to Review.

***

