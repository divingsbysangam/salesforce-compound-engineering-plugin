# Contributing to SF Compound Engineering

Thanks for contributing.

## How to Contribute

1. Fork the repository.
2. Create a branch (`git checkout -b feature/my-change`).
3. Make and test your changes.
4. Open a pull request with a clear description.

## Project Structure

```text
sf-compound-engineering-plugin/
├── .claude-plugin/              # Plugin metadata (Claude plugin-first)
├── skills/                      # 68 skills + index.md (agentless personas live under skills)
├── cli/                         # Bun installer and Tend feed runtime
├── tests/                       # Prompt-triggering and validation checks
├── sfce.py                      # Optional CLI bootstrap/update utility
├── pyproject.toml               # Packaging metadata
├── README.md
└── CONTRIBUTING.md
```

## Command Authoring Guidelines

- Keep prompts concise and selective in context use.
- Route through `skills/index.md`; V3.1 is agentless and specialist personas live under their owning skill.
- Prefer guidance language (`prefer`, `consider`) over rigid mandates.
- Keep Salesforce-native options first; use external research when needed.

## Frontmatter Requirements

### Skill Frontmatter

```yaml
---
name: some-name
description: Short description
---
```

### Skills

Each `skills/*/SKILL.md` must include frontmatter with `name` and `description`. Specialist personas are markdown assets under their owning skill and do not register as standalone agents.

## Testing

Run these checks before opening a PR:

```bash
python -m py_compile sfce.py __init__.py
python sfce.py --help
cd cli && bun run typecheck && bun test && bun run lint -- ..
```

Optional CLI smoke test:

```bash
mkdir /tmp/sfce-test && cd /tmp/sfce-test
python /path/to/sfce.py init . --ai claude
```

## Discipline-gate change process

Some skills are **discipline-gate** tier: they tell an agent to stop and do something
before proceeding (sf-plan's Verification Strategy, sf-work's System-Wide Test Check
and Step 2.5 TDD gate, sf-review's Non-Negotiable Gates, sf-debug's root-cause gate,
sf-lfg's gates). These gates are prose that must hold under pressure, so changing them
carries two hard requirements.

### Protocol G — eval evidence for gate-wording edits

Any edit to a discipline-gate skill's gate language must be accompanied by a
before/after run of the skill-triggering eval harness at `tests/skill-triggering/`
(see its README). Run the affected case (or the whole seed battery) with the current
wording and again with the edit, and include the result in the PR. A gate-wording
change without eval evidence is **not merged**.

### Protocol F — no silently omitted conversion target

Three documents cited Protocol F by name before it was ever defined. This is the
definition.

**Every capability this plugin ships must have an explicit, recorded outcome for
every conversion target — and "not deliverable here" is a valid outcome, while
silence is not.**

A target that simply goes unmentioned is indistinguishable from one that was
considered and found unable to receive the capability. The first is an oversight
a reader cannot detect; the second is a decision a reader can weigh. So when a
capability lands, `docs/hook-portability-matrix.md` gains a cell for every
target, with a class naming how it arrives or why it cannot.

This is what forbids degrading enforcement onto platforms with no blocking
primitive. An instructions file cannot deny a tool call. Emitting one and
implying the capability shipped there is the silent omission this protocol
exists to prevent — the honest cell is "intent only, no enforcement".

A change that adds or removes a hook, or changes what a hook delivers, updates
the matrix in the same PR.

### Protocol E — pressure-test records for gate changes

No discipline-gate-tier skill or persona ships or is edited without **at least two**
documented pressure scenarios recorded under `docs/pressure-tests/` (see that
directory's README for the record format). A pressure-test record captures a scenario
that tempts the exact failure the gate prevents, the excuse the baseline agent used,
the patch that closed it, and the intended after-behavior. Adding or editing a gate
means adding or updating these records first — they are the memory of which
rationalizations the gate already defends against.

## Notes on Scope

- Current focus is Claude Code plugin behavior.
- The CLI remains available as an optional bootstrap path.
