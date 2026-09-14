import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SCRIPTS = join(REPO_ROOT, "scripts");

/**
 * U10 — latency budget, asserted RELATIVE to this machine's own spawn floor.
 *
 * An absolute threshold flakes on a loaded CI runner and passes trivially on a
 * fast laptop. Measuring the floor first and asserting a margin above it is
 * stable across a tenfold speed range, and it fails precisely on the regression
 * that matters: work added ABOVE the flag test, where every install pays it on
 * every matching tool call whether or not they enabled anything.
 */

let state: string;
beforeEach(() => {
  state = mkdtempSync(join(tmpdir(), "sfce-budget-"));
});
afterEach(() => rmSync(state, { recursive: true, force: true }));

const EDIT = JSON.stringify({
  hook_event_name: "PreToolUse",
  tool_name: "Edit",
  session_id: "budget",
  agent_id: null,
  cwd: "/repo",
  tool_use_id: "toolu_budget",
  tool_input: { file_path: "/repo/force-app/main/default/classes/Foo.cls" },
});

const BASH = JSON.stringify({
  hook_event_name: "PostToolUse",
  tool_name: "Bash",
  session_id: "budget",
  cwd: "/repo",
  tool_input: { command: "git status" },
});

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] as number;
}

/** Median wall time of running `argv` with `payload` on stdin, over n runs. */
function timeRuns(
  argv: string[],
  payload: string,
  env: Record<string, string>,
  n: number,
): number {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    Bun.spawnSync(argv, {
      stdin: new TextEncoder().encode(payload),
      stdout: "ignore",
      stderr: "ignore",
      env: { PATH: process.env.PATH ?? "", HOME: state, SFCE_STATE_HOME: state, ...env },
    });
    samples.push(performance.now() - t0);
  }
  return median(samples);
}

/**
 * The machine's own cost to start the SYSTEM interpreter and do nothing.
 *
 * A bash no-op is the wrong baseline for a path dominated by interpreter
 * startup: at a 3.4ms bash floor, a x200 bound allows 680ms, which would let a
 * 500ms parser regression through. Budgeting the hook's own work ABOVE python
 * startup measures the thing that can actually regress.
 */
function pythonFloor(): number {
  return timeRuns(["/usr/bin/python3", "-I", "-c", "pass"], "", {}, 15);
}

/** The machine's own cost to fork a shell that does nothing. */
function spawnFloor(): number {
  return timeRuns(["/bin/bash", "-c", "exit 0"], "", {}, 20);
}

describe("latency budget, relative to the measured spawn floor", () => {
  test("with its flag unset, each handler stays near the bare-spawn floor", () => {
    const floor = spawnFloor();
    // Generous margin: this asserts "no meaningful work happens above the flag
    // test", not a precise number. A regression that adds a parse or a file
    // read there costs far more than this.
    const margin = Math.max(25, floor * 2);

    const cases: Array<[string, string, string]> = [
      ["sfce-metadata-gate", "PreToolUse", EDIT],
      ["sfce-skill-observer", "PostToolUse", EDIT],
      ["sfce-bash-observer", "PostToolUse", BASH],
      ["sfce-gate-selfcheck", "SessionStart", "{}"],
    ];

    const report: string[] = [];
    for (const [script, event, payload] of cases) {
      const got = timeRuns([join(SCRIPTS, script), event], payload, {}, 30);
      report.push(`${script}=${got.toFixed(1)}ms`);
      expect(
        got,
        `${script} flags-off median ${got.toFixed(1)}ms exceeds floor ${floor.toFixed(
          1,
        )}ms + ${margin.toFixed(1)}ms. Work was added above the flag test, and ` +
          `every install pays it whether or not they enabled anything.`,
      ).toBeLessThan(floor + margin);
    }
    console.log(`  floor=${floor.toFixed(1)}ms  ${report.join("  ")}`);
  }, 120_000);

  test("a non-matching payload with the flag SET stays cheap too", () => {
    // The substring tier exists for this: the common case must not reach the
    // interpreter. `git status` carries no metadata token.
    const floor = spawnFloor();
    const got = timeRuns([join(SCRIPTS, "sfce-bash-observer"), "PostToolUse"], BASH,
      { SFCE_GATE_ENABLED: "1", SFCE_SKILL_LOG_ENABLED: "1" }, 30);
    expect(got, `non-matching median ${got.toFixed(1)}ms`).toBeLessThan(floor + Math.max(40, floor * 3));
  }, 120_000);

  test("the matched path's own work stays small above interpreter startup", () => {
    // Baseline is a bare SYSTEM python3 start, not a bash no-op. The matched
    // path is dominated by interpreter startup, and budgeting against bash
    // measures mostly that startup rather than anything this script does --
    // at a 3.4ms bash floor a x200 bound allows 680ms, wide enough to hide a
    // 500ms parser regression.
    //
    // The gate spawns the interpreter EXACTLY ONCE (KTD11). It used to spawn it
    // three times -- decide, extract the audit row, strip it back out -- which
    // cost ~92ms of pure startup and is why this path measured 177ms. One spawn
    // brings it to ~70ms against a ~31ms python floor, so the hook's own work
    // is roughly 40ms.
    const pyFloor = pythonFloor();
    const OWN_WORK_BUDGET_MS = 120; // generous, but far below a second spawn

    const got = timeRuns([join(SCRIPTS, "sfce-metadata-gate"), "PreToolUse"], EDIT,
      { SFCE_GATE_ENABLED: "1", SFCE_GATE_ENFORCE: "1", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" }, 15);
    const ownWork = got - pyFloor;

    expect(
      ownWork,
      `the gate's own work is ${ownWork.toFixed(1)}ms above a ${pyFloor.toFixed(1)}ms ` +
        `interpreter floor (total ${got.toFixed(1)}ms), over the ${OWN_WORK_BUDGET_MS}ms ` +
        `budget. A second interpreter spawn costs about a full floor, so check ` +
        `that the parser is still invoked exactly once.`,
    ).toBeLessThan(OWN_WORK_BUDGET_MS);

    console.log(
      `  matched path = ${got.toFixed(1)}ms (python floor ${pyFloor.toFixed(1)}ms, ` +
        `own work ${ownWork.toFixed(1)}ms)`,
    );
  }, 120_000);

  test("the gate spawns the interpreter exactly once (KTD11)", () => {
    // The structural half of the budget above: a regression that adds a spawn
    // is visible here even on a machine too fast for the timing to notice.
    const body = readFileSync(join(SCRIPTS, "sfce-metadata-gate"), "utf-8");
    const spawns = [...body.matchAll(/(?:\|\s*|\$\()"\$PY"\s+-I/g)];
    expect(spawns.length, `expected exactly 1 parser spawn, found ${spawns.length}`).toBe(1);
  });
});
