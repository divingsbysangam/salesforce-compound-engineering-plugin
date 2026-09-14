import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const REPORTER = join(REPO_ROOT, "scripts", "skill-usage");

/**
 * U7 — the skill-usage reporter.
 *
 * The expensive failure is a WRONG DELETION: a maintainer reads "cold" beside a
 * conditional skill and removes it. So the wording is tested as strictly as the
 * arithmetic, and the word "unused" must never appear in any output.
 */

let state: string;

beforeEach(() => {
  state = join(tmpdir(), `sfce-usage-${randomUUID()}`);
  mkdirSync(join(state, "telemetry"), { recursive: true });
  mkdirSync(join(state, "gate"), { recursive: true });
});
afterEach(() => rmSync(state, { recursive: true, force: true }));

async function report(args: string[] = []): Promise<{ code: number; out: string }> {
  const proc = Bun.spawn(["python3", REPORTER, ...args, "--state-dir", state], {
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "", HOME: state },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, out: stdout + stderr };
}

const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const day = (d: Date) => iso(d).slice(0, 10);
const ago = (days: number) => new Date(Date.now() - days * 86400_000);

interface Row {
  skill: string;
  ts?: Date;
  session?: string;
  repo?: string;
  agent?: string | null;
  entry?: string;
}

function writeRows(rows: Row[]) {
  const byDay: Record<string, string[]> = {};
  for (const r of rows) {
    const when = r.ts ?? new Date();
    const line = JSON.stringify({
      v: 1,
      ts: iso(when),
      session_ref: r.session ?? "sess-hash-a",
      agent_ref: r.agent ?? null,
      skill: r.skill,
      entry: r.entry ?? "model",
      repo_ref: r.repo ?? "repo-hash-a",
    });
    (byDay[day(when)] ??= []).push(line);
  }
  for (const [d, lines] of Object.entries(byDay)) {
    writeFileSync(join(state, "telemetry", `skills-${d}.jsonl`), lines.join("\n") + "\n");
  }
}

function writeAudit(lines: object[]) {
  writeFileSync(
    join(state, "gate", "audit.jsonl"),
    lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
  );
}

// ===========================================================================
// 1. The wording. This is the unit's actual deliverable.
// ===========================================================================
describe("wording that prevents a wrong deletion", () => {
  test('the word "unused" never appears, in any state', async () => {
    for (const setup of [
      () => {},
      () => writeRows([{ skill: "sf-work" }]),
      () => writeRows([{ skill: "sf-work", ts: ago(120) }]),
    ]) {
      rmSync(join(state, "telemetry"), { recursive: true, force: true });
      mkdirSync(join(state, "telemetry"), { recursive: true });
      setup();
      const r = await report();
      expect(r.out.toLowerCase()).not.toContain("unused");
    }
  });

  test("a short window prints NO EVIDENCE, not cold", async () => {
    writeRows([{ skill: "sf-work", ts: ago(2) }]);
    const r = await report(["--since", "3d", "--plugin-root", REPO_ROOT]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("NO EVIDENCE");
    expect(r.out).toContain("absence of data");
    expect(r.out.toLowerCase()).not.toContain("cold");
  });

  test("a long window says no entries OBSERVED, still not cold", async () => {
    writeRows([{ skill: "sf-work", ts: ago(60) }]);
    const r = await report(["--since", "90d", "--plugin-root", REPO_ROOT]);
    expect(r.out).toContain("NO ENTRIES RECORDED");
    expect(r.out).toContain("not the same as");
    expect(r.out.toLowerCase()).not.toContain("cold");
  });

  test("the caveats always print, including the sf-lfg under-report", async () => {
    writeRows([{ skill: "sf-work" }]);
    const r = await report();
    expect(r.out).toContain("UNDER-REPORTS");
    expect(r.out).toContain("sf-lfg");
    expect(r.out).toContain("conditional skill can idle");
  });
});

// ===========================================================================
// 2. Counting.
// ===========================================================================
describe("counting", () => {
  test("an empty log exits 0 and still prints a header", async () => {
    const r = await report();
    expect(r.code).toBe(0);
    expect(r.out).toContain("Skill usage");
    expect(r.out).toContain("collection start");
  });

  test("concentrated and spread usage render differently", async () => {
    // 40 entries in one session/one repo must not look like 40 across twelve
    // sessions and four repos -- that difference is the whole signal.
    // One call: writeRows composes a fresh file per day, so two calls covering
    // the same day would clobber the first set.
    writeRows([
      ...Array.from({ length: 40 }, () => ({
        skill: "concentrated",
        session: "one",
        repo: "one",
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        skill: "spread",
        session: `s${i % 12}`,
        repo: `r${i % 4}`,
      })),
    ]);
    const r = await report();
    const line = (name: string) =>
      r.out.split("\n").find((l) => l.includes(name)) ?? "";
    expect(line("concentrated")).toMatch(/\b40\b.*\b1\b\s+\b1\b/);
    expect(line("spread")).toMatch(/\b40\b.*\b12\b\s+\b4\b/);
  });

  test("subagent entries are a separate column, never summed in", async () => {
    writeRows([
      { skill: "sf-review" },
      { skill: "sf-review" },
      { skill: "sf-review", agent: "agent-hash-1" },
      { skill: "sf-review", agent: "agent-hash-2" },
      { skill: "sf-review", agent: "agent-hash-3" },
    ]);
    const r = await report();
    const line = r.out.split("\n").find((l) => l.includes("sf-review")) ?? "";
    const nums = line.trim().split(/\s+/).slice(1);
    expect(nums[0]).toBe("2"); // main thread
    expect(nums[1]).toBe("3"); // subagent, reported not discarded
  });

  test("a corrupt line is skipped, counted, and the table still prints", async () => {
    writeRows([{ skill: "sf-work" }]);
    const f = join(state, "telemetry", `skills-${day(new Date())}.jsonl`);
    writeFileSync(f, `{"broken"\nnot json at all\n` + require("fs").readFileSync(f, "utf-8"));
    const r = await report();
    expect(r.code).toBe(0);
    expect(r.out).toContain("sf-work");
    expect(r.out).toMatch(/2 unparseable line\(s\) skipped/);
  });

  test("--since excludes older rows and moves the reported collection start", async () => {
    writeRows([
      { skill: "old-one", ts: ago(60) },
      { skill: "recent-one", ts: ago(1) },
    ]);
    const r = await report(["--since", "7d"]);
    expect(r.out).toContain("recent-one");
    expect(r.out.split("Caveats")[0]).not.toContain("old-one");
    expect(r.out).toContain(day(ago(7)));
  });
});

// ===========================================================================
// 3. Health warnings.
// ===========================================================================
describe("health warnings", () => {
  test("a cross-path collision warns and does NOT print the row", async () => {
    const when = new Date();
    writeRows([
      { skill: "sf-plan", ts: when, session: "sess-hash-x", entry: "slash" },
      { skill: "sf-plan", ts: when, session: "sess-hash-x", entry: "model" },
    ]);
    const r = await report();
    expect(r.out).toContain("entry-path collision");
    expect(r.out).toContain("NOT deduplicated");
    // The row carries references; the warning must never echo it.
    expect(r.out).not.toContain("sess-hash-x");
    expect(r.out).not.toContain("repo-hash-a");
  });

  test("two entries on the SAME path in one second are not a collision", async () => {
    const when = new Date();
    writeRows([
      { skill: "sf-plan", ts: when, session: "s", entry: "model" },
      { skill: "sf-plan", ts: when, session: "s", entry: "model" },
    ]);
    const r = await report();
    expect(r.out).not.toContain("entry-path collision");
  });

  test("an edit that landed with no decision row raises the gate warning", async () => {
    // The inert-gate detector: a gate that never ran writes no decision row,
    // and "no rows" is otherwise indistinguishable from "no edits happened".
    writeRows([{ skill: "sf-work" }]);
    writeAudit([
      { v: 1, event: "gate_decision", decision: "edit_landed", rule: "**/force-app/**" },
      { v: 1, event: "gate_decision", decision: "edit_landed", rule: "**/force-app/**" },
      { v: 1, event: "gate_decision", decision: "allow", rule: "**/force-app/**" },
    ]);
    const r = await report();
    expect(r.out).toContain("gate health");
    expect(r.out).toContain("1 metadata edit(s) landed");
  });

  test("matched decisions for every landed edit produce no gate warning", async () => {
    writeRows([{ skill: "sf-work" }]);
    writeAudit([
      { v: 1, event: "gate_decision", decision: "edit_landed" },
      { v: 1, event: "gate_decision", decision: "allow" },
    ]);
    const r = await report();
    expect(r.out).not.toContain("gate health");
  });

  test("shell bypass events are surfaced", async () => {
    writeRows([{ skill: "sf-work" }]);
    writeAudit([{ v: 1, event: "bash_bypass", class: "heredoc" }]);
    const r = await report();
    expect(r.out).toContain("shell bypass");
  });
});

// ===========================================================================
// 4. Redaction (R14).
// ===========================================================================
describe("redaction", () => {
  test("no references, absolute paths, or raw lines appear in output", async () => {
    writeRows([
      { skill: "sf-work", session: "SESSIONREF123", repo: "REPOREF456", agent: "AGENTREF789" },
    ]);
    const r = await report();
    for (const forbidden of ["SESSIONREF123", "REPOREF456", "AGENTREF789"]) {
      expect(r.out, `leaked ${forbidden}`).not.toContain(forbidden);
    }
    expect(r.out).not.toContain(state); // no absolute path
    expect(r.out).not.toMatch(/\/(Users|home)\//);
    expect(r.out).not.toContain('{"v":1'); // no raw log line
  });

  test("a skill name carrying terminal escapes cannot rewrite the terminal", async () => {
    // What matters is that the ESC byte cannot reach a terminal: a name able to
    // emit ESC[2J would clear the screen as the report prints, and could
    // repaint the very numbers a maintainer is about to act on. The leftover
    // "[2J[31m" text is inert without the escape, so it is fine for it to show.
    const ESC = String.fromCharCode(27);
    writeRows([{ skill: `evil${ESC}[2J${ESC}[31mNAME` }]);
    const r = await report();
    expect(r.out).not.toContain(ESC);
    expect(r.out).not.toMatch(/[\x00-\x08\x0b-\x1f\x7f]/);
    expect(r.out).toContain("evil[2J[31mNAME");
  });
});

// ===========================================================================
// 5. Purge and rotation.
// ===========================================================================
describe("purge", () => {
  test("purge removes the store and reports what it removed", async () => {
    writeRows([{ skill: "sf-work" }]);
    writeAudit([{ v: 1, event: "gate_decision", decision: "allow" }]);
    const r = await report(["purge"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("Purged");
    expect(existsSync(join(state, "telemetry"))).toBe(false);
  });

  test("--older-than drops whole partitions only", async () => {
    writeRows([
      { skill: "old", ts: ago(120) },
      { skill: "new", ts: ago(1) },
    ]);
    const before = readdirSync(join(state, "telemetry")).length;
    expect(before).toBe(2);
    const r = await report(["purge", "--older-than", "30d"]);
    expect(r.out).toContain("Purged 1 partition(s)");
    const after = readdirSync(join(state, "telemetry"));
    expect(after.length).toBe(1);
    expect(after[0]).toContain(day(ago(1)));
  });

  test("purge on an empty store exits 0", async () => {
    rmSync(join(state, "telemetry"), { recursive: true, force: true });
    const r = await report(["purge"]);
    expect(r.code).toBe(0);
  });
});

// ===========================================================================
// 6. Performance — single pass, not a per-skill re-scan.
// ===========================================================================
describe("performance", () => {
  test("a one-million-row log completes well inside the budget", async () => {
    // O13: a per-skill re-scan over ~69 skills turns this into tens of seconds.
    const skills = Array.from({ length: 69 }, (_, i) => `skill-${i}`);
    const when = iso(new Date());
    const chunks: string[] = [];
    for (let i = 0; i < 1_000_000; i++) {
      chunks.push(
        `{"v":1,"ts":"${when}","session_ref":"s${i % 500}","agent_ref":null,` +
          `"skill":"${skills[i % 69]}","entry":"model","repo_ref":"r${i % 20}"}`,
      );
    }
    writeFileSync(
      join(state, "telemetry", `skills-${day(new Date())}.jsonl`),
      chunks.join("\n") + "\n",
    );

    const started = Date.now();
    const r = await report();
    const elapsed = Date.now() - started;

    expect(r.code).toBe(0);
    expect(r.out).toContain("skill-0");
    expect(elapsed, `took ${elapsed}ms`).toBeLessThan(30_000);
  }, 180_000);
});
