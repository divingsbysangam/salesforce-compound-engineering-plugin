import { afterEach, describe, expect, test } from "bun:test";
import { execFileSync } from "child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import {
  cacheRoot,
  fetchPlugin,
  isPluginDir,
  pluginNameAt,
  resolvePluginSource,
} from "../../src/utils/source.js";

const created: string[] = [];

function tmp(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  created.push(dir);
  return dir;
}

/** Minimal on-disk plugin: a manifest is all the resolver looks for. */
function makePlugin(name: string): string {
  const dir = tmp("sfce-src-");
  mkdirSync(join(dir, ".claude-plugin"), { recursive: true });
  writeFileSync(
    join(dir, ".claude-plugin", "plugin.json"),
    JSON.stringify({ name, version: "0.0.0" }),
  );
  return dir;
}

/** A local git repo standing in for the GitHub remote, so tests stay offline. */
function makeGitRemote(name: string): string {
  const dir = makePlugin(name);
  const run = (...args: string[]) =>
    execFileSync("git", ["-C", dir, ...args], { stdio: "ignore" });
  run("init", "-q", "-b", "main");
  run("config", "user.email", "test@example.com");
  run("config", "user.name", "Test");
  run("add", "-A");
  run("commit", "-qm", "initial");
  return dir;
}

afterEach(() => {
  while (created.length) rmSync(created.pop()!, { recursive: true, force: true });
});

describe("isPluginDir / pluginNameAt", () => {
  test("recognizes a directory holding a plugin manifest", () => {
    const dir = makePlugin("demo-plugin");
    expect(isPluginDir(dir)).toBe(true);
    expect(pluginNameAt(dir)).toBe("demo-plugin");
  });

  test("rejects a directory without one", () => {
    const dir = tmp("sfce-empty-");
    expect(isPluginDir(dir)).toBe(false);
    expect(pluginNameAt(dir)).toBeUndefined();
  });
});

describe("cacheRoot", () => {
  test("honors XDG_CACHE_HOME", () => {
    const prev = process.env.XDG_CACHE_HOME;
    process.env.XDG_CACHE_HOME = "/xdg";
    try {
      expect(cacheRoot()).toBe(join("/xdg", "sfce", "plugins"));
    } finally {
      if (prev === undefined) delete process.env.XDG_CACHE_HOME;
      else process.env.XDG_CACHE_HOME = prev;
    }
  });
});

describe("resolvePluginSource", () => {
  test("resolves an explicit path to a plugin checkout", () => {
    const dir = makePlugin("demo-plugin");
    const source = resolvePluginSource(dir);
    expect(source.origin).toBe("path");
    expect(source.dir).toBe(resolve(dir));
  });

  test("resolves a bare name against the current directory when it matches", () => {
    const dir = makePlugin("demo-plugin");
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const source = resolvePluginSource("demo-plugin");
      expect(source.origin).toBe("cwd");
      // macOS resolves /var through a symlink once chdir'd into it.
      expect(source.dir).toBe(realpathSync(dir));
    } finally {
      process.chdir(prev);
    }
  });

  test("does not adopt an unrelated project sitting in the current directory", () => {
    const dir = makePlugin("some-other-plugin");
    const prev = process.cwd();
    process.chdir(dir);
    try {
      expect(() => resolvePluginSource("not-a-real-plugin")).toThrow(/not a known downloadable plugin/);
    } finally {
      process.chdir(prev);
    }
  });

  test("reports every avenue it tried for an unknown name", () => {
    expect(() => resolvePluginSource("nope")).toThrow(/Cannot resolve plugin "nope"/);
  });
});

describe("fetchPlugin", () => {
  test("clones a plugin into the cache", () => {
    const remote = makeGitRemote("demo-plugin");
    const cacheDir = tmp("sfce-cache-");

    const source = fetchPlugin("demo-plugin", remote, { cacheDir });
    expect(source.origin).toBe("fetch");
    expect(source.dir).toBe(join(cacheDir, "demo-plugin"));
    expect(isPluginDir(source.dir)).toBe(true);
    expect(pluginNameAt(source.dir)).toBe("demo-plugin");
  });

  test("reuses the cached copy without a network round trip when offline", () => {
    const remote = makeGitRemote("demo-plugin");
    const cacheDir = tmp("sfce-cache-");
    fetchPlugin("demo-plugin", remote, { cacheDir });

    const source = fetchPlugin("demo-plugin", "https://invalid.invalid/nope.git", {
      cacheDir,
      offline: true,
    });
    expect(source.origin).toBe("cache");
    expect(isPluginDir(source.dir)).toBe(true);
  });

  test("refuses to invent a cache entry when offline", () => {
    const cacheDir = tmp("sfce-cache-");
    expect(() => fetchPlugin("demo-plugin", "https://invalid.invalid/nope.git", { cacheDir, offline: true }))
      .toThrow(/--offline/);
  });

  test("falls back to the stale cached copy when a refresh fails", () => {
    const remote = makeGitRemote("demo-plugin");
    const cacheDir = tmp("sfce-cache-");
    fetchPlugin("demo-plugin", remote, { cacheDir });
    rmSync(remote, { recursive: true, force: true });

    const source = fetchPlugin("demo-plugin", remote, { cacheDir });
    expect(source.origin).toBe("cache");
    expect(isPluginDir(source.dir)).toBe(true);
  });

  test("surfaces a clear error when the remote does not exist", () => {
    const cacheDir = tmp("sfce-cache-");
    expect(() => fetchPlugin("demo-plugin", join(cacheDir, "missing-remote"), { cacheDir }))
      .toThrow(/git clone failed/);
  });
});
