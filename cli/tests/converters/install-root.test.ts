import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import type { ClaudePlugin } from "../../src/parser/types.js";
import { CodexConverter } from "../../src/converters/codex.js";
import { CopilotConverter } from "../../src/converters/copilot.js";
import { CursorConverter } from "../../src/converters/cursor.js";
import { DroidConverter } from "../../src/converters/droid.js";
import { GeminiConverter } from "../../src/converters/gemini.js";
import { KiroConverter } from "../../src/converters/kiro.js";
import { OpenClawConverter } from "../../src/converters/openclaw.js";
import { OpenCodeConverter } from "../../src/converters/opencode.js";
import { PiConverter } from "../../src/converters/pi.js";
import { QwenConverter } from "../../src/converters/qwen.js";
import { WindsurfConverter } from "../../src/converters/windsurf.js";

const plugin: ClaudePlugin = {
  name: "sf-compound-engineering",
  version: "1.0.0",
  description: "test",
  commands: [],
  agents: [],
  skills: [
    {
      name: "demo-skill",
      description: "demo",
      files: [{ relativePath: "SKILL.md", content: "---\nname: demo-skill\n---\n\nbody\n" }],
      body: "body",
    } as ClaudePlugin["skills"][number],
  ],
  mcpServers: {},
  hooks: undefined,
};

/** Converters that install into the project and must honour outputDir. */
const PROJECT_SCOPED = [
  new CodexConverter(),
  new CopilotConverter(),
  new CursorConverter(),
  new GeminiConverter(),
  new KiroConverter(),
  new DroidConverter(),
  new OpenCodeConverter(),
  new PiConverter(),
];

/** Converters that can only install into a user-global directory. */
const HOME_SCOPED = [new OpenClawConverter(), new QwenConverter()];

describe("installRoot reports the real destination", () => {
  test("project-scoped converters resolve inside the requested directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "sfce-root-"));
    try {
      for (const c of PROJECT_SCOPED) {
        expect(c.installRoot(dir, plugin).startsWith(dir)).toBe(true);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("home-scoped converters report the home directory, not the request", () => {
    const dir = mkdtempSync(join(tmpdir(), "sfce-root-"));
    try {
      for (const c of HOME_SCOPED) {
        const root = c.installRoot(dir, plugin);
        expect(root.startsWith(dir)).toBe(false);
        expect(root.startsWith(homedir())).toBe(true);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("Windsurf reports per scope", () => {
    const dir = mkdtempSync(join(tmpdir(), "sfce-root-"));
    try {
      const c = new WindsurfConverter();
      c.setScope("workspace");
      expect(c.installRoot(dir, plugin).startsWith(dir)).toBe(true);
      c.setScope("global");
      expect(c.installRoot(dir, plugin).startsWith(homedir())).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("installRoot matches where convert actually writes", () => {
  // The regression this guards: a converter that quietly writes somewhere other
  // than the path it advertises, leaving the requested project empty.
  test("project-scoped converters write inside the requested directory and nowhere else", () => {
    for (const c of PROJECT_SCOPED) {
      const dir = mkdtempSync(join(tmpdir(), "sfce-write-"));
      try {
        c.convert(plugin, dir);
        const root = c.installRoot(dir, plugin);
        expect(existsSync(root)).toBe(true);
        // Something landed in the requested directory.
        expect(readdirSync(dir).length).toBeGreaterThan(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  test("home-scoped converters leave the requested directory untouched", () => {
    for (const c of HOME_SCOPED) {
      const dir = mkdtempSync(join(tmpdir(), "sfce-write-"));
      try {
        // Deliberately not calling convert() — it would write into the real
        // home directory. installRoot is the contract under test, and it
        // already reports outside `dir`.
        expect(c.installRoot(dir, plugin).startsWith(dir)).toBe(false);
        expect(readdirSync(dir).length).toBe(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });
});
