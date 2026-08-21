import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { TargetPlatform } from "../parser/types.js";

/**
 * Per-platform detection. Each detector takes the directory being installed
 * into, so `--to all --output <dir>` reflects that project's tooling rather
 * than whatever happens to sit in the current working directory.
 */
const DETECTORS: Record<TargetPlatform, (dir: string) => boolean> = {
  copilot: (d) => existsSync(join(d, ".github")) || existsSync(join(homedir(), ".config", "github-copilot")),
  windsurf: (d) => existsSync(join(homedir(), ".codeium", "windsurf")) || existsSync(join(d, ".windsurf")),
  gemini: (d) => existsSync(join(d, ".gemini")) || existsSync(join(homedir(), ".gemini")),
  kiro: (d) => existsSync(join(d, ".kiro")) || existsSync(join(homedir(), ".kiro")),
  opencode: () => existsSync(join(homedir(), ".config", "opencode")),
  codex: (d) => existsSync(join(d, ".codex")) || existsSync(join(homedir(), ".codex")),
  cursor: (d) => existsSync(join(d, ".cursor")) || existsSync(join(homedir(), ".cursor")),
  droid: () => existsSync(join(homedir(), ".factory")),
  pi: () => existsSync(join(homedir(), ".pi")),
  openclaw: () => existsSync(join(homedir(), ".openclaw")),
  qwen: () => existsSync(join(homedir(), ".qwen")),
};

export function detectInstalledTools(dir = "."): TargetPlatform[] {
  return (Object.entries(DETECTORS) as [TargetPlatform, (dir: string) => boolean][])
    .filter(([_, detect]) => detect(dir))
    .map(([platform]) => platform);
}

export function isValidTarget(target: string): target is TargetPlatform | "all" {
  return target === "all" || target in DETECTORS;
}
