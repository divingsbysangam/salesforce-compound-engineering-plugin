# Hook portability matrix

The plugin ships one discipline mechanism that is not skill-routed: a **session-start
primer**. On Claude Code it is a native `SessionStart` hook
(`hooks/hooks.json` → `scripts/session-start`), whose stdout Claude Code adds to
context verbatim on cold start. That guarantees the three hard discipline gates are
present regardless of whether a skill description happens to match the user's phrasing.

Every other platform receives the *same* primer, routed through the CLI converters in
`cli/src/converters/` — **not** hand-authored per platform. The canonical parse
(`readPlugin` in `cli/src/parser/plugin.ts`) reads `hooks/hooks.json` and the
`scripts/session-start` script, extracts the primer text from the script's heredoc
(single source of truth — the constant never drifts from the script), and exposes it on
`ClaudePlugin.hooks`. Each converter's `convert()` calls `emitHook(plugin, baseDir)`.

## Three hook-support classes

* **native-hook** — the platform has a real session/startup hook primitive. Emit that
 platform's native hook declaration and copy the primer script it runs.

* **lifecycle-callback** — the platform is an in-process extension host (JS runtime).
 Emit a session-start callback that returns the primer text.

* **instructions-file** (safe default) — the platform has no hook primitive. Append the
 primer text to a file the platform loads on **every** session. `BaseConverter.emitHook`
 is exactly this fallback; it is idempotent (guarded by a marker comment so re-syncs do
 not duplicate the block).

## Matrix

No target is silently omitted (Protocol F): every one of the 11 conversion targets, plus
Claude Code itself, has an explicit class and delivery mechanism.

| Target | Class | Delivery mechanism | Output path (relative to platform base) |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code** (source) | native-hook | `SessionStart` hook, matcher `startup`, runs the primer script; stdout added to context verbatim | `hooks/hooks.json` + `scripts/session-start` |
| **Kiro** | native-hook | Kiro Agent Hook (`.kiro.hook` JSON) with `when.type = sessionStart`, runs copied primer script | `.kiro/hooks/session-start-primer.kiro.hook` + `.kiro/hooks/session-start` |
| **OpenClaw** | lifecycle-callback | Generated `session-start.ts` exporting `onSessionStart()` → primer text, invoked by the extension host | `session-start.ts` |
| **Codex** | instructions-file | Primer appended to always-loaded `AGENTS.md` | `.codex/AGENTS.md` |
| **GitHub Copilot** | instructions-file | Primer appended to `copilot-instructions.md` (always-loaded repo context) | `.github/copilot-instructions.md` |
| **Cursor** | instructions-file | Primer written as an always-applied rules file | `.cursor/rules/sf-discipline-primer.md` |
| **Windsurf** | instructions-file | Primer written as an always-loaded rules file | `<base>/rules/sf-discipline-primer.md` |
| **Gemini CLI** | instructions-file | Primer appended to hierarchical context file `GEMINI.md` | `.gemini/GEMINI.md` |
| **Factory Droid** | instructions-file | Primer appended to always-loaded `AGENTS.md` | `<.factory>/AGENTS.md` |
| **OpenCode** | instructions-file | Primer appended to always-loaded `AGENTS.md` | `<opencode base>/AGENTS.md` |
| **Pi** | instructions-file | Primer appended to always-loaded `AGENTS.md` | `<.pi/agent>/AGENTS.md` |
| **Qwen Code** | instructions-file | Primer appended to hierarchical context file `QWEN.md` | `<qwen ext>/QWEN.md` |

## Where the classification lives in code

* `BaseConverter.hookClass` (`cli/src/converters/base.ts`) records the class; the default
 is `instructions-file`. `BaseConverter.instructionsFileName` names the always-loaded
 file for that fallback (default `AGENTS.md`, overridden per platform above).

* `BaseConverter.emitHook` is the instructions-file fallback. `KiroConverter` overrides it
 for the native hook; `OpenClawConverter` overrides it for the lifecycle callback.

## Source-of-truth notes

* The primer **text** has exactly one source: the heredoc inside `scripts/session-start`.
 The parser extracts it (`extractSessionStartPrimer`); no converter hardcodes it. If you
 change the primer, edit only `scripts/session-start` and every platform follows.

* `scripts/session-start` and `hooks/hooks.json` are owned by the Claude Code hook wiring
 and must not be edited by converter code — the CLI only reads them.

* Platforms whose install base is under `$HOME` (Droid, OpenCode, Pi, Windsurf global,
 OpenClaw, Qwen) write the instructions file inside their extension/config tree; whether
 that tree is auto-loaded from an arbitrary project cwd depends on the user's platform
 configuration. This is the inherent portability limit the fallback documents — the
 primer is still delivered through the converter, not omitted.