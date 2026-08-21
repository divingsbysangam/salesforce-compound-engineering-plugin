import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";

/**
 * Bare plugin names this CLI knows how to fetch, and the repository each one
 * lives in. A bare name only reaches the network when it appears here — an
 * unknown name fails loudly rather than guessing at a URL.
 */
export const KNOWN_REMOTES: Record<string, string> = {
  "sf-compound-engineering":
    "https://github.com/divingsbysangam/salesforce-compound-engineering-plugin",
};

/** A directory is a plugin source only if it carries the canonical manifest. */
export function isPluginDir(dir: string): boolean {
  return existsSync(join(dir, ".claude-plugin", "plugin.json"));
}

/** Name declared by a plugin directory's manifest, or undefined if unreadable. */
export function pluginNameAt(dir: string): string | undefined {
  try {
    const manifest = JSON.parse(
      readFileSync(join(dir, ".claude-plugin", "plugin.json"), "utf-8"),
    ) as { name?: string };
    return manifest.name;
  } catch {
    return undefined;
  }
}

/** Where fetched plugin sources are kept between runs. */
export function cacheRoot(): string {
  const xdg = process.env.XDG_CACHE_HOME;
  return xdg ? join(xdg, "sfce", "plugins") : join(homedir(), ".cache", "sfce", "plugins");
}

export interface ResolveOptions {
  /** Override the fetch cache location (tests, isolated worktrees). */
  cacheDir?: string;
  /** Never touch the network — use an existing cache entry or fail. */
  offline?: boolean;
  /** Branch or tag to fetch. Defaults to the repository's default branch. */
  ref?: string;
}

/** How a plugin source was located, for honest logging. */
export type SourceOrigin = "path" | "cwd" | "cache" | "fetch";

export interface ResolvedSource {
  dir: string;
  origin: SourceOrigin;
  /** Remote the source came from, when it was fetched. */
  remote?: string;
}

/**
 * Locate the plugin to convert.
 *
 * Resolution order, first match wins:
 *   1. `plugin` names a directory that holds a plugin manifest.
 *   2. `plugin` is a bare name and the current directory *is* that plugin
 *      (the in-repo development and sync case).
 *   3. `plugin` is a bare name in KNOWN_REMOTES — fetch it into the cache.
 *
 * Note that resolution never falls back to "whatever is in the current
 * directory": step 2 requires the manifest name to match what was asked for,
 * so running `install sf-compound-engineering` from an unrelated project
 * fetches the real plugin instead of silently converting that project.
 */
export function resolvePluginSource(plugin: string, opts: ResolveOptions = {}): ResolvedSource {
  const asPath = resolve(plugin);
  if (isPluginDir(asPath)) return { dir: asPath, origin: "path" };

  const cwd = resolve(".");
  if (isPluginDir(cwd) && pluginNameAt(cwd) === plugin) {
    return { dir: cwd, origin: "cwd" };
  }

  const remote = KNOWN_REMOTES[plugin];
  if (!remote) {
    throw new Error(
      `Cannot resolve plugin "${plugin}".\n` +
        `  - No plugin manifest at ${asPath}\n` +
        `  - Current directory is not the "${plugin}" plugin\n` +
        `  - "${plugin}" is not a known downloadable plugin ` +
        `(known: ${Object.keys(KNOWN_REMOTES).join(", ")})\n` +
        `Pass a path to a plugin checkout instead.`,
    );
  }

  return fetchPlugin(plugin, remote, opts);
}

/**
 * Clone (or refresh) a known plugin into the local cache.
 *
 * A shallow clone is enough — converters only read the working tree, never
 * history. On refresh failure the cached copy is reused rather than deleted,
 * so a network blip degrades to a stale install rather than no install.
 */
export function fetchPlugin(
  name: string,
  remote: string,
  opts: ResolveOptions = {},
): ResolvedSource {
  const root = opts.cacheDir ?? cacheRoot();
  const dir = join(root, name);

  if (isPluginDir(dir)) {
    if (!opts.offline) {
      try {
        git(["-C", dir, "fetch", "--depth", "1", "origin", opts.ref ?? "HEAD"]);
        git(["-C", dir, "reset", "--hard", "FETCH_HEAD"]);
        return { dir, origin: "fetch", remote };
      } catch {
        console.warn(`  Warning: could not refresh cached plugin, using existing copy at ${dir}`);
      }
    }
    return { dir, origin: "cache", remote };
  }

  if (opts.offline) {
    throw new Error(`No cached copy of "${name}" at ${dir} and --offline was set.`);
  }

  mkdirSync(dirname(dir), { recursive: true });
  const args = ["clone", "--depth", "1"];
  if (opts.ref) args.push("--branch", opts.ref);
  args.push(remote, dir);
  git(args);

  if (!isPluginDir(dir)) {
    throw new Error(`Fetched ${remote} but found no plugin manifest at ${dir}`);
  }
  return { dir, origin: "fetch", remote };
}

/** Run git, surfacing its stderr on failure instead of a bare exit code. */
function git(args: string[]): void {
  try {
    execFileSync("git", args, { stdio: ["ignore", "ignore", "pipe"] });
  } catch (err) {
    const stderr = (err as { stderr?: Buffer }).stderr?.toString().trim();
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") {
      throw new Error("git is required to download a plugin by name, but was not found on PATH.");
    }
    throw new Error(`git ${args[0]} failed${stderr ? `: ${stderr}` : ""}`);
  }
}
