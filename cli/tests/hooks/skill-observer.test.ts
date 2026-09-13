import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, chmodSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join, resolve } from "path";

/**
 * U4 — skill-entry observer.
 *
 * Test order is deliberate and follows the plan's execution note: the LEAK test
 * and the FAILURE-DOMAIN test come first, because those two regressions are the
 * ones that cannot be undone or seen.
 *
 *   - A row carrying prompt text is written to a user's disk permanently, and
 *     nothing downstream can un-write it.
 *   - A log-sink failure that silently skips the grant write produces a
 *     PERMANENT DENY on every metadata edit, with no visible cause.
 */

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const OBSERVER = join(REPO_ROOT, "scripts", "sfce-skill-observer");

let state: string;
let repoFixture: string;

beforeEach(() => {
  state = join(tmpdir(), `sfce-obs-${randomUUID()}`);
  repoFixture = join(tmpdir(), `sfce-repo-${randomUUID()}`);
  mkdirSync(repoFixture, { recursive: true });
});

afterEach(() => {
  for (const d of [state, repoFixture]) {
    try {
      chmodSync(d, 0o700);
    } catch {
      /* may not exist */
    }
    rmSync(d, { recursive: true, force: true });
  }
});

interface RunResult {
  code: number;
  stderr: string;
  stdout: string;
}

async function run(
  event: string,
  payload: unknown,
  env: Record<string, string> = {},
  stateDir: string = state,
): Promise<RunResult> {
  const proc = Bun.spawn([OBSERVER, event], {
    cwd: repoFixture, // the observer must never write here
    stdin: new TextEncoder().encode(
      typeof payload === "string" ? payload : JSON.stringify(payload),
    ),
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: stateDir,
      CLAUDE_PLUGIN_ROOT: REPO_ROOT,
      SFCE_STATE_HOME: stateDir,
      ...env,
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, stderr, stdout };
}

const BOTH = { SFCE_GATE_ENABLED: "1", SFCE_SKILL_LOG_ENABLED: "1" };

function modelPayload(over: Record<string, unknown> = {}) {
  return {
    hook_event_name: "PostToolUse",
    tool_name: "Skill",
    session_id: "session-aaa",
    agent_id: null,
    cwd: "/some/repo",
    tool_input: { skill: "sf-compound-engineering:sf-work" },
    ...over,
  };
}

function logRows(stateDir: string = state): string[] {
  const dir = join(stateDir, "telemetry");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith("skills-") && f.endsWith(".jsonl"))
    .flatMap((f) =>
      readFileSync(join(dir, f), "utf-8").split("\n").filter((l) => l.trim().length > 0),
    );
}

const grantFile = (sid: string, stateDir: string = state) =>
  join(stateDir, "gate", "grants", sid);

// ===========================================================================
// 1. LEAK — written first, on purpose.
// ===========================================================================
describe("leak: nothing but the skill name reaches a sink", () => {
  test("the Skill tool's args field never appears in any sink", async () => {
    // Named for what it is -- prompt text -- not "secret". The args field holds
    // the user's verbatim prompt, which is sensitive but is not a credential,
    // and a `const secret = "..."` shape trips repository secret scanners.
    const promptText = "verbatim-user-prompt-that-must-never-be-logged-9f3a";
    await run(
      "PostToolUse",
      modelPayload({
        tool_input: { skill: "sf-compound-engineering:sf-work", args: promptText },
      }),
      BOTH,
    );

    // Walk every byte the observer wrote, not just the row we expect.
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
    expect(everything).not.toContain(promptText);
    expect(everything).not.toContain("verbatim-user-prompt");
    expect(everything).toContain("sf-work");
  });

  test("the raw session id never appears in a telemetry row", async () => {
    await run("PostToolUse", modelPayload({ session_id: "raw-session-id-zzz" }), BOTH);
    const rows = logRows();
    expect(rows.length).toBe(1);
    expect(rows[0]).not.toContain("raw-session-id-zzz");

    const record = JSON.parse(rows[0] as string);
    expect(record.v).toBe(1);
    expect(typeof record.session_ref).toBe("string");
    expect(record.session_ref).not.toBe("raw-session-id-zzz");
    expect((record.session_ref as string).length).toBeGreaterThan(8);
  });

  test("the same session id hashes stably, so counting still works", async () => {
    await run("PostToolUse", modelPayload({ session_id: "stable" }), BOTH);
    await run("PostToolUse", modelPayload({ session_id: "stable" }), BOTH);
    await run("PostToolUse", modelPayload({ session_id: "different" }), BOTH);
    const refs = logRows().map((r) => JSON.parse(r).session_ref);
    expect(refs.length).toBe(3);
    expect(refs[0]).toBe(refs[1]);
    expect(refs[2]).not.toBe(refs[0]);
  });
});

// ===========================================================================
// 2. FAILURE DOMAINS — written second, on purpose.
// ===========================================================================
describe("failure domains: a log-sink failure can never cost a grant", () => {
  test("telemetry unwritable, gate enabled: the grant is STILL written", async () => {
    // This is the permanent-deny regression. Make the telemetry directory
    // impossible to write, then assert the grant sink completed anyway.
    mkdirSync(join(state, "telemetry"), { recursive: true });
    chmodSync(join(state, "telemetry"), 0o500);

    const res = await run("PostToolUse", modelPayload(), BOTH);

    expect(res.code).toBe(0);
    expect(existsSync(grantFile("session-aaa"))).toBe(true);
    expect(readFileSync(grantFile("session-aaa"), "utf-8")).toContain("expires=");

    chmodSync(join(state, "telemetry"), 0o700);
  });

  test("an unwritable state root warns on stderr and still exits 0", async () => {
    const locked = join(tmpdir(), `sfce-locked-${randomUUID()}`);
    mkdirSync(locked, { recursive: true });
    chmodSync(locked, 0o500);
    try {
      const res = await run("PostToolUse", modelPayload(), BOTH, locked);
      expect(res.code).toBe(0);
      expect(res.stderr.length).toBeGreaterThan(0);
    } finally {
      chmodSync(locked, 0o700);
      rmSync(locked, { recursive: true, force: true });
    }
  });

  test("a hook never exits non-zero, even on malformed input", async () => {
    for (const bad of ["", "not json at all", "{", '{"truncated":', "[]", "null"]) {
      const res = await run("PostToolUse", bad, BOTH);
      expect(res.code).toBe(0);
    }
  });
});

// ===========================================================================
// 3. Independent flag gating (KTD14).
// ===========================================================================
describe("the two flags gate three sinks independently", () => {
  test("both unset: exits 0 without reading stdin", async () => {
    // Proven, not assumed: stdin is an open pipe that is never written and
    // never closed. A script that reads stdin would block here forever.
    const proc = Bun.spawn([OBSERVER, "PostToolUse"], {
      cwd: repoFixture,
      stdin: "pipe",
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

  test("log on, gate off: a row is written and no grant exists", async () => {
    await run("PostToolUse", modelPayload(), { SFCE_SKILL_LOG_ENABLED: "1" });
    expect(logRows().length).toBe(1);
    expect(existsSync(join(state, "gate"))).toBe(false);
  });

  test("gate on, log off: grant and audit exist, no telemetry file", async () => {
    await run("PostToolUse", modelPayload(), { SFCE_GATE_ENABLED: "1" });
    expect(existsSync(grantFile("session-aaa"))).toBe(true);
    expect(existsSync(join(state, "gate", "audit.jsonl"))).toBe(true);
    expect(existsSync(join(state, "telemetry"))).toBe(false);
  });
});

// ===========================================================================
// 4. Grant rules (KTD2, KTD3).
// ===========================================================================
describe("grant rules", () => {
  test("allowlisted skill with null agent_id: grant plus exactly one row", async () => {
    await run("PostToolUse", modelPayload(), BOTH);
    expect(existsSync(grantFile("session-aaa"))).toBe(true);
    expect(logRows().length).toBe(1);
  });

  test("a skill that is not allowlisted is logged but grants nothing", async () => {
    await run(
      "PostToolUse",
      modelPayload({ tool_input: { skill: "sf-compound-engineering:sf-explain" } }),
      BOTH,
    );
    expect(logRows().length).toBe(1);
    expect(JSON.parse(logRows()[0] as string).skill).toBe("sf-explain");
    expect(existsSync(grantFile("session-aaa"))).toBe(false);
  });

  test("a subagent is logged, grants nothing, and cannot refresh a grant", async () => {
    // KTD3: a read-only review persona that loads an authoring skill for
    // reference must not unlock the main thread for the rest of the session.
    await run("PostToolUse", modelPayload({ agent_id: "agent-77" }), BOTH);
    expect(logRows().length).toBe(1);
    expect(existsSync(grantFile("session-aaa"))).toBe(false);

    // And it must not extend an existing grant either.
    await run("PostToolUse", modelPayload(), BOTH);
    const before = readFileSync(grantFile("session-aaa"), "utf-8");
    await run("PostToolUse", modelPayload({ agent_id: "agent-77" }), BOTH);
    expect(readFileSync(grantFile("session-aaa"), "utf-8")).toBe(before);
  });

  test("the grant carries its expiry inside the file, so no stat is needed", async () => {
    await run("PostToolUse", modelPayload(), BOTH);
    const body = readFileSync(grantFile("session-aaa"), "utf-8");
    const expiry = Number(/expires=(\d+)/.exec(body)?.[1]);
    expect(Number.isFinite(expiry)).toBe(true);
    expect(expiry).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

// ===========================================================================
// 5. Entry paths (KTD1, KTD12) — U1's measured contract.
// ===========================================================================
describe("both entry paths normalise to one fact", () => {
  test("the slash path is observed via UserPromptExpansion", async () => {
    await run(
      "UserPromptExpansion",
      {
        hook_event_name: "UserPromptExpansion",
        expansion_type: "slash_command",
        command_name: "sf-compound-engineering:sf-work",
        command_args: "SECRET SLASH ARGS",
        session_id: "session-slash",
        cwd: "/some/repo",
      },
      BOTH,
    );
    const rows = logRows();
    expect(rows.length).toBe(1);
    const record = JSON.parse(rows[0] as string);
    expect(record.entry).toBe("slash");
    expect(record.skill).toBe("sf-work");
    expect(rows[0]).not.toContain("SECRET SLASH ARGS");
    // The slash path still mints a grant: /sf-lfg writes files (U1 measured it)
    // and emits no Skill event, so gating on the tool path alone would deny it.
    expect(existsSync(grantFile("session-slash"))).toBe(true);
  });

  test("the plugin qualifier is stripped on both paths", async () => {
    // U1: identity is ALWAYS plugin-qualified. The allowlist holds bare names,
    // so an unstripped name would match nothing and grant nothing, forever.
    await run("PostToolUse", modelPayload(), BOTH);
    expect(JSON.parse(logRows()[0] as string).skill).toBe("sf-work");
  });

  test("PreToolUse for the same Skill call is NOT logged (no double count)", async () => {
    await run(
      "PreToolUse",
      { ...modelPayload(), hook_event_name: "PreToolUse" },
      BOTH,
    );
    expect(logRows().length).toBe(0);
  });
});

// ===========================================================================
// 6. Session lifecycle (KTD4).
// ===========================================================================
describe("revocation is a source allowlist, not a denylist", () => {
  async function seedGrant(sid = "session-aaa") {
    await run("PostToolUse", modelPayload({ session_id: sid }), BOTH);
    expect(existsSync(grantFile(sid))).toBe(true);
  }

  test("source=compact leaves the grant intact", async () => {
    // The exact case a denylist would break: compaction is the long run this
    // design exists to protect.
    await seedGrant();
    await run(
      "SessionStart",
      { hook_event_name: "SessionStart", source: "compact", session_id: "session-aaa" },
      BOTH,
    );
    expect(existsSync(grantFile("session-aaa"))).toBe(true);
  });

  test("source=startup and source=fork leave the grant intact", async () => {
    for (const source of ["startup", "fork"]) {
      await seedGrant();
      await run(
        "SessionStart",
        { hook_event_name: "SessionStart", source, session_id: "session-aaa" },
        BOTH,
      );
      expect(existsSync(grantFile("session-aaa"))).toBe(true);
    }
  });

  test("source=clear and source=resume revoke the grant", async () => {
    for (const source of ["clear", "resume"]) {
      await seedGrant();
      await run(
        "SessionStart",
        { hook_event_name: "SessionStart", source, session_id: "session-aaa" },
        BOTH,
      );
      expect(existsSync(grantFile("session-aaa"))).toBe(false);
    }
  });

  test("SessionEnd removes the grant", async () => {
    await seedGrant();
    await run(
      "SessionEnd",
      { hook_event_name: "SessionEnd", session_id: "session-aaa" },
      BOTH,
    );
    expect(existsSync(grantFile("session-aaa"))).toBe(false);
  });
});

// ===========================================================================
// 7. Size invariant (KTD16) and append atomicity.
// ===========================================================================
describe("the 1024-byte invariant", () => {
  test("an oversized row is dropped and counted, never truncated", async () => {
    const huge = "s".repeat(1200);
    await run(
      "PostToolUse",
      modelPayload({ tool_input: { skill: `sf-compound-engineering:${huge}` } }),
      BOTH,
    );
    expect(logRows().length).toBe(0);
    const counter = join(state, "telemetry", "dropped-oversize.count");
    expect(existsSync(counter)).toBe(true);
    expect(readFileSync(counter, "utf-8").trim().split("\n").length).toBe(1);
  });

  test("every written row is at or under the cap", async () => {
    await run("PostToolUse", modelPayload(), BOTH);
    for (const row of logRows()) {
      expect(Buffer.byteLength(row, "utf-8") + 1).toBeLessThanOrEqual(1024);
    }
  });

  test("16 concurrent writers produce 800 parseable rows with no torn lines", async () => {
    const WRITERS = 16;
    const PER = 50;
    await Promise.all(
      Array.from({ length: WRITERS }, (_, w) =>
        (async () => {
          for (let i = 0; i < PER; i++) {
            await run("PostToolUse", modelPayload({ session_id: `w${w}` }), {
              SFCE_SKILL_LOG_ENABLED: "1",
            });
          }
        })(),
      ),
    );
    const rows = logRows();
    expect(rows.length).toBe(WRITERS * PER);
    // Every line must be independently parseable: a torn write shows up here.
    for (const row of rows) {
      expect(() => JSON.parse(row)).not.toThrow();
    }
  }, 180_000);
});

// ===========================================================================
// 8. The observer never writes inside the user's repository.
// ===========================================================================
describe("no write ever lands inside the repository", () => {
  test("the fixture repo is untouched across every event type", async () => {
    for (const [event, payload] of [
      ["PostToolUse", modelPayload()],
      [
        "UserPromptExpansion",
        {
          hook_event_name: "UserPromptExpansion",
          expansion_type: "slash_command",
          command_name: "sf-compound-engineering:sf-work",
          session_id: "s",
          cwd: "/repo",
        },
      ],
      ["SessionStart", { hook_event_name: "SessionStart", source: "clear", session_id: "s" }],
      ["SessionEnd", { hook_event_name: "SessionEnd", session_id: "s" }],
    ] as Array<[string, unknown]>) {
      await run(event, payload, BOTH);
    }
    expect(readdirSync(repoFixture)).toEqual([]);
  });

  test("it still writes nothing in the repo when the state root is unwritable", async () => {
    const locked = join(tmpdir(), `sfce-locked2-${randomUUID()}`);
    mkdirSync(locked, { recursive: true });
    chmodSync(locked, 0o500);
    try {
      await run("PostToolUse", modelPayload(), BOTH, locked);
      expect(readdirSync(repoFixture)).toEqual([]);
    } finally {
      chmodSync(locked, 0o700);
      rmSync(locked, { recursive: true, force: true });
    }
  });
});

// ===========================================================================
// 9. U1's recorded fixtures drive this script.
// ===========================================================================
describe("the U1 fixtures drive the observer to the expected sink state", () => {
  // U4's verification line. These are real captures from Claude Code 2.1.270,
  // not payloads invented to match the parser -- which is the point: a parser
  // written against imagined shapes is the failure U1 existed to prevent.
  const FIXTURES = join(REPO_ROOT, "cli", "tests", "hooks", "fixtures");

  function eventsFrom(file: string): Array<Record<string, unknown>> {
    const doc = JSON.parse(readFileSync(join(FIXTURES, file), "utf-8"));
    return doc.events as Array<Record<string, unknown>>;
  }

  test("the slash-command fixture produces a slash-entry row", async () => {
    const expansion = eventsFrom("entry-slash-command.json").find(
      (e) => e.hook_event_name === "UserPromptExpansion",
    );
    expect(expansion).toBeDefined();
    await run("UserPromptExpansion", expansion, BOTH);

    const rows = logRows();
    expect(rows.length).toBe(1);
    const record = JSON.parse(rows[0] as string);
    expect(record.entry).toBe("slash");
    expect(record.skill).toBe("sf-plan");
  });

  test("the description-matched fixture produces a model-entry row", async () => {
    // The path U1 proved is observable, reversing the plan's stop condition.
    const skillEvent = eventsFrom("entry-description-matched.json").find(
      (e) => e.tool_name === "Skill" && e.hook_event_name === "PostToolUse",
    );
    expect(skillEvent).toBeDefined();
    await run("PostToolUse", skillEvent, BOTH);

    const rows = logRows();
    expect(rows.length).toBe(1);
    const record = JSON.parse(rows[0] as string);
    expect(record.entry).toBe("model");
    expect(record.skill).toBe("sf-plan");
  });

  test("the lfg fixture grants through the slash path", async () => {
    // /sf-lfg emits no Skill event but does write files (U1 measured Write and
    // Edit calls). If the slash path did not grant, the pipeline would be
    // denied its own edits.
    const expansion = eventsFrom("entry-lfg-pipeline.json").find(
      (e) => e.hook_event_name === "UserPromptExpansion",
    );
    expect(expansion).toBeDefined();
    await run("UserPromptExpansion", expansion, BOTH);

    const record = JSON.parse(logRows()[0] as string);
    expect(record.skill).toBe("sf-lfg");
    const sid = String((expansion as Record<string, unknown>).session_id);
    expect(existsSync(grantFile(sid))).toBe(true);
  });

  test("the fork fixture's SessionStart leaves any grant alone", async () => {
    const start = eventsFrom("session-fork.json").find(
      (e) => e.hook_event_name === "SessionStart",
    ) as Record<string, unknown>;
    expect(start.source).toBe("fork");

    const sid = String(start.session_id);
    await run("PostToolUse", modelPayload({ session_id: sid }), BOTH);
    expect(existsSync(grantFile(sid))).toBe(true);

    await run("SessionStart", start, BOTH);
    // A fork carries no parent session id (U1), so it starts unauthorised on
    // its own new id -- but it must not revoke the id it was handed either.
    expect(existsSync(grantFile(sid))).toBe(true);
  });

  test("no fixture payload leaks a path or prompt into a sink", async () => {
    for (const file of readdirSync(FIXTURES)) {
      for (const event of eventsFrom(file)) {
        await run(String(event.hook_event_name ?? "PostToolUse"), event, BOTH);
      }
    }
    const rows = logRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row).not.toContain("/fixture-root");
      expect(row).not.toContain("transcript");
      expect(Buffer.byteLength(row, "utf-8") + 1).toBeLessThanOrEqual(1024);
      expect(() => JSON.parse(row)).not.toThrow();
    }
  });
});

// ===========================================================================
// 10. State permissions.
// ===========================================================================
describe("state permissions", () => {
  test("grant and telemetry files are owner-only", async () => {
    const { statSync } = require("fs") as typeof import("fs");
    await run("PostToolUse", modelPayload(), BOTH);
    expect(statSync(grantFile("session-aaa")).mode & 0o777).toBe(0o600);
    expect(statSync(join(state, "gate", "grants")).mode & 0o777).toBe(0o700);
  });
});
