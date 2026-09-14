import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const GATE = join(REPO_ROOT, "scripts", "sfce-metadata-gate");

const APEX = "/repo/force-app/main/default/classes/Foo.cls";
const FLOW = "/repo/force-app/main/default/flows/Lead_Assign.flow-meta.xml";

let state: string;

beforeEach(() => {
  state = join(tmpdir(), `sfce-gate-${randomUUID()}`);
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
  json: any;
}

async function gate(
  event: string,
  payload: unknown,
  env: Record<string, string> = {},
): Promise<Out> {
  const proc = Bun.spawn([GATE, event], {
    stdin: new TextEncoder().encode(
      typeof payload === "string" ? payload : JSON.stringify(payload),
    ),
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: state,
      SFCE_STATE_HOME: state,
      CLAUDE_PLUGIN_ROOT: REPO_ROOT,
      SFCE_GATE_ENABLED: "1",
      SFCE_GATE_ENFORCE: "1", // most tests exercise enforcement explicitly
      ...env,
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  let json: any = null;
  if (stdout.trim()) {
    try {
      json = JSON.parse(stdout);
    } catch {
      json = "UNPARSEABLE";
    }
  }
  return { code, stdout, stderr, json };
}

function edit(file_path: string, over: Record<string, unknown> = {}) {
  return {
    hook_event_name: "PreToolUse",
    tool_name: "Edit",
    session_id: "sess-1",
    agent_id: null,
    cwd: "/repo",
    tool_input: { file_path },
    ...over,
  };
}

function writeGrant(sid: string, secondsFromNow: number) {
  const dir = join(state, "gate", "grants");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, sid),
    `v=1\nexpires=${Math.floor(Date.now() / 1000) + secondsFromNow}\nskill=sf-work\n`,
  );
}

const auditRows = (): any[] => {
  const f = join(state, "gate", "audit.jsonl");
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
};

const decisionOf = (o: Out) => o.json?.hookSpecificOutput?.permissionDecision ?? null;
const reasonOf = (o: Out) => o.json?.hookSpecificOutput?.permissionDecisionReason ?? "";

// ===========================================================================
// 1. It denies. Written before the script existed.
// ===========================================================================
describe("the gate denies", () => {
  test("unauthorised Edit on an Apex class: denied, naming file, rule and skill", async () => {
    const out = await gate("PreToolUse", edit(APEX));
    expect(decisionOf(out)).toBe("deny");
    const reason = reasonOf(out);
    expect(reason).toContain("Foo.cls"); // the file
    // Assert the matched RULE, not merely the substring "force-app" -- the
    // displayed path contains that word too, so a looser assertion passes even
    // when the force-app predicate is disabled entirely. (Found by mutation.)
    expect(reason).toContain("(rule **/force-app/**)");
    expect(reason).toContain("/apex-generate"); // the owning skill
  });

  test("the matched rule reported is the most specific one, not a fallback", async () => {
    // A .cls inside force-app must report the force-app rule; a .cls outside it
    // must report the suffix rule. Collapsing the two hides which predicate
    // actually fired.
    const inside = await gate("PreToolUse", edit(APEX));
    expect(reasonOf(inside)).toContain("(rule **/force-app/**)");

    const outside = await gate("PreToolUse", edit("/elsewhere/classes/Bar.cls"));
    expect(decisionOf(outside)).toBe("deny");
    expect(reasonOf(outside)).toContain("(rule **/*.cls)");
  });

  test("a live grant allows the same edit and records a decision", async () => {
    writeGrant("sess-1", 3600);
    const out = await gate("PreToolUse", edit(APEX));
    expect(decisionOf(out)).toBe(null);
    expect(auditRows().some((r) => r.decision === "allow")).toBe(true);
  });

  test("an expired grant denies with lapsed-specific copy", async () => {
    writeGrant("sess-1", -10);
    const out = await gate("PreToolUse", edit(APEX));
    expect(decisionOf(out)).toBe("deny");
    expect(reasonOf(out)).toContain("lapsed");
    expect(reasonOf(out)).toContain("Re-enter");
  });

  test("a subagent deny does not instruct an impossible action", async () => {
    // A subagent cannot mint a grant; telling it to enter a skill would have it
    // retry against a byte-identical impossible instruction.
    const out = await gate("PreToolUse", edit(APEX, { agent_id: "agent-9" }));
    expect(decisionOf(out)).toBe("deny");
    const reason = reasonOf(out);
    expect(reason).toContain("parent thread");
    expect(reason).not.toMatch(/^Enter \//m);
  });

  test("a Flow file names the Flow authoring skill, not sf-work", async () => {
    const out = await gate("PreToolUse", {
      ...edit(FLOW),
      tool_name: "Write",
      tool_input: { file_path: FLOW },
    });
    expect(decisionOf(out)).toBe("deny");
    expect(reasonOf(out)).toContain("/flow-generate");
    expect(reasonOf(out)).not.toContain("/sf-work");
  });

  test("two consecutive denies produce byte-identical reasons", async () => {
    // Hook output is capped and a varying reason invites a retry loop.
    const a = await gate("PreToolUse", edit(APEX));
    const b = await gate("PreToolUse", edit(APEX));
    expect(reasonOf(a)).toBe(reasonOf(b));
  });
});

// ===========================================================================
// 2. It allows everything it should.
// ===========================================================================
describe("the gate allows", () => {
  test("reads and searches on the same path are never denied", async () => {
    for (const tool of ["Read", "Grep", "Glob", "Bash"]) {
      const out = await gate("PreToolUse", edit(APEX, { tool_name: tool }));
      expect(decisionOf(out)).toBe(null);
    }
  });

  test("non-metadata files are never denied", async () => {
    for (const p of [
      "/repo/README.md",
      "/repo/docs/plans/2026-09-12-something-plan.md",
      "/repo/cli/src/index.ts",
      "/repo/package.json",
    ]) {
      const out = await gate("PreToolUse", edit(p));
      expect(decisionOf(out)).toBe(null);
    }
  });

  test("a bare lwc directory outside a Salesforce tree is not denied", async () => {
    // Someone else's project that merely has a directory called lwc.
    const out = await gate("PreToolUse", edit("/other/src/lwc/widget/widget.js"));
    expect(decisionOf(out)).toBe(null);
  });
});

// ===========================================================================
// 3. Path handling: worktrees, traversal, escapes.
// ===========================================================================
describe("path predicate", () => {
  test("a worktree whose root differs from the project dir is still matched", async () => {
    // No CLAUDE_PROJECT_DIR anchor: that variable pins to the original root
    // while cwd and file_path follow the worktree, so an anchored predicate
    // would stop matching and fail open with no signal.
    const out = await gate(
      "PreToolUse",
      edit("/elsewhere/wt-2/force-app/main/default/classes/Foo.cls", {
        cwd: "/elsewhere/wt-2",
      }),
      { CLAUDE_PROJECT_DIR: "/repo" },
    );
    expect(decisionOf(out)).toBe("deny");
  });

  test("a .. path that normalises into the metadata tree is denied", async () => {
    const out = await gate(
      "PreToolUse",
      edit("/repo/docs/../force-app/main/default/classes/Foo.cls"),
    );
    expect(decisionOf(out)).toBe("deny");
  });

  test("a .. path that normalises OUT of the metadata tree is allowed", async () => {
    const out = await gate("PreToolUse", edit("/repo/force-app/../docs/notes.md"));
    expect(decisionOf(out)).toBe(null);
  });

  test("property: every valid JSON encoding of a matching path is denied", async () => {
    // The pre-filter must be a strict superset of the authoritative predicate.
    // A substring test over raw bytes is NOT a superset on its own: JSON
    // permits \/ and \uXXXX, so an escaped path decodes to a match the raw
    // bytes never contained. A false negative here is a silent allow.
    const encodings: Array<[string, string]> = [
      ["literal", '"/repo/force-app/main/default/classes/Foo.cls"'],
      ["solidus-escaped", '"\\/repo\\/force-app\\/main\\/default\\/classes\\/Foo.cls"'],
      [
        "unicode-escaped",
        '"/repo/\\u0066orce-app/main/default/classes/Foo.\\u0063ls"',
      ],
      [
        "fully-unicode-escaped-segment",
        '"/repo/\\u0066\\u006f\\u0072\\u0063\\u0065-app/main/default/classes/Foo.cls"',
      ],
    ];
    for (const [label, encoded] of encodings) {
      const raw =
        `{"hook_event_name":"PreToolUse","tool_name":"Edit","session_id":"sess-1",` +
        `"agent_id":null,"cwd":"/repo","tool_input":{"file_path":${encoded}}}`;
      const out = await gate("PreToolUse", raw);
      expect(decisionOf(out), `${label} must be denied, not silently allowed`).toBe(
        "deny",
      );
    }
  });
});

// ===========================================================================
// 4. Hostile input still yields well-formed JSON.
// ===========================================================================
describe("hostile file_path fixtures still produce well-formed output", () => {
  const hostile: Array<[string, string]> = [
    ["double quote", '/repo/force-app/a"b/Foo.cls'],
    ["backslash", "/repo/force-app/a\\b/Foo.cls"],
    ["newline", "/repo/force-app/a\nb/Foo.cls"],
    ["command substitution", "/repo/force-app/$(touch /tmp/pwned)/Foo.cls"],
    ["backtick", "/repo/force-app/`id`/Foo.cls"],
    ["semicolon", "/repo/force-app/a;rm -rf x/Foo.cls"],
    ["8KB of text", "/repo/force-app/" + "x".repeat(8192) + "/Foo.cls"],
    ["utf-8 with spaces", "/repo/force-app/Ünïcødé path/Foo.cls"],
  ];

  for (const [label, p] of hostile) {
    test(`${label}: well-formed deny, reason truncated not broken`, async () => {
      const out = await gate("PreToolUse", edit(p));
      expect(out.code).toBe(0);
      expect(out.json).not.toBe("UNPARSEABLE");
      expect(decisionOf(out)).toBe("deny");
      const reason = reasonOf(out);
      expect(typeof reason).toBe("string");
      expect(reason.length).toBeLessThan(400);
      expect(reason).toContain("Blocked");
    });
  }

  test("no command substitution in a path is ever executed", async () => {
    const marker = join(tmpdir(), `sfce-pwned-${randomUUID()}`);
    await gate("PreToolUse", edit(`/repo/force-app/$(touch ${marker})/Foo.cls`));
    await gate("PreToolUse", edit("/repo/force-app/`touch " + marker + "`/Foo.cls"));
    expect(existsSync(marker)).toBe(false);
  });
});

// ===========================================================================
// 5. Observe-only shipping default.
// ===========================================================================
describe("observe-only is the shipping default", () => {
  test("without SFCE_GATE_ENFORCE the call is allowed and a would_deny recorded", async () => {
    const out = await gate("PreToolUse", edit(APEX), { SFCE_GATE_ENFORCE: "" });
    expect(decisionOf(out)).toBe(null);
    const rows = auditRows();
    expect(rows.some((r) => r.decision === "would_deny")).toBe(true);
  });

  test("observe-only still records the grant state it would have used", async () => {
    writeGrant("sess-1", -10);
    await gate("PreToolUse", edit(APEX), { SFCE_GATE_ENFORCE: "" });
    const row = auditRows().find((r) => r.decision === "would_deny");
    expect(row.grant).toBe("expired");
  });
});

// ===========================================================================
// 6. Override.
// ===========================================================================
describe("override", () => {
  test("allows the call, records an override event, and names the location", async () => {
    const out = await gate("PreToolUse", edit(APEX), { SFCE_GATE_OVERRIDE: "1" });
    expect(decisionOf(out)).toBe(null);
    expect(auditRows().some((r) => r.decision === "override")).toBe(true);
    expect(out.stderr).toContain("audit.jsonl");
  });

  test("does not claim an audited override when the sink is unwritable", async () => {
    mkdirSync(state, { recursive: true });
    chmodSync(state, 0o500);
    const out = await gate("PreToolUse", edit(APEX), { SFCE_GATE_OVERRIDE: "1" });
    expect(out.code).toBe(0);
    expect(out.stderr).toContain("could NOT be written");
    chmodSync(state, 0o700);
  });
});

// ===========================================================================
// 7. Fail open, loudly (KTD10).
// ===========================================================================
describe("fail open with a visible warning", () => {
  test("unreadable gate state allows and records an error decision", async () => {
    const grants = join(state, "gate", "grants");
    mkdirSync(grants, { recursive: true });
    writeFileSync(join(grants, "sess-1"), "v=1\nexpires=9999999999\n");
    chmodSync(join(grants, "sess-1"), 0o000);
    try {
      const out = await gate("PreToolUse", edit(APEX));
      expect(out.code).toBe(0);
      expect(decisionOf(out)).toBe(null);
      expect(out.stderr.length).toBeGreaterThan(0);
      expect(auditRows().some((r) => r.decision === "error")).toBe(true);
    } finally {
      chmodSync(join(grants, "sess-1"), 0o600);
    }
  });

  test("malformed stdin allows with a warning", async () => {
    for (const bad of ["", "not json", "{", '{"a":', "[]"]) {
      const out = await gate("PreToolUse", bad);
      expect(out.code).toBe(0);
      expect(decisionOf(out)).toBe(null);
    }
  });

  test("no python on PATH allows with a warning", async () => {
    // PATH must still contain bash, or /usr/bin/env cannot start the script at
    // all and the run exits 127 -- which would test the harness, not the gate.
    // So: a PATH with the shell utilities present and python absent.
    const binDir = join(state, "bin-no-python");
    mkdirSync(binDir, { recursive: true });
    for (const tool of ["bash", "sh", "cat", "printf", "mkdir", "chmod", "dirname", "cd"]) {
      const src = ["/bin/" + tool, "/usr/bin/" + tool].find((p) => existsSync(p));
      if (src) {
        try {
          require("fs").symlinkSync(src, join(binDir, tool));
        } catch {
          /* already linked */
        }
      }
    }

    const proc = Bun.spawn([GATE, "PreToolUse"], {
      stdin: new TextEncoder().encode(JSON.stringify(edit(APEX))),
      stdout: "pipe",
      stderr: "pipe",
      env: {
        PATH: binDir,
        HOME: state,
        SFCE_STATE_HOME: state,
        SFCE_GATE_ENABLED: "1",
        SFCE_GATE_ENFORCE: "1",
      },
    });
    const stderr = await new Response(proc.stderr).text();
    const stdout = await new Response(proc.stdout).text();
    expect(await proc.exited).toBe(0);
    expect(stdout.trim()).toBe("");
    expect(stderr.length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 8. Flag off.
// ===========================================================================
describe("gate off", () => {
  test("exits 0 without reading stdin, for every mutating tool", async () => {
    for (const tool of ["Edit", "Write", "NotebookEdit"]) {
      const proc = Bun.spawn([GATE, "PreToolUse"], {
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
      expect(exited, `${tool} with the gate off must not read stdin`).toBe(0);
    }
  });
});

// ===========================================================================
// 9. PostToolUse record-only: the independent denominator (KTD15, R26).
// ===========================================================================
describe("PostToolUse record-only mode", () => {
  test("records that a metadata edit landed, by path class only", async () => {
    const out = await gate("PostToolUse", {
      ...edit(APEX),
      hook_event_name: "PostToolUse",
    });
    expect(decisionOf(out)).toBe(null);
    const landed = auditRows().find((r) => r.decision === "edit_landed");
    expect(landed).toBeDefined();
    expect(landed.rule).toBe("**/force-app/**");
    // Path class only -- the row must never carry the user's actual path.
    expect(JSON.stringify(landed)).not.toContain("Foo.cls");
  });

  test("never denies, even with no grant at all", async () => {
    const out = await gate("PostToolUse", {
      ...edit(APEX),
      hook_event_name: "PostToolUse",
    });
    expect(out.json?.hookSpecificOutput).toBeUndefined();
  });

  test("an inert gate is detectable: an edit_landed row with no decision row", async () => {
    // This is the join the detector performs. With only the PreToolUse half,
    // a gate that never ran produces no row on either side and is invisible.
    await gate("PostToolUse", { ...edit(APEX), hook_event_name: "PostToolUse" });
    const rows = auditRows();
    expect(rows.some((r) => r.decision === "edit_landed")).toBe(true);
    expect(rows.some((r) => ["deny", "allow", "would_deny"].includes(r.decision))).toBe(
      false,
    );
  });
});
