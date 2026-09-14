import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { readPlugin } from "../../src/parser/plugin.js";
import { CodexConverter } from "../../src/converters/codex.js";
import { CursorConverter } from "../../src/converters/cursor.js";
import type { ClaudePlugin } from "../../src/parser/types.js";

const PLUGIN_ROOT = resolve(import.meta.dir, "..", "..", "..");

/**
 * U9 — cross-platform intent and the portability matrix.
 *
 * Two silent failures are closed here, and both are tested by reproducing the
 * failure rather than by asserting the fix:
 *
 *   1. Primer extraction anchored on POSITION. Any heredoc added above the
 *      primer silently became the discipline primer on eleven targets.
 *   2. The instructions-file primer was SKIPPED when a marker was present, so
 *      an already-converted repository kept its old primer forever.
 */

let outDir: string;
beforeEach(() => {
  outDir = mkdtempSync(join(tmpdir(), "sfce-u9-"));
});
afterEach(() => rmSync(outDir, { recursive: true, force: true }));

describe("the primer carries the gate's intent", () => {
  test("readPlugin extracts a primer containing the metadata-gate intent", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    const primer = plugin.hooks?.primerText ?? "";
    expect(primer).toContain("Raw metadata edits");
    expect(primer).toContain("authoring skill");
    // The honest half: on eleven targets this is instruction, not enforcement.
    expect(primer).toContain("absence of a refusal is never evidence");
  });

  test("the primer still begins with the expected first line", () => {
    const primer = readPlugin(PLUGIN_ROOT).hooks?.primerText ?? "";
    expect(primer.split("\n")[0]).toContain("compound-engineering plugin active");
  });

  test("the Kiro-copied script runs with an empty environment and emits the primer", () => {
    // Kiro copies this script verbatim and runs it under shell error-exit. An
    // environment read would abort before the heredoc and delete the primer on
    // every conversion target, so the script must need nothing from env.
    const out = execFileSync("/usr/bin/env", ["-i", "/bin/bash", join(PLUGIN_ROOT, "scripts", "session-start")], {
      encoding: "utf-8",
    });
    expect(out).toContain("compound-engineering plugin active");
    expect(out).toContain("Raw metadata edits");
  });

  test("the script exits 0 with an empty environment and writes no stderr", () => {
    const res = Bun.spawnSync(["/usr/bin/env", "-i", "/bin/bash", join(PLUGIN_ROOT, "scripts", "session-start")]);
    expect(res.exitCode).toBe(0);
    expect(new TextDecoder().decode(res.stderr).trim()).toBe("");
  });
});

describe("primer extraction is anchored, not positional", () => {
  function pluginWithScript(body: string): ClaudePlugin {
    const root = join(outDir, "plugin");
    mkdirSync(join(root, "scripts"), { recursive: true });
    mkdirSync(join(root, ".claude-plugin"), { recursive: true });
    mkdirSync(join(root, "hooks"), { recursive: true });
    writeFileSync(join(root, ".claude-plugin", "plugin.json"),
      JSON.stringify({ name: "t", version: "1.0.0" }));
    writeFileSync(join(root, "hooks", "hooks.json"), JSON.stringify({ hooks: {} }));
    writeFileSync(join(root, "scripts", "session-start"), body);
    return readPlugin(root);
  }

  test("a heredoc ABOVE the primer does not become the primer", () => {
    // The silent failure: positional extraction took the first heredoc in the
    // file, so an unrelated block added above it would ship to eleven targets
    // as the discipline primer with nothing to notice.
    const script = [
      "#!/usr/bin/env bash",
      // No redirect after the delimiter: with one, the positional fallback
      // regex does not match this heredoc at all and the fixture would pass
      // even with the anchor removed — proving nothing.
      "cat <<'UNRELATED'",
      "THIS IS NOT THE PRIMER",
      "UNRELATED",
      "cat <<'SFCE_PRIMER'",
      "THE REAL PRIMER",
      "SFCE_PRIMER",
    ].join("\n");
    const primer = pluginWithScript(script).hooks?.primerText ?? "";
    expect(primer).toBe("THE REAL PRIMER");
    expect(primer).not.toContain("NOT THE PRIMER");
  });

  test("a script predating the named delimiter still yields a primer", () => {
    const script = ["#!/usr/bin/env bash", "cat <<'EOF'", "LEGACY PRIMER", "EOF"].join("\n");
    expect(pluginWithScript(script).hooks?.primerText).toBe("LEGACY PRIMER");
  });
});

describe("re-conversion replaces the primer instead of stranding it", () => {
  function convertWith(primerText: string): string {
    const plugin = readPlugin(PLUGIN_ROOT);
    plugin.hooks!.primerText = primerText;
    new CodexConverter().convert(plugin as ClaudePlugin, outDir);
    const path = join(outDir, ".codex", "AGENTS.md");
    return readFileSync(path, "utf-8");
  }

  test("converting twice with different primer text: the second text wins", () => {
    // The bug: an early return on marker presence meant every already-converted
    // repository kept its original primer forever, so a wording change reached
    // new installs only — stranding exactly the population that needed it.
    convertWith("FIRST PRIMER TEXT");
    const after = convertWith("SECOND PRIMER TEXT");
    expect(after).toContain("SECOND PRIMER TEXT");
    expect(after).not.toContain("FIRST PRIMER TEXT");
  });

  test("the block appears exactly once after repeated conversions", () => {
    convertWith("P1");
    convertWith("P2");
    const after = convertWith("P3");
    const opens = after.split("<!-- sf-compound-engineering:session-discipline-primer -->").length - 1;
    expect(opens).toBe(1);
  });

  test("a LEGACY unterminated block does not eat the user's notes below it", () => {
    // The destructive rule is tempting and wrong: "everything from the marker
    // to EOF is the primer". An older CLI wrote an opening marker with no
    // terminator, so anyone who added notes BELOW that primer would lose them
    // on the next sync. The block is bounded at the next markdown heading.
    convertWith("ORIGINAL");
    const path = join(outDir, ".codex", "AGENTS.md");
    const legacy = readFileSync(path, "utf-8")
      .replace("<!-- /sf-compound-engineering:session-discipline-primer -->", "");
    writeFileSync(path, legacy + "\n\n## My own notes\n\nkeep me please\n");

    const after = convertWith("UPDATED");
    expect(after, "user notes below a legacy block were destroyed").toContain("keep me please");
    expect(after).toContain("## My own notes");
    expect(after).toContain("UPDATED");
    expect(after).not.toContain("ORIGINAL");
  });

  test("user content around the block is preserved", () => {
    convertWith("ORIGINAL");
    const path = join(outDir, ".codex", "AGENTS.md");
    const withUserText = "# My own notes\n\nkeep me\n\n" + readFileSync(path, "utf-8");
    writeFileSync(path, withUserText);
    const after = convertWith("UPDATED");
    expect(after).toContain("keep me");
    expect(after).toContain("UPDATED");
    expect(after).not.toContain("ORIGINAL");
  });
});

describe("no enforcement declaration reaches a non-Claude target", () => {
  test("a Cursor conversion emits the primer and no hook declaration", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    new CursorConverter().convert(plugin as ClaudePlugin, outDir);

    const walk = (dir: string): string[] => {
      const { readdirSync } = require("fs") as typeof import("fs");
      return readdirSync(dir, { withFileTypes: true }).flatMap((e: any) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
    };
    // The Cursor converter emits symlinks; a dangling one is a directory entry
    // that cannot be read. Skip what is unreadable rather than failing on it —
    // the assertion here is about CONTENT that shipped, not about link health.
    const blob = walk(outDir)
      .map((f) => {
        try {
          return readFileSync(f, "utf-8");
        } catch {
          return "";
        }
      })
      .join("\n");
    expect(blob.length, "the conversion produced no readable output").toBeGreaterThan(0);

    // The intent arrives as text...
    expect(blob).toContain("Raw metadata edits");
    // ...and nothing derived from the enforcement events does.
    for (const forbidden of ["PreToolUse", "PostToolUse", "UserPromptExpansion",
                             "sfce-metadata-gate", "sfce-bash-observer"]) {
      expect(blob, `${forbidden} must not reach a non-Claude target`).not.toContain(forbidden);
    }
  });
});

describe("the portability matrix and Protocol F", () => {
  const matrix = readFileSync(join(PLUGIN_ROOT, "docs", "hook-portability-matrix.md"), "utf-8");
  const contributing = readFileSync(join(PLUGIN_ROOT, "CONTRIBUTING.md"), "utf-8");

  test("CONTRIBUTING.md defines Protocol F, which three documents cite", () => {
    expect(contributing).toContain("### Protocol F");
    expect(contributing).toContain("not deliverable");
  });

  test("the matrix names all twelve targets", () => {
    for (const target of ["Claude Code", "Kiro", "OpenClaw", "Codex", "GitHub Copilot",
                          "Cursor", "Windsurf", "Gemini CLI", "Factory Droid",
                          "OpenCode", "Pi", "Qwen Code"]) {
      expect(matrix, `matrix omits ${target}`).toContain(target);
    }
  });

  test("every target row carries a class for all three hooks, with no blank cell", () => {
    const rows = matrix.split("\n").filter((l) => l.startsWith("| **"));
    expect(rows.length).toBe(12);
    for (const row of rows) {
      const cells = row.split("|").slice(1, -1).map((c) => c.trim());
      expect(cells.length, `row has ${cells.length} cells: ${row}`).toBe(4);
      for (const c of cells) expect(c.length, `blank cell in: ${row}`).toBeGreaterThan(0);
    }
  });

  test("the matrix records that disabling hooks removes the primer", () => {
    expect(matrix).toContain("Disabling all hooks removes the primer");
    expect(matrix).toContain("only cross-platform discipline mechanism");
  });

  test("the matrix records the Cursor finding as measured, not assumed", () => {
    expect(matrix).toContain("Verified, not assumed");
    expect(matrix).toContain("cursor.ts");
  });
});
