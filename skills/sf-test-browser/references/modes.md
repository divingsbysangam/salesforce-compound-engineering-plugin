# Modes

Read with `sf-test-browser/SKILL.md`. Procedure lives here.

## Modes
- **Manual (default):** the user controls the dev server. When the fallback driver is `agent-browser`, ask whether to run headed or headless.
- **Pipeline (`mode:pipeline`):** invoked by `sf-lfg` or another automated runner. The run is unattended — never block on a question. Read `references/pipeline-orchestration.md` from this skill's directory and follow it; it overrides the free-port scan (step 4), dev-server startup (step 5), and visibility prompts (step 6). It still uses the preferred port that step 4 computes.

