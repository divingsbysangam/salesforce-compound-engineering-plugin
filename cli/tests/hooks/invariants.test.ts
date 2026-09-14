import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SCRIPTS = join(REPO_ROOT, "scripts");
const FIXTURES = join(REPO_ROOT, "cli", "tests", "hooks", "fixtures");

const HOOK_SCRIPTS = [
  "sfce-metadata-gate",
  "sfce-skill-observer",
  "sfce-bash-observer",
  "sfce-gate-selfcheck",
];
const ALL_SHIPPED = [...HOOK_SCRIPTS, "skill-usage", "session-start"];

const read = (name: string) => readFileSync(join(SCRIPTS, name), "utf-8");

/**
 * U10 — standing invariants over the shipped scripts and fixtures.
 *
 * These exist because a promise in a plan does not survive a future edit. Each
 * one is a property the threat model depends on, expressed as a red test rather
 * than a sentence someone has to remember.
 */

describe("no network, ever", () => {
  test("no shipped script can make a network call", () => {
    // The plan promises local-only. A future edit that adds a curl for an
    // update check would quietly break that promise for every install.
    const banned = [
      /\bcurl\b/, /\bwget\b/, /\bnc\b\s/, /\bssh\b/, /\bscp\b/, /\brsync\b/,
      /\bnpm\s+(install|i|publish)\b/, /\bpip\s+install\b/,
      /urllib/, /http\.client/, /\brequests\./, /socket\.socket/,
      /fetch\s*\(/, /https?:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?/i,
    ];
    for (const name of ALL_SHIPPED) {
      const body = read(name);
      for (const pattern of banned) {
        const m = pattern.exec(body);
        expect(
          m,
          `${name} contains a network-capable construct: ${m?.[0]}`,
        ).toBeNull();
      }
    }
  });
});

describe("every parser spawn is isolated", () => {
  test("each hook script invokes python with -I", () => {
    // Not merely -S. Hooks run with the working directory on the module search
    // path, so without -I a json.py committed to a repository the developer did
    // not author would be imported and executed with full user permissions on
    // every matched call.
    for (const name of HOOK_SCRIPTS) {
      const body = read(name);
      // Only actual INVOCATIONS, not conditionals like `[ -z "$PY" ]` or
      // `case "$PY" in`. A spawn is "$PY" in command position: after a pipe,
      // inside $(...), or at the start of a line.
      const spawns = [...body.matchAll(/(?:\|\s*|\$\(|^\s*)"\$PY"\s+(\S+)/gm)];
      expect(spawns.length, `${name}: no parser spawn found — has it been renamed?`)
        .toBeGreaterThan(0);
      for (const s of spawns) {
        expect(s[1], `${name}: a parser spawn is not isolated -> "$PY" ${s[1]}`).toBe("-I");
      }
    }
  });

  test("no hook script disables isolation with -S or a bare invocation", () => {
    for (const name of HOOK_SCRIPTS) {
      const body = read(name);
      expect(body, `${name} uses -S instead of -I`).not.toMatch(/"\$PY"\s+-S\b/);
    }
  });
});

describe("fixtures carry nothing sensitive", () => {
  const files = readdirSync(FIXTURES).filter((f) => f.endsWith(".json"));

  test("there are fixtures to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test("no fixture contains a home path, raw uuid, prompt text, or file content", () => {
    const SYNTHETIC = new Set([
      "00000000-0000-0000-0000-000000000000",
      "11111111-1111-1111-1111-111111111111",
    ]);
    for (const f of files) {
      const body = readFileSync(join(FIXTURES, f), "utf-8");
      expect(body, `${f} carries a home-directory path`).not.toMatch(/\/(Users|home)\//);
      expect(body, `${f} carries prompt text`).not.toContain('"prompt"');
      expect(body, `${f} carries tool output`).not.toContain("tool_response");
      expect(body, `${f} carries command args`).not.toContain("command_args");
      for (const uuid of body.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g) ?? []) {
        expect(SYNTHETIC.has(uuid), `${f} carries a raw uuid: ${uuid}`).toBe(true);
      }
    }
  });
});

describe("skill-entry field-name drift", () => {
  // If Claude Code renames a field the observer reads, every entry silently
  // stops being recorded and the telemetry simply looks quiet. This fails
  // loudly instead, naming the field.
  const events = readdirSync(FIXTURES)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(readFileSync(join(FIXTURES, f), "utf-8")).events as any[]);

  test("the model path still carries tool_input.skill on a Skill event", () => {
    const skillEvents = events.filter((e) => e.tool_name === "Skill");
    expect(skillEvents.length, "no Skill event in any fixture").toBeGreaterThan(0);
    for (const e of skillEvents) {
      expect(e.tool_input, "tool_input disappeared from a Skill event").toBeTruthy();
      expect(
        Object.keys(e.tool_input),
        "tool_input.skill was renamed — the observer reads this exact field",
      ).toContain("skill");
    }
  });

  test("the slash path still carries command_name on an expansion event", () => {
    const expansions = events.filter((e) => e.hook_event_name === "UserPromptExpansion");
    expect(expansions.length, "no expansion event in any fixture").toBeGreaterThan(0);
    for (const e of expansions) {
      expect(e.command_name, "command_name was renamed").toBeTruthy();
      expect(e.expansion_type).toBe("slash_command");
    }
  });

  test("skill identity is still plugin-qualified on both paths", () => {
    // If this ever becomes bare, the observer's qualifier strip becomes a
    // no-op rather than a bug — but the allowlist match would change meaning,
    // so the change must be noticed.
    const ids = [
      ...events.filter((e) => e.tool_name === "Skill").map((e) => e.tool_input?.skill),
      ...events.filter((e) => e.command_name).map((e) => e.command_name),
    ].filter(Boolean) as string[];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id, `identity is no longer qualified: ${id}`).toContain(":");
    }
  });

  test("SessionStart still carries a source, and a fork still carries no parent id", () => {
    const starts = events.filter((e) => e.hook_event_name === "SessionStart");
    expect(starts.length).toBeGreaterThan(0);
    for (const e of starts) expect(e.source).toBeTruthy();

    const fork = starts.find((e) => e.source === "fork");
    expect(fork, "no fork fixture").toBeTruthy();
    for (const k of Object.keys(fork)) {
      expect(k.toLowerCase(), "a fork now carries a parent reference — revisit KTD4")
        .not.toContain("parent");
    }
  });
});

describe("the normalised fact's own shape", () => {
  test("the observer's record contract is documented in the script it describes", () => {
    const body = read("sfce-skill-observer");
    for (const field of ["session_ref", "agent_ref", "skill", "entry", "repo_ref"]) {
      expect(body, `the record contract no longer documents ${field}`).toContain(field);
    }
    expect(body).toContain('"v":1');
  });
});

describe("shipped scripts stay executable", () => {
  test("every shipped script has the executable bit", () => {
    for (const name of ALL_SHIPPED) {
      expect(statSync(join(SCRIPTS, name)).mode & 0o111, `${name} is not executable`)
        .toBeGreaterThan(0);
    }
  });
});
