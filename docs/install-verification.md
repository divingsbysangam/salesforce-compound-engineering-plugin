# Install path verification log

Owner: [@divingsbysangam](https://github.com/divingsbysangam)
Tracking issue: [DIV-58](https://linear.app/divings/issue/DIV-58/repair-and-verify-every-advertised-installation-path)

This file is the evidence behind the install matrix in [`README.md`](../README.md#install-matrix).
A path may only carry a "last verified" date in that matrix if a run is recorded here.

## Round 1 — 2026-08-21

### Environment

| | |
| --- | --- |
| Platform | macOS (darwin 25.6.0), arm64 |
| Node | v22.22.0 |
| Bun | 1.3.11 |
| git | on PATH |
| Plugin version | 3.1.0 (`.claude-plugin/plugin.json`) |
| CLI version | `@divings/sf-compound-plugin@1.0.0` |
| Plugin commit fetched | `a02a2d0` (`main`) |

### Failures found (the reason DIV-58 exists)

**F1 — npm package does not exist.** Every `bunx @divings/sf-compound-plugin …`
command in the README returned:

```
error: GET https://registry.npmjs.org/@divingsbysangam%2fsf-compound-plugin - 404
```

**F2 — the installer had no destination.** `install` passed the *plugin* directory
as the converter's output directory, so converted files were written back into the
plugin itself and never reached the user's project:

```
$ cd ~/my-salesforce-project
$ … install /path/to/plugin-checkout --to cursor
Done! Plugin installed successfully.
  MCP Config: /path/to/plugin-checkout/.cursor/mcp.json   ← wrong directory
$ ls ~/my-salesforce-project
force-app                                                  ← nothing installed
```

**F3 — a bare plugin name resolved to the current directory.** Running
`install sf-compound-engineering` from a real Salesforce project failed with
`No plugin.json found at …/myproject/.claude-plugin/plugin.json`, because the name
was resolved against the working directory rather than fetched.

**F4 — `--to all` wrote outside the install directory.** The Windsurf converter
at its default `global` scope installs into `~/.codeium/windsurf`, not the output
directory. Because `--to all` detects Windsurf from the *home* directory, a run in
an unrelated project created `~/.codeium/windsurf/{skills,rules,mcp_config.json}`
on the test machine. `install` now prints where Windsurf actually lands; the
scope behaviour itself is unchanged.

**F5 — the advertised npm scope did not exist.** The first `npm publish` attempt
failed after login:

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/@divingsbysangam%2fsf-compound-plugin - Scope not found
```

An npm scope must match an npm username or an organization you own. The account
is `divings` and owns the `divings` org; `divingsbysangam` is the GitHub org, not
an npm one. The package was renamed to `@divings/sf-compound-plugin`. The GitHub
organization name is unchanged.

**F6 — no git-based fallback.** `cli/dist/` is gitignored and `package.json` lives
under `cli/` rather than the repository root, so `bunx github:divingsbysangam/…`
could not resolve a binary either. A fresh clone contains no `dist/`.

### Fixes

- `--output <dir>` (default: current directory) separates install destination from plugin source.
- `resolvePluginSource` downloads a known plugin by name into `$XDG_CACHE_HOME/sfce/plugins`, and refuses to silently adopt an unrelated project in the working directory.
- Tool auto-detection (`--to all`) now inspects the output directory rather than the process working directory.
- `prepublishOnly`, `publishConfig.access: public`, `engines`, and a package README added so the first `npm publish` succeeds.

### Verification runs

Build and test gates:

```
bun run typecheck   → clean
bun test            → 73 pass, 0 fail (12 files)
bun run build       → dist/index.js, 0.31 MB
npm pack            → 3 files, 70.3 kB (README.md, dist/index.js, package.json)
```

Clean-environment installs. The packed tarball was installed into a throwaway
prefix (`npm install -g --prefix …`) and run as the published binary would be,
from an empty project directory with an empty plugin cache:

| Target | Command | Result |
| --- | --- | --- |
| Cursor | `install sf-compound-engineering --to cursor` | Plugin downloaded from GitHub and cached; 68 skills symlinked into `./.cursor/skills/`, `.cursor/mcp.json` and `.cursor/rules/sf-discipline-primer.md` written |
| Codex | `install sf-compound-engineering --to codex` | Cache reused (no re-download); 68 skills copied into `./.codex/skills/`, `.codex/config.toml` and `.codex/AGENTS.md` written |
| GitHub Copilot | `install sf-compound-engineering --to copilot` | 68 skills copied into `./.github/skills/`, `.github/copilot-mcp-config.json` and `.github/copilot-instructions.md` written |
| All detected tools | `install sf-compound-engineering --to all` | Ran Windsurf, Gemini, Codex, Cursor and Droid converters; 68 skills each into `.gemini/`, `.codex/`, `.factory/` and `.cursor/`. Windsurf went to `~/.codeium/windsurf` — see F4 |
| Explicit destination | `install … --to codex --output <dir>` | 68 skills written to the named directory, nothing in the working directory |
| Pinned ref | `install … --to codex --ref v3.1.0-beta.3` | Downloaded and installed plugin v3.1.0-beta.3 |
| Offline | `install … --to codex --offline` | Reused the cached copy with no network access |
| Bad ref | `install … --ref no-such-tag` | `git clone failed: fatal: Remote branch no-such-tag not found in upstream origin` |
| Unknown plugin | `install totally-bogus --to codex` | Lists all three avenues tried, then suggests passing a path |
| Contributor sync | `bun run cli/src/index.ts sync --target all` from the repo root | Converts in place; **fails from `cli/`**, which has no manifest — the README says so |

Claude Code native path — verified by manifest reachability rather than execution,
because `/plugin` cannot be driven from a shell:

```
GET raw.githubusercontent.com/…/main/.claude-plugin/marketplace.json → 200
GET raw.githubusercontent.com/…/main/.claude-plugin/plugin.json      → 200
node scripts/validate-cursor-plugin.mjs                              → Validation passed.
```

## Round 2 — 2026-08-21, against the published registry

`@divings/sf-compound-plugin@1.0.0` published (shasum `1b6760fb`, 313.1 kB
unpacked, `latest`). Round 1 verified the packed tarball; this round runs the
README commands verbatim against npm, each from an empty directory with an empty
plugin cache.

| Command | Time | Result |
| --- | --- | --- |
| `bunx @divings/sf-compound-plugin install sf-compound-engineering --to cursor` | 4.7s | 68 skills symlinked into `.cursor/skills/`, `.cursor/mcp.json` written |
| `bunx … --to codex` | 1.3s | 68 skills into `.codex/skills/` |
| `bunx … --to copilot` | 1.2s | 68 skills into `.github/skills/` |
| `npx -y … --to codex` | 4.9s | 68 skills — confirms the package runs on plain Node with no Bun installed |

Against DIV-58's KPI of a **median install under 5 minutes**, the measured
installs complete in **1–5 seconds**. The remaining risk is not install duration
but discovery and tool-load confirmation, which needs the fresh-installer round.

The `npx` path was added to the README as a result of this round — the docs had
only ever shown `bunx`, which silently assumed Bun.

## Round 3 — 2026-08-21, the renamed package

`salesforce-compound-engineering-plugin@1.0.1` published; shasum `f6b66e1e`
matches the pre-publish dry run byte for byte, so the registry serves exactly
the artifact verified locally. `@divings/sf-compound-plugin` deprecated at both
1.0.0 and 1.0.1.

README commands run verbatim, each from an empty directory with an empty plugin
cache:

| Command | Time | Result |
| --- | --- | --- |
| `bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to cursor` | 3.5s | 68 skills into `.cursor/skills/` |
| `bunx … --to codex` | 1.2s | 68 skills, cache reused |
| `bunx … --to copilot` | 1.3s | 68 skills into `.github/skills/` |
| `npx -y … --to codex` | 3.2s | 68 skills, plain Node |

Checks specific to this round:

- **Both bins resolve.** A global install exposes `salesforce-compound-engineering-plugin` and `sf-compound-plugin`; both report `1.0.1`. The package-named bin is what makes the documented one-liner independent of `bunx`/`npx` single-bin fallback behaviour.
- **The 1.0.1 destination fix is in the published binary**, not just the repository. `--to openclaw` prints the real `~/.openclaw/extensions/…` destination and leaves the requested project empty, which is the corrected behaviour rather than the 1.0.0 defect.
- **The deprecation fires.** Installing the old name emits `npm warn deprecated @divings/sf-compound-plugin@1.0.1: renamed to salesforce-compound-engineering-plugin`.

### The recurring gap, and what now closes it

Three times in this issue a merge did not reach users: the package was never
published, the destination fix was published-before-merge, and the rename landed
in the repository while npm still 404'd the new name. Merging changes what the
docs say; publishing changes what the docs describe, and nothing enforced the two
happening together.

`scripts/check-npm-release.mjs` now does, via the **Release check** workflow. It
fails when the registry does not serve the name and version `cli/package.json`
declares — missing, not tagged `latest`, or deprecated — or when the install
commands in the READMEs name a different package than the manifest. It blocks on
pushes to `main`, stays advisory on pull requests where a version bump correctly
precedes its publish, and runs daily to catch drift no commit causes. Run it
locally with `node scripts/check-npm-release.mjs`.

An unreachable registry is reported as a failure after three retries rather than
a quiet pass: a check that cannot run has not passed.

## Known caveats

### Targets that cannot honour `--output`

Three targets install into a user-global directory regardless of `--output`,
because that is the only location the tool loads from:

| Target | Destination |
| --- | --- |
| Windsurf (default `--scope global`) | `~/.codeium/windsurf` |
| OpenClaw | `~/.openclaw/extensions/<plugin>` |
| Qwen | `~/.qwen/extensions/<plugin>` |

Each converter declares this through `installRoot()`, which is also what
`convert()` resolves its base directory from, so the reported destination cannot
drift from the written one. `install` prints a note whenever the destination
falls outside the requested directory. Caught in review of PR #9 — the first
version of this fix warned only about Windsurf and let OpenClaw and Qwen report
a project directory they never wrote to.

### Windsurf scope

`--scope global` (the default) makes Windsurf the one target that ignores
`--output`. Under `--to all` this can install into a home directory for a tool the
project does not use. `--scope workspace` keeps it in the project. Files created
during this round on the test machine were `~/.codeium/windsurf/skills/`,
`~/.codeium/windsurf/rules/` and `~/.codeium/windsurf/mcp_config.json`.

### Cursor symlinks

The Cursor converter symlinks skills rather than copying them. Those symlinks now
point into the plugin cache (`~/.cache/sfce/plugins/sf-compound-engineering`)
instead of a user-owned clone, so clearing that cache breaks an existing Cursor
install until `install` is re-run. Consider a `--copy` flag if this bites.

## Still outstanding

- **Republish after every CLI change.** `1.0.0` was published mid-review and did not contain the destination-reporting fix, so for a window the registry served a binary that misreported where OpenClaw and Qwen install. Verify with `npm view salesforce-compound-engineering-plugin version` against `cli/package.json` before trusting a matrix row.
- **Five converters are unverified in a clean environment**: OpenCode, Kiro, Pi, OpenClaw and Qwen. They have unit tests but no install run. Windsurf, Gemini and Droid were exercised through `--to all` in Round 1.
- **Claude Code has had no fresh-user install run.** Manifests are valid and reachable; the install itself is unconfirmed, because `/plugin` cannot be driven from a shell.
- **Tool-load is unconfirmed everywhere.** Every verified row proves files land in the right place, not that the tool reads them.
- **No external installers recruited yet.** DIV-58 targets 4/5 successful installs. Install *duration* is now measured at 1–5 seconds, but on one machine, by the author — which is the weakest possible sample for a docs-follow-along test. The success-rate half of the KPI is untaken.
