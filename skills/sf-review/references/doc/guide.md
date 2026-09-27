# sf-review mode:doc

Review a Salesforce planning document (plan, brainstorm, requirements, `STRATEGY.md`).

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Procedure

1. Read the document and any files it references.
2. Dispatch **one** subagent with `../lenses/doc.md`, `../lenses/contract.md`, and the document path (see `../../../sf-work/references/dispatch/guide.md`). For long or high-risk plans (production data migration, security model changes, managed packages), dispatch a second subagent with the same lens told to act adversarially: construct Salesforce-specific failure scenarios (Bulk API plus UI concurrent saves, automation fan-out into triggers, packaging-time consequences).
3. Merge and dedupe findings per `../subagent-confidence-rubric.md`. Present them grouped by severity with confidence.
4. When a finding needs a decision that changes scope or risk, ask the user with the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini), one question at a time. Fall back to numbered options in chat.

## Related

- Past learnings: `docs/solutions/`, searched by `../../../sf-plan/references/personas/sf-learnings-researcher.md`.
