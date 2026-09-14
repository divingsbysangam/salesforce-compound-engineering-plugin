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

## Hook-support classes

A class describes how a capability ARRIVES on a target, not whether the target is
supported:

* **native-hook** — the platform has a real hook primitive. Emit that platform's
  native declaration and copy the script it runs.

* **lifecycle-callback** — the platform is an in-process extension host. Emit a
  session-start callback that returns the primer text.

* **instructions-file** (safe default) — no hook primitive. Write the primer into
  a file the platform loads on every session.

* **not deliverable** — the capability cannot arrive here at all. This is a cell
  VALUE, not a fourth kind of platform: the same target can be native-hook for
  one hook and not deliverable for another.

## A class per hook per target (Protocol F)

Three hooks ship. Enforcement exists on Claude Code only; every other target
receives the *intent* as primer text and nothing more. That is a deliberate
decision, not a gap — an instructions file cannot deny a tool call, and emitting
one while implying the capability shipped is exactly the silent omission
Protocol F forbids.

| Target | session-start primer | metadata gate (`PreToolUse`) | skill telemetry + bypass observer |
| --- | --- | --- | --- |
| **Claude Code** (source) | native-hook | native-hook, opt-in, off by default | native-hook, opt-in, off by default |
| **Kiro** | native-hook (`.kiro.hook`, `sessionStart`) | not deliverable — no tool-call interception | not deliverable |
| **OpenClaw** | lifecycle-callback (`onSessionStart()`) | not deliverable — callback cannot veto a tool call | not deliverable |
| **Codex** | instructions-file (`AGENTS.md`) | not deliverable | not deliverable |
| **GitHub Copilot** | instructions-file | not deliverable | not deliverable |
| **Cursor** | instructions-file | not deliverable | not deliverable |
| **Windsurf** | instructions-file | not deliverable | not deliverable |
| **Gemini CLI** | instructions-file | not deliverable | not deliverable |
| **Factory Droid** | instructions-file | not deliverable | not deliverable |
| **OpenCode** | instructions-file | not deliverable | not deliverable |
| **Pi** | instructions-file | not deliverable | not deliverable |
| **Qwen Code** | instructions-file | not deliverable | not deliverable |

Twelve targets, three hooks, no blank cells.

## Where the classification lives in code

The primer column is the only one with a code path, and it is
`BaseConverter.emitHook` plus each converter's override. The two enforcement
columns are uniformly "not deliverable", and that is enforced by ABSENCE: no
converter reads anything but `hooks.primerText`, so no enforcement declaration
can reach a non-Claude target even by accident.

Verified, not assumed:

* `cli/src/converters/cursor.ts` contains **no** reference to hooks at all.
* Only `kiro.ts` translates a hook, and it hardcodes the session-start primer.
* `base.ts` and `openclaw.ts` consume `hooks.primerText` — the prose, never the
  mechanism.
* `parseHooks()` in `cli/src/parser/plugin.ts` reads `hooks/hooks.json` into a
  raw `config` field that **no converter consumes**.

## Cursor, and the question U1 was sent to answer

The plan asked what Cursor does with a `PreToolUse` entry it cannot honour, and
whether the answer forces splitting `hooks/hooks.json` into a portable file and a
Claude-only file.

**It does not, and the reason is upstream of Cursor.** Cursor never receives such
an entry: the conversion pipeline drops every non-primer hook before emission, as
the four points above show. A split would solve a delivery problem that the
converter architecture already prevents.

Scope of that finding: it is settled at the converter, which is where the
behaviour is decided. Cursor's own runtime handling of an unhonourable entry was
not observed, because no supported path puts one in front of it.

## Consequences worth stating plainly

* **Disabling all hooks removes the primer**, and the primer is this plugin's
  only cross-platform discipline mechanism. On Claude Code, `disableAllHooks` and
  enterprise `allowManagedHooksOnly` suppress it — along with the gate's own
  session-start self-check, so the check cannot report its own suppression.
  Silence is not evidence of health.

* **The absence of a refusal is never evidence of authorisation** on any target,
  and on eleven of the twelve there is no refusal mechanism at all.

* The primer block written into an instructions file is **replaced** on re-sync,
  not skipped. Skipping left already-converted repositories on their original
  primer forever, so a wording change reached new installs only — stranding
  exactly the population that most needed the update.

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