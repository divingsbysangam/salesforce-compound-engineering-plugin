# File-Based Todos Skill

Track project tasks as individual markdown files in the `todos/` directory. Each file is a self-contained task with status, priority, and context.

## File Naming Convention

```
todos/{issue}-{status}-{priority}-{description}.md
```

| Segment         | Values                                            | Example                          |
| --------------- | ------------------------------------------------- | -------------------------------- |
| `{issue}`       | Issue/ticket number or `local`                    | `GH-42`, `LIN-15`, `local`       |
| `{status}`      | `pending`, `active`, `done`, `blocked`            | `active`                         |
| `{priority}`    | `p0`, `p1`, `p2`, `p3`                            | `p1`                             |
| `{description}` | Kebab-case summary (3-5 words)                    | `fix-soql-in-trigger`            |

### Examples

```
todos/GH-42-active-p0-fix-soql-in-trigger.md
todos/local-pending-p1-add-bulk-tests.md
todos/LIN-15-done-p2-update-sharing-rules.md
todos/local-blocked-p1-waiting-on-api-access.md
```

## Todo File Template

```markdown
---
issue: {issue_id}
status: {pending|active|done|blocked}
priority: {p0|p1|p2|p3}
created: YYYY-MM-DD
updated: YYYY-MM-DD
blocked_by: {optional - what's blocking}
related_files:
  - {file_path}
tags: ["{tag1}", "{tag2}"]
---

# {Task Title}

## Description
{What needs to be done}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}

## Notes
{Any context, links, or decisions}

## Log
- {date}: {update}
```

## Status Transitions

```
pending → active → done
    │         │
    │         └→ blocked → active → done
    └→ blocked → pending → active → done
```

## Priority Levels

| Priority | Meaning                                    | Response Time  |
| -------- | ------------------------------------------ | -------------- |
| `p0`     | Critical — production issue or blocker     | Immediate      |
| `p1`     | High — needed for current sprint/iteration | This week      |
| `p2`     | Medium — important but not urgent          | Next sprint    |
| `p3`     | Low — nice to have, backlog                | When available |

## Common Operations

### Create a todo

```bash
# Create new todo file
touch "todos/local-pending-p1-add-bulk-tests.md"
```

### List all active todos

```bash
ls todos/*-active-*.md
```

### List by priority

```bash
ls todos/*-p0-*.md  # Critical
ls todos/*-p1-*.md  # High
```

### Move to done

```bash
# Rename: change status segment
mv todos/GH-42-active-p0-fix-soql.md todos/GH-42-done-p0-fix-soql.md
```

### Find blocked todos

```bash
ls todos/*-blocked-*.md
```

## Integration with Workflow

Only one integration is wired today; the rest is available for skills to adopt.

* **`/sf-lfg` gates on open p0 todos.** At the Stage 3 (WORK) → Stage 4 (REVIEW) boundary, `/sf-lfg` refuses to advance while any `p0` file-todo is still `active` or `blocked` (checked with `ls todos/*-active-p0-*.md todos/*-blocked-p0-*.md`). An open critical todo at that boundary is an abort condition (Principle 2). This is the only skill that currently reads `todos/`.

* **Handoff helpers.** `scripts/sf-task-brief <plan-file> <U-ID>` extracts a single implementation unit's section from a plan so a dispatched subagent gets a bounded brief; `scripts/sf-review-package [base-ref]` builds a changed-files header plus a wide `git diff` for piping into a review persona. Both emit fresh, bounded context to stdout instead of relying on a stale paste.

* **Available for use by** `/sf-plan`, `/sf-work`, `/sf-review`, and `/sf-compound`. These skills do not read or write `todos/` today — adopt this convention when a workflow needs durable, file-based task tracking (create todos during planning, flip status during work, capture review findings, archive on compound).

## Cleanup

Periodically move completed todos to an archive:

```bash
mkdir -p todos/archive
mv todos/*-done-*.md todos/archive/
```
