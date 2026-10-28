# sf-ship mode:resolve-feedback

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see `../../../sf-work/references/dispatch/guide.md` for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The thread-resolver it spawns is the `sf-pr-comment-resolver` persona (a writer) at `references/personas/sf-pr-comment-resolver.md`, dispatched one per thread or thread-group — mind the same-file-conflict check when two threads touch one file.

Dispatch sub-agents to evaluate each review thread, classify validity, implement the fix, and respond. Each thread is processed in parallel with metadata-diff awareness.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* Distinguish style-preference comments from governor-limit / FLS / sharing correctness comments.

* When fix touches metadata (object, field, profile, permset), include the metadata XML diff in the resolution and re-run the affected Apex tests via `sf apex run test`.

* When fix touches a trigger or handler, verify the bulk test still passes against 200+ records.

* When fix involves a callout, confirm Named Credential and `Test.setMock` coverage remain aligned.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## What to judge

Judge every open request on the PR, not only inline review threads:

- inline comments from `gh api repos/{owner}/{repo}/pulls/{pr}/comments`
- top-level comments from `gh api repos/{owner}/{repo}/issues/{pr}/comments`
- review submission bodies from `gh api repos/{owner}/{repo}/pulls/{pr}/reviews`

A top-level "please rename this field" or a Changes-Requested body with no inline thread is still feedback. Empty bodies and this run's own replies are not new requests.

## Replies stay out of pending reviews

Post a thread reply with `scripts/reply-to-pr-thread` (REST `POST .../pulls/{pr}/comments/{id}/replies`, body on stdin). Do not call GraphQL `addPullRequestReviewThreadReply`: that mutation can attach the reply to a pending review and report success before anyone can see it. If a review with state `PENDING` exists after the post, stop. Do not resolve the thread, do not submit the review, and do not discard it.

## needs-human

Fix a correctness comment (governor limits, CRUD/FLS, sharing, bulk) when the evidence agrees. A product call, a sharing-model change, a data migration, or a reversal of behavior the PR set out to ship is `needs-human`. Compose this object once and do not summarize it away:

```yaml
type: needs-human
sources: [{ kind: thread|comment|review, id: "...", url: "..." }]
decision_context:
  quoted_feedback: "..."
  investigation: "..."
  decision_reason: "..."
  options: [{ option: "...", tradeoff: "..." }]
  recommendation: "..."
thread_urls: []
```

Leave every covered thread open. Under `mode:pipeline`, return that object to the caller. The posted reply carries the decision context; it is not a completed handoff by itself, and it must not live only inside a pending review.

## Procedure

1. Fetch inline threads, top-level comments, and review bodies.
2. Classify each item: fix, reply, or `needs-human`.
3. Apply Salesforce fixes one item at a time and re-run the affected Apex tests (`sf apex run test`) when the fix touches a class, trigger, or flow.
4. Reply through `scripts/reply-to-pr-thread`. Resolve a thread only after a submitted reply is visible and the item is not `needs-human`.

## Related

* Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).

* Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.

## Instruction prose

When the file under review is a skill, a persona, or a project rule, a case the stated condition already decides is not a code change. Quote the condition and reply. Change the text only when the condition itself is wrong or missing, or the rule sits in the wrong file. On a second round against the same block, restate the goal, the done condition, and the safe direction once, instead of appending another special case. Apex, LWC, Flow, and metadata in the same pull request keep ordinary fixes.