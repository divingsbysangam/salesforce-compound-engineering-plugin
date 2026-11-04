# After Implementation

Read with `sf-work/SKILL.md`. Procedure lives here.

## After Implementation
When implementation is complete:

```
Implementation complete.

Files created/modified:
- [list of files]

System-Wide Test Check:
✅ Trigger contexts: [handled/not applicable]
✅ Bulk tests: [included/not applicable]
✅ Governor limits: [tested/not applicable]
✅ Sharing scenarios: [covered/not applicable]
✅ Integration mocks: [mocked/not applicable]

Next: /sf-review
```

## Shipping gate

Standalone `sf-work` is not done, and must not call `sf-ship mode:pr` or `sf-ship mode:commit`, until one of these is true:

1. **Review receipt.** `/sf-review` finished through the host skill invocation and you hold a completed result (findings list, including an empty list, or an explicit pass).
2. **Skip phrase**, written in the summary as exactly one of: `Code review skipped: mechanical diff`, `Code review skipped: review unavailable`.

`Code review skipped: review unavailable` is allowed only after the cataloged `sf-review` definition fails to load, or a top-level invocation of that skill has terminated without a completed receipt. The same summary names that evidence (the load error, or the invocation's terminal status). A missing Salesforce DX MCP login, a missing target org, or an empty optional peer config is not that evidence — the local lens pass still runs. Do not write the phrase because a review was not attempted.

Mechanical means formatting, dependency version bumps, lint-only edits, or generated artifacts. A behavior change in Apex, LWC, a Flow, or a permission set is not mechanical. Removing a concrete failing shape from a skill (the SOQL-in-a-loop snippet a rule named) is a behavior change, not a wording cleanup. "I looked at the diff" is not a receipt.

Load `sf-review` from the host catalog's listed path. A host skill named `review` is not this step. Do not invent `skills/review/SKILL.md` under this plugin.

`/sf-lfg` satisfies the receipt with its review stage. Do not run a second review only to mint a phrase.

If the project's active instructions already name a ship process (a skill, a checklist, or a required command sequence), that process owns commit, push, and the pull request. The receipt or skip phrase is still required before that process runs. Pass pre-existing dirty paths this run did not change as paths to leave uncommitted.
