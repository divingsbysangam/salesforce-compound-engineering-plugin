import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { readPlugin } from "../../src/parser/plugin.js";
import type { ClaudePlugin } from "../../src/parser/types.js";
import { CodexConverter } from "../../src/converters/codex.js";
import { KiroConverter } from "../../src/converters/kiro.js";

const PLUGIN_ROOT = resolve(import.meta.dir, "..", "..", "..");

describe("session-start hook emission through converters", () => {
  let plugin: ClaudePlugin;
  let outDir: string;

  beforeAll(() => {
    plugin = readPlugin(PLUGIN_ROOT);
    outDir = mkdtempSync(join(tmpdir(), "sfce-hooks-"));
  });

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  test("canonical parse surfaces the session-start hook + centralized primer text", () => {
    expect(plugin.hooks).toBeTruthy();
    expect(plugin.hooks!.config).toBeTruthy();
    expect(plugin.hooks!.scriptRelPath).toBe(join("scripts", "session-start"));
    // Primer text is extracted from the script's heredoc — single source of truth.
    expect(plugin.hooks!.primerText).toContain("compound-engineering plugin active");
    expect(plugin.hooks!.primerText).toContain("Three non-negotiable discipline gates");
    expect(plugin.hooks!.scriptContent).toContain("SessionStart hook");
  });

  test("native-hook platform (Kiro) emits a hook declaration referencing the primer", () => {
    new KiroConverter().convert(plugin, outDir);

    const hookPath = join(outDir, ".kiro", "hooks", "session-start-primer.kiro.hook");
    expect(existsSync(hookPath)).toBe(true);

    const decl = JSON.parse(readFileSync(hookPath, "utf-8"));
    expect(decl.when.type).toBe("sessionStart");
    // The hook declaration references the copied session-start primer script.
    expect(decl.then.command).toContain("session-start");

    // The primer script itself is copied alongside the declaration.
    expect(existsSync(join(outDir, ".kiro", "hooks", "session-start"))).toBe(true);
  });

  test("instructions-file fallback (Codex) writes the primer into its always-loaded file", () => {
    new CodexConverter().convert(plugin, outDir);

    const agentsPath = join(outDir, ".codex", "AGENTS.md");
    expect(existsSync(agentsPath)).toBe(true);

    const content = readFileSync(agentsPath, "utf-8");
    expect(content).toContain("Session Discipline Primer");
    expect(content).toContain("Three non-negotiable discipline gates");
  });

  test("instructions-file append is idempotent (re-sync does not duplicate the primer)", () => {
    const codex = new CodexConverter();
    codex.convert(plugin, outDir);
    codex.convert(plugin, outDir); // second sync

    const content = readFileSync(join(outDir, ".codex", "AGENTS.md"), "utf-8");
    const markerCount = content.split(
      "<!-- sf-compound-engineering:session-discipline-primer -->",
    ).length - 1;
    expect(markerCount).toBe(1);
  });
});
