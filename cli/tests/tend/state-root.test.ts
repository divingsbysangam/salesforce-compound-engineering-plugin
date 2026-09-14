import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { randomUUID } from "crypto";
import { mkdirSync, rmSync, statSync, writeFileSync } from "fs";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";
import { resolveStateDir, saveState, loadState } from "../../src/tend/state.js";

/**
 * U3 — subsystem-aware state root.
 *
 * The load-bearing property is a NEGATIVE one: no existing Tend path may move.
 * These tests pin resolveStateDir on all four branches so a later change that
 * relocates someone's feed state fails here rather than in their working copy.
 */

const ENV_KEYS = ["SFCE_STATE_HOME", "SFCE_TEND_HOME", "XDG_STATE_HOME"] as const;
let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = {};
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k] as string;
  }
});

describe("resolveStateDir — the four branches are pinned", () => {
  test("1. an explicit state directory is used bare, with no added segment", () => {
    expect(resolveStateDir({ stateDir: "/tmp/explicit-root" })).toBe("/tmp/explicit-root");
  });

  test("2. SFCE_STATE_HOME is used bare", () => {
    process.env.SFCE_STATE_HOME = "/tmp/state-home";
    expect(resolveStateDir()).toBe("/tmp/state-home");
  });

  test("3. XDG_STATE_HOME gets a tend segment — and NOT an sfce segment", () => {
    process.env.XDG_STATE_HOME = "/tmp/xdg";
    // The docs claimed $XDG_STATE_HOME/sfce/tend for a long time. They were
    // wrong; this pins the real shape so the claim cannot drift back.
    expect(resolveStateDir()).toBe(join("/tmp/xdg", "tend"));
    expect(resolveStateDir()).not.toContain(`${join("/tmp/xdg", "sfce")}`);
  });

  test("4. the default is ~/.sfce/tend", () => {
    expect(resolveStateDir()).toBe(join(homedir(), ".sfce", "tend"));
  });
});

describe("SFCE_TEND_HOME remains a working deprecated alias", () => {
  test("the old name still resolves when the new one is unset", () => {
    process.env.SFCE_TEND_HOME = "/tmp/legacy-tend-home";
    expect(resolveStateDir()).toBe("/tmp/legacy-tend-home");
  });

  test("the new name wins when both are set", () => {
    process.env.SFCE_TEND_HOME = "/tmp/legacy-tend-home";
    process.env.SFCE_STATE_HOME = "/tmp/new-state-home";
    expect(resolveStateDir()).toBe("/tmp/new-state-home");
  });

  test("an explicit stateDir still outranks both variables", () => {
    process.env.SFCE_TEND_HOME = "/tmp/legacy";
    process.env.SFCE_STATE_HOME = "/tmp/new";
    expect(resolveStateDir({ stateDir: "/tmp/explicit" })).toBe("/tmp/explicit");
  });
});

describe("the subsystem layout keeps Tend where it already is", () => {
  // Documented contract, asserted as path arithmetic. On a caller-named root
  // Tend stays bare and siblings nest beneath it; on a shared root every
  // subsystem takes its own segment.
  test("caller-named root: gate and telemetry nest under the unchanged Tend root", () => {
    const root = resolveStateDir({ stateDir: "/tmp/named-root" });
    expect(root).toBe("/tmp/named-root");
    expect(join(root, "gate")).toBe("/tmp/named-root/gate");
    expect(join(root, "telemetry")).toBe("/tmp/named-root/telemetry");
  });

  test("shared root: the three subsystems are siblings and Tend is unmoved", () => {
    process.env.XDG_STATE_HOME = "/tmp/xdg";
    const tend = resolveStateDir();
    expect(tend).toBe("/tmp/xdg/tend");
    expect(join("/tmp/xdg", "gate")).not.toBe(tend);
    expect(join("/tmp/xdg", "telemetry")).not.toBe(tend);
  });
});

describe("state directory and file permissions", () => {
  let dir: string;
  beforeEach(() => {
    dir = join(tmpdir(), `sfce-perm-${randomUUID()}`);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  test("a newly created state directory is 0700 and its state file 0600", () => {
    const options = { stateDir: dir, scope: "perm-test" };
    const state = loadState(options);
    const file = saveState(state, options);

    const scopeDir = join(dir, "perm-test");
    expect(statSync(scopeDir).mode & 0o777).toBe(0o700);
    expect(statSync(file).mode & 0o777).toBe(0o600);
  });

  test("permissions on a directory the user already created are left alone", () => {
    // Re-chmod-ing a path the user pointed us at is not ours to do.
    mkdirSync(join(dir, "preexisting"), { recursive: true, mode: 0o755 });
    const options = { stateDir: dir, scope: "preexisting" };
    saveState(loadState(options), options);
    expect(statSync(join(dir, "preexisting")).mode & 0o777).toBe(0o755);
  });
});

describe("the scope hash has one written contract for both languages", () => {
  test("the shell recipe reproduces the TypeScript digest byte for byte", () => {
    const cwd = resolve(process.cwd());
    const ts = createHash("sha256").update(cwd).digest("hex").slice(0, 12);

    // Exactly the recipe documented in state.ts and README.md.
    const sh = execFileSync(
      "/bin/sh",
      ["-c", `printf '%s' "$1" | shasum -a 256 | cut -c1-12`, "sh", cwd],
      { encoding: "utf-8" },
    ).trim();

    expect(sh).toBe(ts);
  });

  test("the echo variant does NOT match, which is why printf is specified", () => {
    const cwd = resolve(process.cwd());
    const ts = createHash("sha256").update(cwd).digest("hex").slice(0, 12);
    const wrong = execFileSync(
      "/bin/sh",
      ["-c", `echo "$1" | shasum -a 256 | cut -c1-12`, "sh", cwd],
      { encoding: "utf-8" },
    ).trim();
    // A trailing newline silently splits one repository across two scopes.
    expect(wrong).not.toBe(ts);
  });
});

describe("the documented path matches what the function returns", () => {
  test("README.md and CLAUDE.md do not claim an sfce segment under XDG_STATE_HOME", () => {
    const root = resolve(import.meta.dir, "../../..");
    for (const doc of ["README.md", "CLAUDE.md"]) {
      const text = require("fs").readFileSync(join(root, doc), "utf-8") as string;
      expect(
        text.includes("$XDG_STATE_HOME/sfce/tend"),
        `${doc} documents $XDG_STATE_HOME/sfce/tend, which resolveStateDir never returns`,
      ).toBe(false);
    }
  });
});
