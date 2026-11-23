# sf-compound mode:refresh

Audit and refresh institutional knowledge in `docs/solutions/` against the current Salesforce codebase. The report and the corrected document set are the deliverables.

<feature_description>
#$ARGUMENTS
</feature_description>

## Protected-artifact rule (non-negotiable)

`docs/solutions/`, `docs/plans/`, and `docs/brainstorms/` are permanent project records. **Never delete** a learning doc. When content is obsolete, set `status: deprecated` (or `stale`) in YAML frontmatter and leave the file in place. Edits and consolidations are allowed; `rm` and filter-repo are not.

## Salesforce Angle

- Common drift sources: API version bumps (e.g. 60.0 → 66.0), Process Builder → Flow, FLS-by-default / `WITH USER_MODE`, trigger-framework migrations, packaging namespace changes.
- Cross-check claims against `force-app/` (or the project's package directories), Apex tests, Flow metadata, and permission sets — not against generic web advice.

## Mode

If the arguments contain `mode:non-interactive` (or a deprecated `mode:headless` alias), strip those tokens (the remainder is a scope hint) and run **non-interactive**; otherwise run **interactive**.

**Interactive:** apply unambiguous actions directly; ask the user only on genuine judgment calls.

**Non-interactive:** never pause for input. Apply safe actions; when classification is ambiguous, mark stale instead of guessing; the report is the primary deliverable.

## Procedure

1. **Scope** — find `.md` files under `docs/solutions/` (exclude READMEs). Narrow by directory, frontmatter, filename, or keyword when a hint is present; with no hint, process everything. With a hint that matches nothing, report the miss and exit (do not silently widen).
2. **Investigate** — for each doc, verify referenced paths/classes, recommended solution vs current Apex/LWC/Flow, snippets, overlaps, and contradictions. Unverifiable is not false: act only on contradiction.
3. **Classify** with falsifiable gates:

| Outcome | Meaning | Action |
|---------|---------|--------|
| **Keep** | Still accurate | No edit, except clearing an earlier stale mark (see **Earlier stale mark**) |
| **Update** | Solution correct; references drifted | Fix in place |
| **Consolidate** | Heavy overlap, both correct | Merge unique content into the canonical doc; deprecate the subsumed one (`status: deprecated`) — never delete |
| **Replace** | Guidance misleading; successor writable | Write successor, then deprecate the old doc |
| **Deprecate** | No longer useful | Set `status: deprecated` (+ reason/date) — never delete |

**Auto-deprecate gate** (all three must hold; otherwise recommend only): (1) implementation referenced by the doc is gone from the codebase, (2) the problem domain is also gone or clearly superseded by newer in-repo content, (3) inbound markdown citations are absent or purely decorative. Missing files alone prove the *implementation* is gone, not the problem — if the org still deals with the domain, that is Replace, not Deprecate.

**Earlier stale mark.** A doc with `status: stale` was left unsettled by an earlier refresh, and learnings researchers keep surfacing it labeled stale until a refresh settles it. Start from its `stale_reason`. Once this run settles the doc with any action other than another stale mark, no doc that action leaves behind carries `status: stale`, `stale_reason`, or `stale_date`: delete them from a doc that Keep or Update leaves in place (for Keep, this is the one edit it makes), and do not copy them into a successor or a consolidated doc. When the run still cannot settle the doc, keep the mark and rewrite `stale_reason` and `stale_date`. When any doc was marked stale, say in the report that learnings researchers keep surfacing those docs, labeled stale, until a refresh or a person settles them.

**Citation basis.** Judge a learning's code citations against the repository's default branch, where the learning lives, not against a working tree that may hold unmerged work. A citation that matches the default branch has not drifted. When a cited line number no longer points at what the learning describes, cite the class, method, or metadata element that defines it instead of a new line number. A cited line past the end of its file is flagged by `scripts/validate-doc-claims.py`. A successor doc follows the same rule.

**Named guidance.** When a learning links a skill, a runbook, or a root instruction file, read that file. If it states a different order or a contradictory rule for the same situation, classify that contradiction. Do not treat the link as decoration. Frontmatter uses this repo's `schema.yaml` categories; do not rename them to match an older generic list.

**Retirement condition.** When frontmatter has `retire_when`, check that condition the way the field says (release notes, the API version in `sfdx-project.json`, a dependency the repo pins). Record the result in the report. Do not invent a condition for a learning that declares none. A met condition is evidence the premise is gone, not proof the workaround code is safe to delete. When the repo still contains the workaround, Keep or Update the doc and put the removal under **Recommended**. An unmet condition decides nothing. A condition that could not be checked is unverifiable, not false.

**Two boundaries.** This mode never changes product code. A claim about current mechanics follows current Apex, LWC, or Flow, so the doc changes. Guidance that still has independent support — a governor-limit rule, a CRUD/FLS requirement, a skill the repo still ships — does not become false merely because one implementation drifted. Separate that descriptive drift (Update) from a recommendation that no longer governs (Replace, and only when a trustworthy successor can be written).

In non-interactive mode the report is the sole deliverable and is not abbreviated. **Applied** lists writes that succeeded. **Recommended** lists writes the gates withheld.

**Relocation four-condition gate** (non-interactive auto-move): frontmatter and directory disagree; content clearly says the directory is wrong; target category directory exists; inbound citations are in-repo and mechanically rewritable. Otherwise recommend.

4. **Decide / Execute** — interactive asks only on genuine forks; non-interactive applies gates or stale-marks. Never restructure category trees as a side effect.
5. **Report** — per-doc Applied vs Recommended sections with evidence. The report is the deliverable even when every write succeeds.

## Related

- Capture new learnings: `sf-compound`
- Protected paths: `CLAUDE.md`, `PRINCIPLES.md` §7
