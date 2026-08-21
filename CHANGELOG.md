# <span data-proof="authored" data-by="ai:claude">Changelog</span>

<span data-proof="authored" data-by="ai:claude">All notable changes to the</span> <span data-proof="authored" data-by="ai:claude">`sf-compound-engineering-plugin`</span> <span data-proof="authored" data-by="ai:claude">will be documented in this file.</span>

<span data-proof="authored" data-by="ai:claude">The format is based on</span> [<span data-proof="authored" data-by="ai:claude">Keep a Changelog</span>](https://keepachangelog.com/en/1.1.0/) <span data-proof="authored" data-by="ai:claude">and this project adheres to</span> [<span data-proof="authored" data-by="ai:claude">Semantic Versioning</span>](https://semver.org/spec/v2.0.0.html)<span data-proof="authored" data-by="ai:claude">.</span>

## [Unreleased]

### Fixed

* **CLI `1.0.1`.** `@divings/sf-compound-plugin@1.0.0` was published before the destination-reporting fix landed, so the released binary still warned only about Windsurf and let OpenClaw and Qwen report a project directory they never wrote to. 1.0.1 ships `installRoot()`. A test now pins the version literal in `src/index.ts` to `package.json` so a published binary cannot report a version it is not.

* **Installation paths (DIV-58).** `install` now writes into the directory you run it from instead of back into the plugin, via a new `--output <dir>` flag. Passing a plugin *name* downloads the plugin from GitHub into `$XDG_CACHE_HOME/sfce/plugins` rather than resolving against the working directory, so the advertised one-line install works from any project. Tool auto-detection (`--to all`) now inspects the output directory.
* **npm publish readiness.** `prepublishOnly` build, `publishConfig.access: public`, `engines`, repository `directory`, and a package README added to `cli/package.json` so the first publish succeeds.
* **Package renamed to `@divings/sf-compound-plugin`.** The previously advertised `@divingsbysangam` scope does not exist on npm — scopes must match an npm username or an org you own — so publishing it returned `404 Scope not found`. The package now ships under the `@divings` org.

### Added

* `BaseConverter.installRoot()` — each converter declares where it actually writes, and `install` reports any destination outside the requested `--output` directory. Windsurf at global scope, OpenClaw and Qwen install user-globally because that is the only place those tools load from.
* `docs/install-verification.md` — clean-environment verification log behind the README install matrix.
* README install matrix with prerequisites, last-verified date, known limitations, and owner per path.

## [3.1.0] - 2026-08-20

First stable (non-beta) release. Skills-first Salesforce compound engineering — not an instruction pack.

### Added

* Workflow skills `sf-handoff`, `sf-babysit-pr`, `sf-explain`, `sf-sweep`, `sf-retune`, `sf-test-browser` (LWC/Aura/Experience route mapping), with scripts/references where this catalog ships them.
* **`/sf-tend` responsibility feeds** — local-first Salesforce feeds with one durable thread per feed, source-backed cards, approval-gated actions, receipts, and reviewed learning.
* **Tend CLI runtime** — `feed`, `card`, `work`, `action`, and `learning` commands with digest-bound stale-action rejection and isolated local state.
* **Cursor Marketplace packaging** — single-plugin `.cursor-plugin/plugin.json` path fields, `assets/logo.svg`, `mcp.json` dual-ship, `scripts/validate-cursor-plugin.mjs`, CI validation, and submission runbook at `docs/solutions/integrations/cursor-marketplace-submission.md`.

### Changed

* Plugin manifests identify **`3.1.0`**. Catalog is **68 skills** + 61 specialist personas.
* **Progressive-disclosure skill layout** — always-loaded `SKILL.md` files stay under 8KB; procedure lives in sibling `references/` (including `sf-babysit-pr` and the rest of the oversized catalog). Salesforce names, `/tmp/sfce-*` scratch, and never-merge babysit contract unchanged.
* `sf-debug` documents `mode:pipeline` for babysit/lfg. `sf-work` requires a writable checkout. `sf-babysit-pr` decodes `gh` output as UTF-8 and dispatches a worker when the host has no skill-invocation primitive.
* `sf-retune` documented as distinct from `sf-update` / `sf-compound-refresh`.
* **Repository & package migration** — canonical repo moved to [`divingsbysangam/salesforce-compound-engineering-plugin`](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin); prior `gellasangameshgupta/salesforce-compound-engineering-plugin` repo superseded. CLI/npm package renamed `@gellasangameshgupta/sf-compound-plugin` → `@divingsbysangam/sf-compound-plugin`. `homepage`/`repository`/author URLs updated across all four manifests.

## \[3.1.0-beta.3] - 2026-06-22

**Agentless, skill-native reshape.** The plugin no longer ships standalone registered agents — formal agent definitions are not a reliable common denominator across Claude, Codex, Cursor, Gemini, Pi, OpenCode, etc. The 60 specialist behaviors are preserved as **persona prompt assets** dispatched as isolated subagents (parallel on Claude Code, inline where unsupported). No quality loss: review still runs many isolated specialist lenses; only the manifest-level agent registration goes away.

### Changed

* **60 agents → 60 personas.** Every `agents/<name>.agent.md` moved to its owning skill at `skills/<owner>/references/personas/<name>.md` (frontmatter trimmed to `name` + `description`; `model`/`tools`/`color`/`scope` dropped). Ownership: `sf-review` (≈40 code-review personas), `sf-doc-review` (8 doc-review personas), `sf-plan` (research + spec-flow personas), plus `sf-debug`, `sf-resolve-pr-feedback`, `sf-product-pulse`, `mcp-tool-builder` (one each). Cross-skill use is by relative path (stable — the whole `skills/` tree ships together).
* **Dispatch convention.** Every workflow skill that dispatched agents (`sf-review`, `sf-doc-review`, `sf-lfg`, `sf-work`, `sf-plan`, `sf-deepen`, `sf-brainstorm`, `sf-polish`, `sf-resolve-pr-feedback`, `sf-debug`, `sf-product-pulse`, `sf-compound`) now loads the persona file and runs it via a general-purpose subagent — parallel with isolated context on Claude Code, applied inline in sequence on harnesses without a subagent primitive.
* **CLI is agentless-safe.** The parser already guards missing `agents/` (returns an empty set), so converters emit no agent files; personas ship to all 11 platforms as ordinary skill files (the CLI copies a skill's whole `references/` subtree). Parser tests updated to assert the agentless invariant (`agents.length === 0`) and that personas travel with skills.
* **Docs re-narrated.** `CLAUDE.md` (Architecture, Frontmatter conventions, "Adding new personas and skills") and `README.md` (Specialist Personas section, Project Structure, conversion-table note) updated to the agentless model.

### Removed

* **`agents/` directory** (60 `*.agent.md` files + `index.md`) — relocated into skill-local `references/personas/`. **Breaking** for any caller that dispatched a persona by registered `subagent_type` (e.g. `sf-apex-governor-guardian`); dispatch now goes through the owning workflow skill.

## \[3.1.0-beta.1] - 2026-06-22

Adopts the skills-first sandwich loop, Salesforce-flavored: humans own the two ends (ideate + polish), the AI runs the middle in the loop.

### Added

* **`/sf-strategy`** — creates and maintains a durable repo-root `STRATEGY.md` (target problem, approach, users, key metrics, tracks). Org-context aware (internal org / consulting engagement / ISV product). Read as grounding by `sf-ideate`, `sf-brainstorm`, and `sf-plan`. Includes `references/interview.md` and `references/strategy-template.md` with Salesforce-specific anti-patterns (build-output metrics, metadata-inventory tracks, licence-as-persona).
* **`/sf-polish`** — the back "bread" of the loop: a stack-aware UI polish pass. Detects the front-end surface (LWC / Aura / Experience Cloud LWR / React-headless) via a profile registry and applies the matching design, WCAG accessibility (gate), and copy lens. New stacks plug in as a registry row. Dispatches `sf-lwc-accessibility-guardian`, `sf-aura-migration-advisor`, and `/slds2-uplift`.
* **`/sf-simplify-code`** — promotes the `sf-code-simplicity-reviewer` agent to a user-facing skill. Behavior-preserving simplification of Apex/LWC with Salesforce guardrails (bulk safety, governor profile, sharing/CRUD/FLS, trigger order of execution must not change).
* **`/sf-product-pulse`** — role-aware, org-required pulse. Business lens (BA/consultant): requirements traceability against BRD/BFRD/FRD/SOW mapped to live org metadata, adoption vs target personas, business-process friction, scope/change. Technical lens (dev/admin): Apex exceptions, governor near-misses, coverage trend, deploy health, limits. Saves to `docs/pulse-reports/`, read-only, no PII.
* **`sf-business-analyst-pulse`** agent — read-only `model: sonnet` business analyst backing the pulse's business lens.

### Changed

* **8-step reframe** — `/sf-ideate` is promoted to a core loop entry point (the front "bread") and `/sf-polish` becomes the back bookend. `/sf-lfg` gains **Stage 0: IDEATE & BRAINSTORM** and **Stage 6: POLISH** (conditional, UI surfaces only); TEST/DEPLOY/COMPOUND renumber to 7/8/9; abort conditions and output updated. README, `CLAUDE.md`, and `skills/index.md` re-narrated around the sandwich; core workflow entry-point count is now nine, plus `/sf-strategy` grounding.
* **Repository & package migration** — canonical repo moved to [`gellasangameshgupta/salesforce-compound-engineering-plugin`](https://github.com/gellasangameshgupta/salesforce-compound-engineering-plugin); the prior `sangameshgupta/sf-compound-engineering-plugin` repo is archived (private). CLI/npm package renamed `@sangameshgupta/sf-compound-plugin` → `@gellasangameshgupta/sf-compound-plugin`. `homepage`/`repository`/author URLs updated across all four manifests.
* **README full refresh** — corrected the install URL (was pointing at the now-private repo), updated counts to the current **60 skills / 60 agents**, replaced the stale "7 Commands" section with the nine workflow entry points, documented the new `sf-strategy` / `sf-polish` / `sf-simplify-code` / `sf-product-pulse` / `graphql-patterns` skills, fixed the Project Structure tree (flat agents, retired `commands/`), and repaired broken tables.

## \[3.0.0-beta.2] - 2026-04-30

Opinionated release: introduces a 7-principles framework, replaces the `agent-script` language reference with three Agentforce lifecycle skills, ports eight generating skills from `forcedotcom/afv-library`, and removes the stale CI workflow.

### <span data-proof="authored" data-by="ai:claude">Added</span>

* **<span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`</span>** <span data-proof="authored" data-by="ai:claude">— seven principles paraphrased from Karpathy's YC AI Startup School talk, governing every skill and review in the plugin: (1) preserve the quality ceiling, (2) verifiability is the automation lever, (3) stay in the loop (jagged intelligence), (4) the spec is the artifact, (5) taste / judgment / oversight is the human's job, (6) agent-native docs over human-native docs, (7) outsource thinking, not understanding.</span>

* **<span data-proof="authored" data-by="ai:claude">3 Agentforce lifecycle skills</span>** <span data-proof="authored" data-by="ai:claude">(adapted from</span> <span data-proof="authored" data-by="ai:claude">`forcedotcom/afv-library`, Apache-2.0):</span>

  * <span data-proof="authored" data-by="ai:claude">`agentforce-develop`</span> <span data-proof="authored" data-by="ai:claude">— Agent Spec gate,</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">authoring, validate / publish / activate.</span>

  * <span data-proof="authored" data-by="ai:claude">`agentforce-test`</span> <span data-proof="authored" data-by="ai:claude">— preview smoke + Testing Center batch, safety verdict, fix loop.</span>

  * <span data-proof="authored" data-by="ai:claude">`agentforce-observe`</span> <span data-proof="authored" data-by="ai:claude">— STDM session traces with fallback, reproduce-classify-improve.</span>

* **<span data-proof="authored" data-by="ai:claude">8 generating skills</span>** <span data-proof="authored" data-by="ai:claude">(Tier 1 + Tier 2 ports from</span> <span data-proof="authored" data-by="ai:claude">`forcedotcom/afv-library`, Apache-2.0):</span>

  * <span data-proof="authored" data-by="ai:claude">Tier 1:</span> <span data-proof="authored" data-by="ai:claude">`apex-generate`</span> <span data-proof="authored" data-by="ai:claude">(class + tests as one unit),</span> <span data-proof="authored" data-by="ai:claude">`flow-generate`</span> <span data-proof="authored" data-by="ai:claude">(3-step MCP pipeline),</span> <span data-proof="authored" data-by="ai:claude">`validation-rule-generate`,</span> <span data-proof="authored" data-by="ai:claude">`apex-trigger-refactor`,</span> <span data-proof="authored" data-by="ai:claude">`slds2-uplift`.</span>

  * <span data-proof="authored" data-by="ai:claude">Tier 2:</span> <span data-proof="authored" data-by="ai:claude">`metadata-generate`</span> <span data-proof="authored" data-by="ai:claude">(single</span> <span data-proof="authored" data-by="ai:claude">`--type`-dispatched generator consolidating six upstream skills: object / field / app / tab / list-view / lightning-type),</span> <span data-proof="authored" data-by="ai:claude">`lightning-page-generate`</span> <span data-proof="authored" data-by="ai:claude">(FlexiPage or full LEX app orchestration),</span> <span data-proof="authored" data-by="ai:claude">`permission-set-generate`</span> <span data-proof="authored" data-by="ai:claude">(least-privilege defaults).</span>

### <span data-proof="authored" data-by="ai:claude">Changed</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-plan`</span>** <span data-proof="authored" data-by="ai:claude">— now requires a five-field</span> **<span data-proof="authored" data-by="ai:claude">Verification Strategy</span>** <span data-proof="authored" data-by="ai:claude">section (acceptance assertion, bulk threshold, governor boundary, sharing scenario, integration mock) before advancing to</span> <span data-proof="authored" data-by="ai:claude">`/sf-work`. Hand-waved fields fail the gate.</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-review`</span>** <span data-proof="authored" data-by="ai:claude">— codifies non-negotiable gates at the top: security regression, governor regression, test coverage regression, trigger context regression, sharing regression. These abort</span> <span data-proof="authored" data-by="ai:claude">`/sf-lfg`</span> <span data-proof="authored" data-by="ai:claude">rather than routing to warnings.</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-lfg`</span>** <span data-proof="authored" data-by="ai:claude">— abort triggers updated to include missing Verification Strategy and any fired review gate.</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-deepen`</span>** <span data-proof="authored" data-by="ai:claude">— reframed as a spec-tightening pass; cleanly disambiguated from</span> <span data-proof="authored" data-by="ai:claude">`/sf-plan`'s deepen mode.</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-compound`</span>** <span data-proof="authored" data-by="ai:claude">— captures aesthetic and taste learnings alongside bug fixes.</span>

* **<span data-proof="authored" data-by="ai:claude">All seven core workflow skills</span>** <span data-proof="authored" data-by="ai:claude">carry a</span> <span data-proof="authored" data-by="ai:claude">`## Copy-paste-to-agent`</span> <span data-proof="authored" data-by="ai:claude">block at the top (Principle 6).</span>

* **<span data-proof="authored" data-by="ai:claude">`/sf-work`</span>** <span data-proof="authored" data-by="ai:claude">— Step 1 now dispatches to the new generating skills based on the metadata type detected in the plan.</span>

* **<span data-proof="authored" data-by="ai:claude">`skills/index.md`</span>** <span data-proof="authored" data-by="ai:claude">— new "Generating Skills" section between Domain Knowledge and Workflow Support.</span>

* **<span data-proof="authored" data-by="ai:claude">`CLAUDE.md`</span>** <span data-proof="authored" data-by="ai:claude">— adds a</span> <span data-proof="authored" data-by="ai:claude">`## Principles`</span> <span data-proof="authored" data-by="ai:claude">section linking to</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`</span> <span data-proof="authored" data-by="ai:claude">and listing all seven.</span>

* **<span data-proof="authored" data-by="ai:claude">`README.md`</span>** <span data-proof="authored" data-by="ai:claude">— adds a Principles callout near the loop diagram, refreshes the Agentforce skill table.</span>

* <span data-proof="authored" data-by="ai:claude">Plugin version bumped to</span> <span data-proof="authored" data-by="ai:claude">`3.0.0-beta.2`</span> <span data-proof="authored" data-by="ai:claude">across all four manifests.</span>

### <span data-proof="authored" data-by="ai:claude">Removed</span>

* **<span data-proof="authored" data-by="ai:claude">`skills/agent-script/`</span>** <span data-proof="authored" data-by="ai:claude">— the language-reference skill is replaced by the three lifecycle-shaped Agentforce skills above. Language details are linked from each new skill's</span> <span data-proof="authored" data-by="ai:claude">`## Inspiration`</span> <span data-proof="authored" data-by="ai:claude">section.</span>

* **<span data-proof="authored" data-by="ai:claude">`.github/workflows/ci.yml`</span>** <span data-proof="authored" data-by="ai:claude">— the V2-era test job has been red since</span> <span data-proof="authored" data-by="ai:claude">`2026-04-16`</span> <span data-proof="authored" data-by="ai:claude">(asserts</span> <span data-proof="authored" data-by="ai:claude">`version: "2.0.0"`</span> <span data-proof="authored" data-by="ai:claude">and a</span> <span data-proof="authored" data-by="ai:claude">`commands/`</span> <span data-proof="authored" data-by="ai:claude">directory, both removed in V3). Removed as a whole rather than rewritten — it was not pulling its weight.</span>

### <span data-proof="authored" data-by="ai:claude">Stats</span>

* <span data-proof="authored" data-by="ai:claude">Skills: 45 →</span> **<span data-proof="authored" data-by="ai:claude">55</span>** <span data-proof="authored" data-by="ai:claude">(+8 generating, +3 Agentforce, −1 agent-script).</span>

* <span data-proof="authored" data-by="ai:claude">Manifests: 4 (unchanged — Claude / Cursor / Codex / marketplace).</span>

* <span data-proof="authored" data-by="ai:claude">Agents: 59 (unchanged).</span>

* <span data-proof="authored" data-by="ai:claude">MCP servers: 2 (unchanged — Context7, Salesforce DX).</span>

### <span data-proof="authored" data-by="ai:claude">Inspiration</span>

* <span data-proof="authored" data-by="ai:claude">Andrej Karpathy, Y Combinator AI Startup School (transcript ID</span> <span data-proof="authored" data-by="ai:claude">`96jN2OCOfLs`) — the seven-principles framework.</span>

* [<span data-proof="authored" data-by="ai:claude">`forcedotcom/afv-library`</span>](https://github.com/forcedotcom/afv-library) <span data-proof="authored" data-by="ai:claude">(Apache-2.0) — Agentforce lifecycle skills and generating skills.</span>

***

## <span data-proof="authored" data-by="ai:claude">[3.0.0-beta.1] - 2026-04-25</span>

<span data-proof="authored" data-by="ai:claude">V3 capability ports: 22 V3 skills and 24 V3 review/research agents added as Salesforce-aware sf-* counterparts.</span>

### <span data-proof="authored" data-by="ai:claude">Added</span>

***

***

* <span data-proof="authored" data-by="ai:claude">Always-on review (4):</span> <span data-proof="authored" data-by="ai:claude">`sf-correctness-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-maintainability-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-testing-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-project-standards-reviewer`.</span>

* <span data-proof="authored" data-by="ai:claude">Conditional review (7):</span> <span data-proof="authored" data-by="ai:claude">`sf-architecture-strategist`,</span> <span data-proof="authored" data-by="ai:claude">`sf-performance-oracle`,</span> <span data-proof="authored" data-by="ai:claude">`sf-performance-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-reliability-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-api-contract-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-data-migrations-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-data-integrity-guardian`.</span>

* <span data-proof="authored" data-by="ai:claude">Doc-review lenses (6):</span> <span data-proof="authored" data-by="ai:claude">`sf-feasibility-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-coherence-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-product-lens-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-scope-guardian-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-security-lens-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-design-lens-reviewer`.</span>

* <span data-proof="authored" data-by="ai:claude">Adversarial (2):</span> <span data-proof="authored" data-by="ai:claude">`sf-adversarial-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-adversarial-document-reviewer`.</span>

* <span data-proof="authored" data-by="ai:claude">Workflow / research (5):</span> <span data-proof="authored" data-by="ai:claude">`sf-previous-comments-reviewer`,</span> <span data-proof="authored" data-by="ai:claude">`sf-issue-intelligence-analyst`,</span> <span data-proof="authored" data-by="ai:claude">`sf-session-historian`,</span> <span data-proof="authored" data-by="ai:claude">`sf-slack-researcher`,</span> <span data-proof="authored" data-by="ai:claude">`sf-web-researcher`.</span>

### <span data-proof="authored" data-by="ai:claude">Changed</span>

* <span data-proof="authored" data-by="ai:claude">Plugin version bumped to</span> <span data-proof="authored" data-by="ai:claude">`3.0.0-beta.1`</span> <span data-proof="authored" data-by="ai:claude">across all four manifests (`.claude-plugin/plugin.json`,</span> <span data-proof="authored" data-by="ai:claude">`.claude-plugin/marketplace.json`,</span> <span data-proof="authored" data-by="ai:claude">`.cursor-plugin/plugin.json`,</span> <span data-proof="authored" data-by="ai:claude">`.codex-plugin/plugin.json`).</span>

* <span data-proof="authored" data-by="ai:claude">Total agent count: 35 → 59. Total skill count: 23 → 45.</span>

### <span data-proof="authored" data-by="ai:claude">Not Ported (out of scope)</span>

* <span data-proof="authored" data-by="ai:claude">Personality reviewer agents tied to non-Salesforce stacks (Rails, frontend race conditions, Ruby gem READMEs, Swift / iOS).</span>

* <br />

* <br />

* <br />

## <span data-proof="authored" data-by="ai:claude">[3.0.0-alpha.1] - 2026-04-25</span>

**<span data-proof="authored" data-by="ai:claude">BREAKING.</span>** <span data-proof="authored" data-by="ai:claude">V3 architecture migration — skills replace commands, agents flatten with</span> <span data-proof="authored" data-by="ai:claude">`<name>.agent.md`</span> <span data-proof="authored" data-by="ai:claude">naming, multi-platform manifests added.</span>

### <span data-proof="authored" data-by="ai:claude">BREAKING CHANGES</span>

***

* **<span data-proof="authored" data-by="ai:claude">All 35 agents flattened.</span>** <span data-proof="authored" data-by="ai:claude">Files moved from</span> <span data-proof="authored" data-by="ai:claude">`agents/{apex,architecture,automation,integration,lwc,research,workflow}/<name>.md`</span> <span data-proof="authored" data-by="ai:claude">to</span> <span data-proof="authored" data-by="ai:claude">`agents/sf-<name>.agent.md`</span> <span data-proof="authored" data-by="ai:claude">(flat layout,</span> <span data-proof="authored" data-by="ai:claude">`.agent.md`</span> <span data-proof="authored" data-by="ai:claude">suffix). Category folders are removed; topical groupings remain in</span> <span data-proof="authored" data-by="ai:claude">`agents/index.md`</span> <span data-proof="authored" data-by="ai:claude">as documentation aids only.</span>

* **<span data-proof="authored" data-by="ai:claude">Agent frontmatter updated to V3 conventions.</span>** <span data-proof="authored" data-by="ai:claude">Fields:</span> <span data-proof="authored" data-by="ai:claude">`name`,</span> <span data-proof="authored" data-by="ai:claude">`description`,</span> <span data-proof="authored" data-by="ai:claude">`model`,</span> <span data-proof="authored" data-by="ai:claude">`tools`,</span> <span data-proof="authored" data-by="ai:claude">`color`. The</span> <span data-proof="authored" data-by="ai:claude">`scope`</span> <span data-proof="authored" data-by="ai:claude">field is retired.</span> <span data-proof="authored" data-by="ai:claude">`model: inherit`</span> <span data-proof="authored" data-by="ai:claude">is the default; research agents keep</span> <span data-proof="authored" data-by="ai:claude">`model: haiku`</span> <span data-proof="authored" data-by="ai:claude">for speed; deep-analysis agents keep</span> <span data-proof="authored" data-by="ai:claude">`model: sonnet`. Tools default to</span> <span data-proof="authored" data-by="ai:claude">`Read, Grep, Glob, Bash`; workflow agents that may write files get the full</span> <span data-proof="authored" data-by="ai:claude">`Read, Edit, Write, Grep, Glob, Bash`</span> <span data-proof="authored" data-by="ai:claude">set.</span>

* **<span data-proof="authored" data-by="ai:claude">Skill frontmatter updated to V3 conventions.</span>** <span data-proof="authored" data-by="ai:claude">Fields:</span> <span data-proof="authored" data-by="ai:claude">`name`,</span> <span data-proof="authored" data-by="ai:claude">`description`,</span> <span data-proof="authored" data-by="ai:claude">`argument-hint`. Skill descriptions enumerate Salesforce-flavored auto-routing trigger phrases.</span>

***

### <span data-proof="authored" data-by="ai:claude">Added</span>

* <span data-proof="authored" data-by="ai:claude">`.cursor-plugin/plugin.json`</span> <span data-proof="authored" data-by="ai:claude">— Cursor manifest for native install in Cursor IDE.</span>

* <span data-proof="authored" data-by="ai:claude">`.codex-plugin/plugin.json`</span> <span data-proof="authored" data-by="ai:claude">— Codex manifest with</span> <span data-proof="authored" data-by="ai:claude">`skills`</span> <span data-proof="authored" data-by="ai:claude">path and</span> <span data-proof="authored" data-by="ai:claude">`interface`</span> <span data-proof="authored" data-by="ai:claude">metadata for native Codex install.</span>

* <span data-proof="authored" data-by="ai:claude">`agents/index.md`</span> <span data-proof="authored" data-by="ai:claude">— V3 flat-layout routing index (rewritten).</span>

* <br />

* <span data-proof="authored" data-by="ai:claude">This</span> <span data-proof="authored" data-by="ai:claude">`CHANGELOG.md`</span> <span data-proof="authored" data-by="ai:claude">file.</span>

### <span data-proof="authored" data-by="ai:claude">Changed</span>

* <span data-proof="authored" data-by="ai:claude">`.claude-plugin/plugin.json`</span> <span data-proof="authored" data-by="ai:claude">version:</span> <span data-proof="authored" data-by="ai:claude">`2.2.0`</span> <span data-proof="authored" data-by="ai:claude">→</span> <span data-proof="authored" data-by="ai:claude">`3.0.0-alpha.1`. Description and keywords updated for multi-platform / skills-first.</span>

* <span data-proof="authored" data-by="ai:claude">`.claude-plugin/marketplace.json`</span> <span data-proof="authored" data-by="ai:claude">catalog and entry version bumped to</span> <span data-proof="authored" data-by="ai:claude">`3.0.0-alpha.1`.</span>

* <span data-proof="authored" data-by="ai:claude">`CLAUDE.md`</span> <span data-proof="authored" data-by="ai:claude">rewritten for V3 architecture. The "Hosted MCP Key Gotchas" section (8 items) and "Protected Artifacts" rules are preserved verbatim.</span>

* <span data-proof="authored" data-by="ai:claude">`README.md`</span> <span data-proof="authored" data-by="ai:claude">updated: BREAKING migration banner, component counts (35 → 59 agents, 23 → 45 skills), workflow diagram clarified that entry points are skills.</span>

### <span data-proof="authored" data-by="ai:claude">Removed</span>

* <span data-proof="authored" data-by="ai:claude">The</span> <span data-proof="authored" data-by="ai:claude">`commands/`</span> <span data-proof="authored" data-by="ai:claude">directory and its 7 files (`sf-brainstorm.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-plan.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-deepen.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-work.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-review.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-compound.md`,</span> <span data-proof="authored" data-by="ai:claude">`sf-lfg.md`). The bodies were preserved in their new skill homes.</span>

* <span data-proof="authored" data-by="ai:claude">The 7 agent category subdirectories (`agents/{apex,architecture,automation,integration,lwc,research,workflow}/`). All agent files were preserved via</span> <span data-proof="authored" data-by="ai:claude">`git mv`</span> <span data-proof="authored" data-by="ai:claude">so blame and history follow.</span>

* <span data-proof="authored" data-by="ai:claude">`scope`</span> <span data-proof="authored" data-by="ai:claude">field from all agent frontmatter (V3 retired this field).</span>

### <span data-proof="authored" data-by="ai:claude">Migration Guide for v2.x Users</span>

<span data-proof="authored" data-by="ai:claude">If you have scripts, docs, or muscle memory tied to v2.x, here's what changes:</span>

| <span data-proof="authored" data-by="ai:claude">v2.x</span>                                                                                                                                                         | <span data-proof="authored" data-by="ai:claude">v3.x</span>                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`/sf-plan`</span> <span data-proof="authored" data-by="ai:claude">(command, in</span> <span data-proof="authored" data-by="ai:claude">`commands/sf-plan.md`)</span> | <span data-proof="authored" data-by="ai:claude">`/sf-plan`</span> <span data-proof="authored" data-by="ai:claude">(skill, in</span> <span data-proof="authored" data-by="ai:claude">`skills/sf-plan/SKILL.md`)</span>         |
| <span data-proof="authored" data-by="ai:claude">`agents/apex/apex-trigger-architect.md`</span>                                                                                                                      | <span data-proof="authored" data-by="ai:claude">`agents/sf-apex-trigger-architect.agent.md`</span>                                                                                                                            |
| <span data-proof="authored" data-by="ai:claude">`agents/research/sf-learnings-researcher.md`</span>                                                                                                                 | <span data-proof="authored" data-by="ai:claude">`agents/sf-learnings-researcher.agent.md`</span>                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`agents/workflow/sf-spec-flow-analyzer.md`</span>                                                                                                                   | <span data-proof="authored" data-by="ai:claude">`agents/sf-spec-flow-analyzer.agent.md`</span>                                                                                                                                |
| <span data-proof="authored" data-by="ai:claude">Agent frontmatter</span> <span data-proof="authored" data-by="ai:claude">`scope: APEX_ONLY`</span>                                                                  | <span data-proof="authored" data-by="ai:claude">(removed; topical grouping is in</span> <span data-proof="authored" data-by="ai:claude">`agents/index.md`</span> <span data-proof="authored" data-by="ai:claude">only)</span> |
| <span data-proof="authored" data-by="ai:claude">Single-target Claude Code install</span>                                                                                                                            | <span data-proof="authored" data-by="ai:claude">Multi-target install (Claude Code, Cursor, Codex)</span>                                                                                                                      |

**<span data-proof="authored" data-by="ai:claude">For most users</span>**<span data-proof="authored" data-by="ai:claude">: re-install the plugin (`/plugin update sf-compound-engineering`). Slash invocations (`/sf-plan`,</span> <span data-proof="authored" data-by="ai:claude">`/sf-debug`,</span> <span data-proof="authored" data-by="ai:claude">`/sf-review`) work identically. Custom scripts that hard-coded paths under</span> <span data-proof="authored" data-by="ai:claude">`commands/`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`agents/<category>/`</span> <span data-proof="authored" data-by="ai:claude">need updating — see the table above.</span>

## <span data-proof="authored" data-by="ai:claude">[2.2.0] and earlier</span>
