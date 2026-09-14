import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { rewritePaths } from "../transforms/paths.js";
import { rewriteAllRefs } from "../transforms/references.js";

/** How a target platform receives the session-start discipline primer. */
export type HookClass =
  | "native-hook" // platform has a real session/startup hook primitive
  | "lifecycle-callback" // platform has an in-process startup callback (JS runtime)
  | "instructions-file"; // no hook primitive — append primer to an always-loaded file

/** Escape a literal for use inside a RegExp. */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export abstract class BaseConverter {
  abstract readonly target: TargetPlatform;
  abstract readonly label: string;

  /**
   * Hook-support class for this platform. Default is the safe instructions-file
   * fallback; converters override `emitHook` for native/lifecycle handling.
   * Kept in sync with docs/hook-portability-matrix.md.
   */
  readonly hookClass: HookClass = "instructions-file";

  /**
   * For the instructions-file fallback: the always-loaded instructions file the
   * primer is appended to, relative to this platform's output base dir.
   */
  readonly instructionsFileName: string = "AGENTS.md";

  abstract convert(plugin: ClaudePlugin, outputDir: string): void;

  /**
   * Where this converter actually writes, given the requested output directory.
   *
   * Most targets install into the project and can use the default. The targets
   * that install into a user-global location (Windsurf at global scope,
   * OpenClaw, Qwen) override this so callers can report the real destination
   * rather than the requested one. Converters resolve their base directory
   * through this method, so the reported path cannot drift from the written one.
   */
  installRoot(outputDir: string, _plugin: ClaudePlugin): string {
    return outputDir;
  }

  /**
   * Emit the plugin's session-start primer for this platform.
   *
   * Called by each converter with its already-resolved output base dir. The
   * base implementation is the instructions-file fallback — it appends the
   * primer text (centralized in `plugin.hooks.primerText`, extracted from the
   * canonical `scripts/session-start`) to this platform's always-loaded file.
   * Native-hook and lifecycle-callback platforms override this method.
   */
  protected emitHook(plugin: ClaudePlugin, baseDir: string): void {
    const primer = plugin.hooks?.primerText?.trim();
    if (!primer) return;
    const path = join(baseDir, this.instructionsFileName);
    this.appendInstructionsPrimer(path, primer);
    this.log("Hook (instructions-file)", path);
  }

  /**
   * Write the primer into an always-loaded instructions file, REPLACING any
   * block a previous conversion left behind.
   *
   * This used to return early whenever the marker was present, which is
   * idempotent but wrong: an already-converted repository kept its OLD primer
   * forever, so any change to the primer text reached new installs only. Every
   * existing install would have been stranded on the previous wording -- which
   * is precisely the population that most needs an updated instruction.
   *
   * The block is delimited at both ends so it can be replaced in place without
   * disturbing anything the user wrote around it.
   */
  protected appendInstructionsPrimer(path: string, primer: string): void {
    const begin = "<!-- sf-compound-engineering:session-discipline-primer -->";
    const end = "<!-- /sf-compound-engineering:session-discipline-primer -->";
    const block = [
      begin,
      "# SF Compound Engineering — Session Discipline Primer",
      "",
      primer,
      "",
      end,
    ].join("\n");

    if (!existsSync(path)) {
      this.writeFile(path, block);
      return;
    }

    const existing = readFileSync(path, "utf-8");

    // Current shape: a fully delimited block. Replace it wholesale.
    const delimited = new RegExp(
      `${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`,
    );
    if (delimited.test(existing)) {
      this.writeFile(path, existing.replace(delimited, block));
      return;
    }

    // Legacy shape: an opening marker with no terminator, written by an earlier
    // CLI that appended the primer at the end of the file.
    //
    // "Everything from the marker to EOF is the primer" is the tempting rule and
    // it DESTROYS USER CONTENT: anyone who added notes below that old primer
    // loses them on the next sync. So the block is bounded at the next markdown
    // heading after the marker, and everything from there on is preserved.
    const legacyAt = existing.indexOf(begin);
    if (legacyAt !== -1) {
      const before = existing.slice(0, legacyAt);
      const rest = existing.slice(legacyAt + begin.length);

      // Our own heading is part of the block; the next heading after it is the
      // user's. Skip one leading heading, then look for the boundary.
      const afterOwnHeading = rest.replace(/^\s*#.*$/m, "");
      const offset = rest.length - afterOwnHeading.length;
      const boundary = afterOwnHeading.search(/^#{1,6}\s|^<!--/m);

      const tail = boundary === -1 ? "" : rest.slice(offset + boundary);
      this.writeFile(
        path,
        before.replace(/\s*$/, "") +
          (before.trim() ? "\n\n" : "") +
          block +
          (tail.trim() ? "\n\n" + tail.replace(/^\s*/, "") : "\n"),
      );
      return;
    }

    this.writeFile(path, existing.replace(/\s*$/, "") + "\n\n" + block);
  }

  /**
   * Apply all content transforms (paths + references) for this target.
   */
  protected transform(content: string): string {
    let result = rewritePaths(content, this.target);
    result = rewriteAllRefs(result, this.target);
    return result;
  }

  /**
   * Write a file, creating parent directories as needed.
   */
  protected writeFile(path: string, content: string, mode?: number): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, { mode });
  }

  /**
   * Merge JSON into an existing file (user keys win on conflict).
   */
  protected mergeJsonFile(path: string, newData: Record<string, unknown>): void {
    let existing: Record<string, unknown> = {};
    if (existsSync(path)) {
      existing = JSON.parse(readFileSync(path, "utf-8"));
    }
    // Plugin data goes first, user data overrides
    const merged = { ...newData, ...existing };
    this.writeFile(path, JSON.stringify(merged, null, 2) + "\n");
  }

  /**
   * Log a conversion action.
   */
  protected log(action: string, path: string): void {
    console.log(`  ${action}: ${path}`);
  }
}
