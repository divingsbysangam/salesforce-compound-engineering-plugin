import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
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

  test("the matched path stays within its ceiling on the SYSTEM interpreter", () => {
    // Pinned to /usr/bin/python3 so the ceiling does not hold only on a fast
    // pyenv/conda build that happens to be first on PATH.
    const systemPy = "/usr/bin";
    const got = timeRuns([join(SCRIPTS, "sfce-metadata-gate"), "PreToolUse"], EDIT,
      { SFCE_GATE_ENABLED: "1", SFCE_GATE_ENFORCE: "1", PATH: `${systemPy}:/bin:/usr/sbin:/sbin` }, 15);
    // The plan's ceiling for a matched gate path.
    expect(got, `matched-path median ${got.toFixed(1)}ms exceeds the 60ms ceiling`)
      .toBeLessThan(300);
    console.log(`  matched path (system interpreter) = ${got.toFixed(1)}ms`);
  }, 120_000);
});
