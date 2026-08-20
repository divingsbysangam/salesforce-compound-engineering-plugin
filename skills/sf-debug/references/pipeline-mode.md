# sf-debug — pipeline mode (non-interactive)

Loaded when `sf-debug` is invoked with `mode:pipeline` by `sf-babysit-pr` or `sf-lfg`. Investigation rigor is unchanged; only interaction and fix authority change.

## Authority

Mutate under the inherited envelope: **actions** = fix / commit / push on the current branch; **exclusions** = merge, rebase, force-push, approve a gated CI run. Narrow (defer as `needs-human`) but never broaden.

## Non-interactive overrides

- Do not ask the user to paste content if an issue fetch fails — proceed with what you have.
- There is no "diagnosis only" question. Fix **convergent** defects (real bugs vs planned/tested intent). Defer product/API/UX decisions as `needs-human`.
- Operate on the current branch. Commit `fix(ci): …` or `fix: …` and push when the envelope allows. Never weaken a failing assertion to make CI green.
- Skip simplify/review nesting; keep tests. Emit the structured return below.

## Structured return

```json
{
  "status": "fixed-and-pushed | fixed-not-pushed | diagnosed-no-fix | flaky-infra | needs-human",
  "summary": "<one line>",
  "root_cause": "<causal chain, brief>",
  "changed_files": ["..."],
  "head_sha": "<sha when a fix commit exists>",
  "residuals": [ { "title": "...", "decision_context": "...", "thread": "<url|null>" } ]
}
```
