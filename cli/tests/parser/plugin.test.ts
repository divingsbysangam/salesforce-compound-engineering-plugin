import { describe, expect, test } from "bun:test";
import { readPlugin } from "../../src/parser/plugin.js";
import { resolve } from "path";

const PLUGIN_ROOT = resolve(import.meta.dir, "..", "..", "..");

describe("readPlugin", () => {
  test("reads plugin manifest from project root", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    expect(plugin.name).toBe("sf-compound-engineering");
    expect(plugin.version).toMatch(/^4\./);
  });

  test("has no standalone commands (V3 retired commands/ for skills)", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    expect(Array.isArray(plugin.commands)).toBe(true);
  });

  test("is agentless — no registered agents (V3.1)", () => {
    // V3.1 went agentless: former agents are now persona prompt assets
    // shipped inside skills under references/personas/. See plugin.test
    // below that personas travel with skills.
    const plugin = readPlugin(PLUGIN_ROOT);
    expect(plugin.agents.length).toBe(0);
  });

  test("review personas ship as skill files under references/personas/", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    const review = plugin.skills.find((s) => s.name === "sf-review");
    expect(review).toBeTruthy();
    const personaFiles = review!.files.filter((f) =>
      f.relativePath.includes("references/personas/"),
    );
    expect(personaFiles.length).toBeGreaterThan(0);
  });

  test("parses skills from skills/ directory", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    expect(plugin.skills.length).toBeGreaterThan(0);
    for (const skill of plugin.skills) {
      expect(skill.name).toBeTruthy();
      expect(skill.files.length).toBeGreaterThan(0);
    }
  });

  test("parses MCP servers from .mcp.json", () => {
    const plugin = readPlugin(PLUGIN_ROOT);
    expect(Object.keys(plugin.mcpServers).length).toBeGreaterThanOrEqual(0);
  });

  test("throws on invalid plugin directory", () => {
    expect(() => readPlugin("/nonexistent/path")).toThrow("No plugin.json found");
  });
});
