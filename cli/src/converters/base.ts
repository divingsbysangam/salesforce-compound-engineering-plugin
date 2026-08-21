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
   * Append the primer to an always-loaded instructions file, idempotently
   * (a marker comment guards against duplicate appends on re-sync).
   */
  protected appendInstructionsPrimer(path: string, primer: string): void {
    const marker = "<!-- sf-compound-engineering:session-discipline-primer -->";
    const block = [
      marker,
      "# SF Compound Engineering — Session Discipline Primer",
      "",
      primer,
      "",
    ].join("\n");

    if (existsSync(path)) {
      const existing = readFileSync(path, "utf-8");
      if (existing.includes(marker)) return; // already present
      this.writeFile(path, existing.replace(/\s*$/, "") + "\n\n" + block);
      return;
    }
    this.writeFile(path, block);
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
