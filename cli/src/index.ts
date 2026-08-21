#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { isAbsolute, relative, resolve } from "path";
import { readPlugin } from "./parser/plugin.js";
import { lint as lintPlugin } from "./lint/index.js";
import { detectInstalledTools, isValidTarget } from "./utils/detect.js";
import { resolvePluginSource } from "./utils/source.js";
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
import { actionCommand, cardCommand, feedCommand, learningCommand, workCommand } from "./tend/cli.js";

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

/**
 * Convert a plugin into one or more target tools.
 *
 * `pluginDir` is where the plugin is read from; `outputDir` is where the
 * converted files land. They are deliberately separate — an install writes
 * into the user's project, not back into the plugin it came from.
 */
function runConvert(opts: {
  pluginDir: string;
  outputDir: string;
  target: string;
  scope: string;
}): void {
  const plugin = readPlugin(opts.pluginDir);
  console.log(`Found: ${plugin.name} v${plugin.version}`);
  console.log(`  ${plugin.commands.length} commands, ${plugin.agents.length} agents, ${plugin.skills.length} skills`);
  console.log(`  ${Object.keys(plugin.mcpServers).length} MCP servers`);
  console.log(`Requested install directory: ${opts.outputDir}\n`);

  const targets =
    opts.target === "all"
      ? detectInstalledTools(opts.outputDir)
      : [opts.target as TargetPlatform];

  if (targets.length === 0) {
    console.log(
      `No supported AI coding tools detected in ${opts.outputDir}. Specify one with --to.`,
    );
    process.exit(0);
  }

  for (const t of targets) {
    const converter = CONVERTERS[t];
    console.log(`\nConverting for ${converter.label}...`);

    // Scope must be set before installRoot is read — it changes the answer.
    if (t === "windsurf") {
      (converter as WindsurfConverter).setScope(opts.scope as "global" | "workspace");
    }

    // Several targets only load from a user-global directory and cannot honour
    // --output. Say where the files actually go rather than letting the
    // requested directory stand as an unearned promise.
    const root = converter.installRoot(opts.outputDir, plugin);
    if (!isInside(root, opts.outputDir)) {
      console.log(
        `  Note: ${converter.label} installs into ${root}, outside the requested ` +
          `directory${t === "windsurf" ? " — pass --scope workspace to keep it in the project" : ""}.`,
      );
    }

    converter.convert(plugin, opts.outputDir);
  }
}

/** True when `child` is `parent` or sits beneath it. */
function isInside(child: string, parent: string): boolean {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

/** Flags shared by `install` and `sync`, so the two stay in step. */
const convertArgs = {
  to: { type: "string", description: "Target: copilot, windsurf, gemini, kiro, opencode, codex, cursor, droid, pi, openclaw, qwen, or all" },
  output: { type: "string", description: "Directory to install into (default: current directory)" },
  scope: { type: "string", description: "Scope: global or workspace (for Windsurf)", default: "global" },
  ref: { type: "string", description: "Branch or tag to fetch when downloading a plugin by name" },
  offline: { type: "boolean", description: "Never fetch — use a cached plugin copy or fail", default: false },
} as const;

const install = defineCommand({
  meta: { name: "install", description: "Install plugin to target AI coding tool" },
  args: {
    plugin: { type: "positional", description: "Plugin name or path", required: true },
    ...convertArgs,
    to: { ...convertArgs.to, required: true },
  },
  run({ args }) {
    const target = args.to;
    if (!isValidTarget(target)) {
      console.error(`Unknown target: ${target}`);
      console.error(`Valid targets: ${Object.keys(CONVERTERS).join(", ")}, all`);
      process.exit(1);
    }

    let source;
    try {
      source = resolvePluginSource(args.plugin, {
        offline: args.offline,
        ref: args.ref,
      });
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }

    const label =
      source.origin === "fetch"
        ? `Downloaded plugin from: ${source.remote}`
        : source.origin === "cache"
          ? `Using cached plugin from: ${source.remote}`
          : `Reading plugin from: ${source.dir}`;
    console.log(label);
    if (source.origin === "fetch" || source.origin === "cache") {
      console.log(`  cached at: ${source.dir}`);
    }

    runConvert({
      pluginDir: source.dir,
      outputDir: resolve(args.output ?? "."),
      target,
      scope: args.scope,
    });

    console.log("\nDone! Plugin installed successfully.");
  },
});

const sync = defineCommand({
  meta: { name: "sync", description: "Sync current directory plugin to target AI coding tools" },
  args: {
    target: { type: "string", description: "Target platform or 'all'", default: "all" },
    output: convertArgs.output,
    scope: convertArgs.scope,
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

    runConvert({
      pluginDir,
      outputDir: resolve(args.output ?? "."),
      target,
      scope: args.scope,
    });

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
    // Kept in step with package.json by tests/version.test.ts.
    version: "1.0.1",
    description: "Multi-tool installer for SF Compound Engineering Plugin",
  },
  subCommands: {
    install,
    sync,
    lint,
    feed: feedCommand,
    card: cardCommand,
    work: workCommand,
    action: actionCommand,
    learning: learningCommand,
  },
});

runMain(main);
