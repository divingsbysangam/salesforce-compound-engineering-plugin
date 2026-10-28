# sf-ship mode:pr-description

Generate a Salesforce-aware pull request description that scales with change complexity: a focused trigger fix gets a short body; a metadata bundle plus Apex plus LWC plus permission changes gets sectioned with deploy plan and post-deploy verification.

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- **Scope summary**: explicit list of file types touched (`force-app/main/default/classes/`, `lwc/`, `flows/`, `objects/`, `permissionsets/`, `profiles/`).
- **Deploy plan**: target environment(s), validate vs. quick-deploy, dependencies on prior deploys, package.xml or destructive changes.
- **Test plan**: Apex test classes affected, coverage delta, sharing scenarios exercised, mock callouts, manual UI verification needs.
- **Risk callouts**: governor-limit headroom changes, sharing/visibility changes, integration contract changes, permission set delta.

## Framing rules

- Lead with value delivered, not the file list or the steps taken.
- Match conventional-commit type defaults from `sf-ship mode:commit`: prefer `fix:` over `feat:` when ambiguous.
- Preserve existing `Related:` / `Fixes` references on rewrite; never invent closing keywords.
- **Program altitude (multi-PR / series).** When program context is already in hand (user prompt, known plan path, existing PR body, commit messages, or sibling/series language), lead **program → lead-in (if any) → this contribution → lead-out (if any)**. Do **not** invent a series, and do **not** scan all open PRs solely for this step. When program context is absent, keep the single-PR umbrella only.
- Size the body to decision cost: small + simple stays under ~300 characters; Salesforce multi-metadata changes get deploy/test/risk sections; never pad.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time.

## Procedure

1. **Understand the input** — read the `<feature_description>` block and any referenced files, plans, or issues. If rewriting an existing PR, fetch its current body first.
2. **Write the scope map first** — from the full oneline commit list and the final three-dot diff, not from the latest commit, the branch name, or the incident that opened the work. Group material outcomes (one cluster is fine). Name one umbrella: what is now different for someone using this. Note program placement only when that context is already in hand. Write the map down (umbrella, clusters, program or "none") before composing.
3. **Compose title and body** — the title and the opening inherit the map's umbrella. The opening is one or two sentences a reviewer can stop on. Then deploy plan, test plan, and risk callouts when the change warrants them. Include validation notes for observable behavior; never label test output as "Demo" or "Screenshots."
4. **Audit the opening against the written map** — every peer outcome the map names appears at parity. An opening that leads with the first cluster and mentions the others as "also" is rewritten from the map. Every material claim is checkable from the diff or cited evidence; drop inventable series language and unverifiable metrics.
5. **Apply or print** — `gh pr create` / `gh pr edit` in full workflow; print only in description-only mode.

## Related

- Commit conventions: `../commit/guide.md`
- Ship + babysit handoff: `../pr/guide.md`

## Scannable medium and large bodies

The opening is one or two sentences: what is different now, and the gap it closes. A reviewer who stops there should know what the pull request does. Later sections exist only when each answers a remaining question (deploy plan, test plan, risk, a design choice). Cut a section that restates the diff. A before/after table is for observable behavior, not for a file list.
