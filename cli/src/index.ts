#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { resolve } from "path";
import { readPlugin } from "./parser/plugin.js";
import { lint as lintPlugin } from "./lint/index.js";
import { detectInstalledTools, isValidTarget } from "./utils/detect.js";
import { CopilotConverter } from "./converters/copilot.js";
import { WindsurfConverter } from "./converters/windsurf.js";
import { GeminiConverter } from "./converters/gemini.js";
import { KiroConverter } from "./converters/kiro.js";
import { OpenCodeConverter } from "./converters/opencode.js";
import { CodexConverter } from "./converters/codex.js";
import { CursorConverter } from "./converters/cursor.js";
import { DroidConverter } from "./converters/droid.js";
import { PiConverter } from "./converters/pi.js";
import { OpenClawConverter } from "./converters/openclaw.js";
import { QwenConverter } from "./converters/qwen.js";
import type { TargetPlatform } from "./parser/types.js";
import type { BaseConverter } from "./converters/base.js";

const CONVERTERS: Record<TargetPlatform, BaseConverter> = {
  copilot: new CopilotConverter(),
  windsurf: new WindsurfConverter(),
  gemini: new GeminiConverter(),
  kiro: new KiroConverter(),
  opencode: new OpenCodeConverter(),
  codex: new CodexConverter(),
  cursor: new CursorConverter(),
  droid: new DroidConverter(),
  pi: new PiConverter(),
  openclaw: new OpenClawConverter(),
  qwen: new QwenConverter(),
};

const install = defineCommand({
  meta: { name: "install", description: "Install plugin to target AI coding tool" },
  args: {
    plugin: { type: "positional", description: "Plugin name or path", required: true },
    to: { type: "string", description: "Target: copilot, windsurf, gemini, kiro, opencode, codex, cursor, droid, pi, openclaw, qwen, or all", required: true },
    scope: { type: "string", description: "Scope: global or workspace (for Windsurf)", default: "global" },
  },
  run({ args }) {
    const target = args.to;
    if (!isValidTarget(target)) {
      console.error(`Unknown target: ${target}`);
      console.error(`Valid targets: ${Object.keys(CONVERTERS).join(", ")}, all`);
      process.exit(1);
    }

    // Resolve plugin path — if it's a name, use current directory
    const pluginDir = resolve(args.plugin === "sf-compound-engineering" ? "." : args.plugin);
    console.log(`Reading plugin from: ${pluginDir}`);

    const plugin = readPlugin(pluginDir);
    console.log(`Found: ${plugin.name} v${plugin.version}`);
    console.log(`  ${plugin.commands.length} commands, ${plugin.agents.length} agents, ${plugin.skills.length} skills`);
    console.log(`  ${Object.keys(plugin.mcpServers).length} MCP servers\n`);

    const targets = target === "all" ? detectInstalledTools() : [target as TargetPlatform];

    if (targets.length === 0) {
      console.log("No supported AI coding tools detected. Specify a target with --to.");
      process.exit(0);
    }

    for (const t of targets) {
      const converter = CONVERTERS[t];
      console.log(`\nConverting for ${converter.label}...`);

      if (t === "windsurf") {
        (converter as WindsurfConverter).setScope(args.scope as "global" | "workspace");
      }
      converter.convert(plugin, pluginDir);
    }

    console.log("\nDone! Plugin installed successfully.");
  },
});

const sync = defineCommand({
  meta: { name: "sync", description: "Sync current directory plugin to target AI coding tools" },
  args: {
    target: { type: "string", description: "Target platform or 'all'", default: "all" },
    scope: { type: "string", description: "Scope: global or workspace (for Windsurf)", default: "global" },
  },
  run({ args }) {
    const target = args.target;
    if (!isValidTarget(target)) {
      console.error(`Unknown target: ${target}`);
      console.error(`Valid targets: ${Object.keys(CONVERTERS).join(", ")}, all`);
      process.exit(1);
    }

    const pluginDir = resolve(".");
    console.log(`Syncing plugin from: ${pluginDir}`);

    const plugin = readPlugin(pluginDir);
    console.log(`Found: ${plugin.name} v${plugin.version}`);

    const targets = target === "all" ? detectInstalledTools() : [target as TargetPlatform];

    if (targets.length === 0) {
      console.log("No supported AI coding tools detected. Specify a target with --target.");
      process.exit(0);
    }

    for (const t of targets) {
      const converter = CONVERTERS[t];
      console.log(`\nConverting for ${converter.label}...`);

      if (t === "windsurf") {
        (converter as WindsurfConverter).setScope(args.scope as "global" | "workspace");
      }
      converter.convert(plugin, pluginDir);
    }

    console.log("\nDone! Plugin synced successfully.");
  },
});

const lint = defineCommand({
  meta: { name: "lint", description: "Lint plugin skills/personas for dangling-reference anti-patterns" },
  args: {
    plugin: { type: "positional", description: "Plugin path (defaults to current directory)", required: false },
  },
  run({ args }) {
    const pluginDir = resolve(args.plugin ?? ".");
    const report = lintPlugin(pluginDir);
    if (report.ok) {
      console.log(`Lint passed: no violations in ${pluginDir}`);
      return;
    }
    console.error(`Lint found ${report.violations.length} violation(s):`);
    for (const v of report.violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  },
});

const main = defineCommand({
  meta: {
    name: "sf-compound-plugin",
    version: "1.0.0",
    description: "Multi-tool installer for SF Compound Engineering Plugin",
  },
  subCommands: { install, sync, lint },
});

runMain(main);
