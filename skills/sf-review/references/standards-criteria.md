# Repo-owned review criteria

Read with `step-2-dispatch-review-personas-in-parallel.md`. Paths, not file contents.

## What counts

Candidates are `CODING_STANDARDS.md`, `CLAUDE.md`, and `AGENTS.md` at any depth in the tree under review. Keep a file whose directory is an ancestor of a changed file. A root file governs the checkout. `force-app/main/default/classes/CLAUDE.md` governs only classes under that directory.

`CODING_STANDARDS.md` is the designated source. An instruction file supplies criteria only for a changed file that no `CODING_STANDARDS.md` governs. No changed file is graded against both kinds. A changed file with no governing criteria file is a complete result, not a gap.

The content is the contract, not the format. Prose, bullets, tables, and nested headings all count, with or without frontmatter. A skill checklist does not apply to an Apex class. A commit-convention section does not apply to an LWC template.

## Scope

Enumerate candidates from the tree under review. In a local checkout, that is the workspace. When the review names a pull-request head that is not the working tree, read the criteria files from that head. Do not use Read on workspace paths for a remote head.

On a search failure or an uncertain scope, still dispatch `architecture` and say what is uncertain. An error is never an empty mapping.

## What the lens receives

Pass a `<standards-paths>` block: each criteria file, then the changed files it governs. The architecture lens applies that pairing. It does not invent rules, and it does not review the criteria files themselves.

A general quality complaint with no rule in those files ("this class is long") is not a standards finding. Governor, CRUD/FLS, and sharing gates still come from their own lenses.
