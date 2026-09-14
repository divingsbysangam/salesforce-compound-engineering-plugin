import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const OBSERVER = join(REPO_ROOT, "scripts", "sfce-bash-observer");

/**
 * U6 — Bash bypass observer.
 *
 * The gate deliberately does not deny Bash, because `sf project retrieve start`
 * legitimately writes hundreds of force-app files. This handler measures the
 * hole that leaves instead of closing it, and it must never deny anything.
 */

let state: string;

beforeEach(() => {
  state = join(tmpdir(), `sfce-bashobs-${randomUUID()}`);
});
afterEach(() => {
  try {
    chmodSync(state, 0o700);
  } catch {
    /* may not exist */
  }
  rmSync(state, { recursive: true, force: true });
});

interface Out {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(
  command: string,
  env: Record<string, string> = {},
  over: Record<string, unknown> = {},
): Promise<Out> {
  const payload = {
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    session_id: "sess-1",
    cwd: "/repo",
    tool_input: { command },
    ...over,
  };
  const proc = Bun.spawn([OBSERVER, "PostToolUse"], {
    stdin: new TextEncoder().encode(JSON.stringify(payload)),
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: state,
      SFCE_STATE_HOME: state,
      SFCE_GATE_ENABLED: "1",
      SFCE_SKILL_LOG_ENABLED: "1",
      ...env,
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, stdout, stderr };
}

const auditRows = (): any[] => {
  const f = join(state, "gate", "audit.jsonl");
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf-8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
};
const bypasses = () => auditRows().filter((r) => r.event === "bash_bypass");

const grantPath = (sid = "sess-1") => join(state, "gate", "grants", sid);
function writeGrant(secondsFromNow: number, sid = "sess-1") {
  mkdirSync(join(state, "gate", "grants"), { recursive: true });
  writeFileSync(
    grantPath(sid),
    `v=1\nexpires=${Math.floor(Date.now() / 1000) + secondsFromNow}\nskill=sf-work\n`,
  );
}
const expiryOf = (sid = "sess-1"): number =>
  Number(/expires=(\d+)/.exec(readFileSync(grantPath(sid), "utf-8"))?.[1]);

// Fixture command strings. Kept as data here, never assembled on a caller's
// command line — several are exclusion cases that exist precisely because they
// look like real SF CLI invocations.
const CMD = {
  heredoc: 'cat <<EOF > force-app/main/default/classes/Foo.cls\nclass Foo {}\nEOF',
  inplaceSed: "sed -i .bak s/a/b/ force-app/main/default/triggers/T.trigger",
  redirect: "echo x > force-app/main/default/lwc/w/w.js",
  cp: "cp /tmp/A.cls force-app/main/default/classes/A.cls",
  mv: "mv /tmp/B.cls force-app/main/default/classes/B.cls",
  tee: "echo x | tee force-app/main/default/classes/T.cls",
  gitApply: "git apply /tmp/change.patch",
  gitRestore: "git checkout -- force-app/main/default/classes/R.cls",
  interpreter:
    'python3 -c "open(\'force-app/main/default/classes/B.cls\',\'w\').write(\'x\')"',
  retrieve: "sf project retrieve start --manifest package.xml",
  generate: "sf project generate --name myapp",
  deploy: "sf project deploy start --source-dir force-app",
  gitClone: "git clone https://example.com/r.git force-app",
  gitStatus: "git status",
  ls: "ls -la force-app",
  regexMeta: 'echo "a.*[b]|c(d)+^$" > force-app/main/default/classes/C.cls',
};

// ===========================================================================
// 1. It never denies. The single most important property.
// ===========================================================================
describe("the handler never denies, under any input", () => {
  test("no input of any shape produces a decision on stdout", async () => {
    const inputs = [
      ...Object.values(CMD),
      "",
      "rm -rf /",
      '{"not":"a command"}',
      "a".repeat(9000),
    ];
    for (const c of inputs) {
      const out = await run(c);
      expect(out.code).toBe(0);
      expect(out.stdout.trim(), `stdout must be empty for: ${c.slice(0, 40)}`).toBe("");
    }
  });

  test("malformed payloads still exit 0 and emit nothing", async () => {
    for (const bad of ["", "not json", "{", '{"a":', "[]", "null"]) {
      const proc = Bun.spawn([OBSERVER, "PostToolUse"], {
        stdin: new TextEncoder().encode(bad),
        stdout: "pipe",
        stderr: "pipe",
        env: {
          PATH: process.env.PATH ?? "",
          HOME: state,
          SFCE_STATE_HOME: state,
          SFCE_GATE_ENABLED: "1",
        },
      });
      const stdout = await new Response(proc.stdout).text();
      expect(await proc.exited).toBe(0);
      expect(stdout.trim()).toBe("");
    }
  });
});

// ===========================================================================
// 2. The exclusion list — which matters more than the match list.
// ===========================================================================
describe("exclusions record nothing", () => {
  // A bypass count inflated by every retrieve is worthless: if the number
  // cannot be trusted, it cannot justify switching enforcement on, which is
  // the entire purpose of measuring.
  for (const [label, key] of [
    ["sf project retrieve", "retrieve"],
    ["sf project generate", "generate"],
    ["sf project deploy", "deploy"],
    ["git clone into force-app", "gitClone"],
  ] as Array<[string, keyof typeof CMD]>) {
    test(`${label}: allowed, no bypass event`, async () => {
      const out = await run(CMD[key]);
      expect(out.code).toBe(0);
      expect(bypasses().length).toBe(0);
    });
  }

  test("git checkout -b is excluded even though it would otherwise match", async () => {
    // The exclusion test with teeth. `git checkout -b <branch> <path>` reaches
    // the classifier AND matches the git-restore pattern, so only the
    // exclusion list stops it being counted as a bypass. The SF CLI cases
    // above never reach the classifier at all (no write token), so they pass
    // whether or not the exclusion list exists — they were proving nothing.
    const out = await run("git checkout -b feature force-app/main/default/classes/A.cls");
    expect(out.code).toBe(0);
    expect(bypasses().length).toBe(0);
  });

  test("git checkout -- on a metadata path IS counted", async () => {
    // The control for the case above: same verb, no -b, and it must count.
    await run(CMD.gitRestore);
    expect(bypasses().map((r) => r.class)).toEqual(["git-restore"]);
  });

  test("ordinary shell calls record nothing", async () => {
    await run(CMD.gitStatus);
    await run(CMD.ls);
    expect(bypasses().length).toBe(0);
  });
});

// ===========================================================================
// 3. The match list, one pattern class each.
// ===========================================================================
describe("bypass classes", () => {
  const cases: Array<[keyof typeof CMD, string]> = [
    ["heredoc", "heredoc"],
    ["inplaceSed", "inplace-sed"],
    ["redirect", "redirect"],
    ["cp", "cp"],
    ["mv", "mv"],
    ["tee", "tee"],
    ["gitApply", "git-apply"],
    ["gitRestore", "git-restore"],
    ["interpreter", "interpreter-write"],
  ];

  for (const [key, expected] of cases) {
    test(`${key} is recorded as class "${expected}"`, async () => {
      const out = await run(CMD[key]);
      expect(out.code).toBe(0);
      const rows = bypasses();
      expect(rows.length).toBe(1);
      expect(rows[0].class).toBe(expected);
    });
  }

  test("superset: an opaque-target form is not lost at the pre-filter", async () => {
    // The pre-filter must be a strict SUPERSET of the authoritative predicate.
    // `git apply somefile.patch` names no metadata path of its own, so an
    // "and a metadata token" pre-filter drops it before the parser ever sees
    // it — a false negative, and therefore a silently unobserved bypass.
    // This is how that regression was found, so it gets its own assertion.
    const out = await run("git apply /tmp/change.patch");
    expect(out.code).toBe(0);
    const rows = bypasses();
    expect(rows.length, "git apply must reach the classifier").toBe(1);
    expect(rows[0].class).toBe("git-apply");
  });

  test("regex metacharacters do not break matching or output", async () => {
    const out = await run(CMD.regexMeta);
    expect(out.code).toBe(0);
    expect(out.stdout.trim()).toBe("");
    expect(bypasses().length).toBe(1);
  });
});

// ===========================================================================
// 4. The command string never reaches a sink.
// ===========================================================================
describe("only a pattern class is recorded", () => {
  test("no substring of the command appears anywhere in state", async () => {
    await run(CMD.heredoc);
    await run(CMD.interpreter);

    const walk = (dir: string): string[] =>
      !existsSync(dir)
        ? []
        : readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
            e.isDirectory()
              ? walk(join(dir, e.name))
              : [readFileSync(join(dir, e.name), "utf-8")],
          );
    const everything = walk(state).join("\n");

    expect(everything.length).toBeGreaterThan(0);
    for (const fragment of ["Foo.cls", "class Foo", "force-app", "python3", "EOF", "open("]) {
      expect(everything, `command fragment leaked: ${fragment}`).not.toContain(fragment);
    }
    expect(everything).toContain("heredoc"); // the class, which is all we keep
  });

  test("every recorded row stays under the 1024-byte cap", async () => {
    await run(CMD.heredoc);
    for (const row of readFileSync(join(state, "gate", "audit.jsonl"), "utf-8")
      .split("\n")
      .filter((l) => l.trim())) {
      expect(Buffer.byteLength(row, "utf-8") + 1).toBeLessThanOrEqual(1024);
    }
  });
});

// ===========================================================================
// 5. Flag routing.
// ===========================================================================
describe("flag routing", () => {
  test("gate on, log off: the bypass reaches the audit sink, not the log", async () => {
    await run(CMD.heredoc, { SFCE_SKILL_LOG_ENABLED: "" });
    expect(bypasses().length).toBe(1);
    expect(existsSync(join(state, "telemetry"))).toBe(false);
  });

  test("log on, gate off: recorded to telemetry, no gate audit", async () => {
    await run(CMD.heredoc, { SFCE_GATE_ENABLED: "" });
    expect(existsSync(join(state, "gate"))).toBe(false);
    const dir = join(state, "telemetry");
    expect(existsSync(dir)).toBe(true);
    expect(readdirSync(dir).some((f) => f.startsWith("bypass-"))).toBe(true);
  });

  test("both flags unset: nothing written, and stdin is never read", async () => {
    const proc = Bun.spawn([OBSERVER, "PostToolUse"], {
      stdin: "pipe", // never written, never closed
      stdout: "pipe",
      stderr: "pipe",
      env: { PATH: process.env.PATH ?? "", HOME: state, SFCE_STATE_HOME: state },
    });
    const exited = await Promise.race([
      proc.exited,
      new Promise<"timeout">((r) => setTimeout(() => r("timeout"), 5000)),
    ]);
    if (exited === "timeout") proc.kill();
    expect(exited).toBe(0);
    expect(existsSync(state)).toBe(false);
  });
});

// ===========================================================================
// 6. The parser is not spawned on the common path.
// ===========================================================================
describe("tier discipline", () => {
  test("git status does not spawn the parser", async () => {
    // Proven rather than asserted: a fake python3 earlier on PATH writes a
    // marker if it is ever executed.
    const binDir = join(state, "fakebin");
    mkdirSync(binDir, { recursive: true });
    const marker = join(state, "parser-was-spawned");
    for (const name of ["python3", "python"]) {
      writeFileSync(join(binDir, name), `#!/bin/sh\ntouch "${marker}"\nexit 0\n`);
      chmodSync(join(binDir, name), 0o755);
    }

    await run(CMD.gitStatus, { PATH: `${binDir}:${process.env.PATH ?? ""}` });
    expect(existsSync(marker), "git status must exit at the substring tier").toBe(false);

    // Control: a payload that DOES need classification reaches the parser.
    await run(CMD.heredoc, { PATH: `${binDir}:${process.env.PATH ?? ""}` });
    expect(existsSync(marker)).toBe(true);
  });
});

// ===========================================================================
// 7. The idle timer — this handler is what makes it work (KTD5).
// ===========================================================================
describe("grant refresh", () => {
  test("a non-metadata shell call extends a live grant's expiry", async () => {
    writeGrant(60);
    const before = expiryOf();
    await run(CMD.gitStatus);
    expect(expiryOf()).toBeGreaterThan(before);
  });

  test("refresh happens for matched commands too", async () => {
    writeGrant(60);
    const before = expiryOf();
    await run(CMD.heredoc);
    expect(expiryOf()).toBeGreaterThan(before);
  });

  test("it refreshes but NEVER mints: no grant stays no grant", async () => {
    await run(CMD.gitStatus);
    expect(existsSync(grantPath())).toBe(false);
  });

  test("no mint even when the grants directory already exists", async () => {
    // The version of this test that actually bites. With an empty state tree,
    // a missing-guard regression still cannot mint -- the refresh path never
    // mkdirs, so the write fails for want of a directory and the test passes
    // for the wrong reason. Seeding another session's grant creates the
    // directory, so only the guard itself stands between us and a minted
    // grant for a session that never entered a skill.
    writeGrant(3600, "some-other-session");
    expect(existsSync(join(state, "gate", "grants"))).toBe(true);

    await run(CMD.gitStatus); // session_id is sess-1, which holds no grant
    expect(existsSync(grantPath("sess-1"))).toBe(false);
  });

  test("an EXPIRED grant is never revived", async () => {
    // Reviving here would let shell activity alone resurrect authority the
    // session never earned -- exactly what the gate exists to prevent.
    writeGrant(-10);
    const before = expiryOf();
    await run(CMD.gitStatus);
    expect(expiryOf()).toBe(before);
    expect(expiryOf()).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  test("a grant survives an idle gap filled only with non-skill activity", async () => {
    // The failure this prevents: skill entry fires once per run, so refreshing
    // only there expires the grant during the research-and-test stretch that
    // precedes the first real edit -- denying the run exactly as it becomes
    // productive.
    writeGrant(30, "sess-1");
    for (let i = 0; i < 5; i++) {
      await run(CMD.gitStatus, { SFCE_GATE_TTL_SECONDS: "120" });
    }
    expect(expiryOf()).toBeGreaterThan(Math.floor(Date.now() / 1000) + 60);
  });

  test("a refresh never touches another session's grant", async () => {
    writeGrant(60, "sess-1");
    writeGrant(60, "sess-other");
    const otherBefore = expiryOf("sess-other");
    await run(CMD.gitStatus, { SFCE_GATE_TTL_SECONDS: "9000" });
    expect(expiryOf("sess-1")).toBeGreaterThan(otherBefore);
    expect(expiryOf("sess-other")).toBe(otherBefore);
  });

  test("the refreshed grant keeps its owning skill and stays 0600", async () => {
    const { statSync } = require("fs") as typeof import("fs");
    writeGrant(60);
    await run(CMD.gitStatus);
    const body = readFileSync(grantPath(), "utf-8");
    expect(body).toContain("skill=sf-work");
    expect(statSync(grantPath()).mode & 0o777).toBe(0o600);
  });
});
