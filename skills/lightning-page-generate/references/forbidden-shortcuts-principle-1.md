# Forbidden shortcuts (Principle 1)

Read with `lightning-page-generate/SKILL.md`. Procedure lives here.

## Forbidden shortcuts (Principle 1)
- **Don't write FlexiPage XML from scratch** — always start from `sf template generate flexipage`. Hand-authored FlexiPages have a high subtle-deploy-failure rate (region ID mismatches, missing component IDs).
- **Don't deploy app metadata out of dependency order** — deploys fail when a tab references an object that hasn't deployed yet.
- **Don't skip the permission set** — an app users can't reach is not deployable in any meaningful sense.
- **Don't bundle the whole app into one XML write** — separate skill dispatches per metadata type so each can be reviewed and rolled back independently.

---

