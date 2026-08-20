---
name: sf-handoff
tier: workflow
description: Create a session handoff for another agent, or resume, find, and read any user-selected continuity source. Use when Salesforce work or conversation about Apex, LWC, Flow, org, or metadata changes must continue without access to the current session history.
argument-hint: "[create [focus] | resume [source or keywords]]"
---

# Handoff

Preserve enough session context for a fresh agent to orient quickly, then keep the user in control of what happens next.

Creation and resume are deliberately open at their edges. The managed store and `sf-handoff/v1` metadata are defaults that make SFCE-created handoffs easy to find; they do not restrict where a handoff may be created or what a user may resume from. A resume source may come from any person, agent, or system and may use any readable format.

A bare invocation always creates a handoff. `create [focus]` creates one. `resume [source or keywords]` reads an explicit source or discovers candidates. Natural-language create/resume intent follows the same routes.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Route the invocation** — read `references/route-the-invocation.md` before acting on this section.
- **Create** — read `references/create.md` before acting on this section.
- **Resume** — read `references/resume.md` before acting on this section.
