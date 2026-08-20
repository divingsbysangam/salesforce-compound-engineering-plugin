# Inspiration

Read with `lightning-page-generate/SKILL.md`. Procedure lives here.

## Inspiration
This skill consolidates two upstream skills from `forcedotcom/afv-library` (Apache-2.0):

- [`generating-flexipage`](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-flexipage) — the FlexiPage CLI bootstrap discipline and component configuration
- [`generating-lightning-app`](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-lightning-app) — the multi-metadata orchestration in dependency order

The upstream `generating-lightning-app` ships a "metadata type registry" that explicitly says which sub-skill to load for each type and warns against bundling. This plugin's adaptation routes those sub-skill calls through `/metadata-generate`, `/validation-rule-generate`, and `/permission-set-generate` — preserving the orchestration discipline while consolidating the leaf generators. For the full per-component-type props tables and the visibility-filter syntax, consult the upstream `generating-flexipage` reference.
