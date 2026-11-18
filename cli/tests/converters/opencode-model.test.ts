import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { ClaudePlugin } from "../../src/parser/types.js";
import { OpenCodeConverter, resolveOpenCodeModel } from "../../src/converters/opencode.js";

describe("OpenCode model aliases", () => {
  test("opus resolves to Claude Opus 5.5", () => {
    expect(resolveOpenCodeModel("opus")).toBe("anthropic/claude-opus-5-5");
    expect(resolveOpenCodeModel("haiku")).toBe("anthropic/claude-haiku-4-5");
    expect(resolveOpenCodeModel("openai/gpt-6-sol")).toBe("openai/gpt-6-sol");
  });

  test("a review agent on Opus 5.5 does not emit temperature", () => {
    const converter = new OpenCodeConverter();
    const dir = mkdtempSync(join(tmpdir(), "sfce-oc-"));
    const plugin: ClaudePlugin = {
      name: "sf-compound-engineering",
      version: "4.1.0",
      description: "test",
      commands: [],
      agents: [
        {
          name: "security-reviewer",
          description: "security review of Apex",
          category: "review",
          model: "opus",
          body: "Review the diff.",
        },
      ],
      skills: [],
      mcpServers: {},
      hooks: undefined,
    };
    try {
      converter.convert(plugin, dir);
      const written = readFileSync(
        join(dir, ".opencode", "agents", "security-reviewer.md"),
        "utf8",
      );
      expect(written).toContain("model: anthropic/claude-opus-5-5");
      expect(written).not.toContain("temperature:");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
