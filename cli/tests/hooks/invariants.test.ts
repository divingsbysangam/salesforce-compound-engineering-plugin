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

/**
 * Scripts permitted to make a network call. THE ONLY ENTRY IS THE DELEGATION
 * TIER, whose entire purpose is an API call to a cheap worker.
 *
 * This list exists so the exception is DECLARED rather than a hole. The
 * "no network, ever" test below used to iterate a hardcoded ALL_SHIPPED, which
 * meant a new network-capable script in scripts/ was covered by nothing at all
 * -- and the next person adding a hook would reasonably copy whatever was
 * already there. The test now enumerates the directory, so every script is
 * either network-free or named here on purpose.
 *
 * Adding an entry is a threat-model change, not a convenience. A PreToolUse
 * hook that can reach the network is a different thing entirely: hooks run on
 * every matched tool call, before permission resolution, with the user's full
 * rights.
 */
const NETWORK_PERMITTED = ["sfce-delegate"];

/** Every script shipped from scripts/, discovered rather than listed. */
const shippedScripts = (): string[] =>
  readdirSync(SCRIPTS, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    // .mjs/.py helpers are build and reporting tools, not shipped hook scripts,
    // and are covered by their own checks.
    .filter((n) => !n.endsWith(".mjs") && !n.endsWith(".py"))
    .sort();

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
    // Enumerated, not listed. A hardcoded list silently exempts whatever is
    // added next, which is the failure mode that let a network-capable script
    // sit in scripts/ covered by nothing.
    for (const name of shippedScripts()) {
      if (NETWORK_PERMITTED.includes(name)) continue;
      const body = read(name);
      for (const pattern of banned) {
        const m = pattern.exec(body);
        expect(
          m,
          `${name} contains a network-capable construct: ${m?.[0]}\n` +
            `If this is deliberate, add it to NETWORK_PERMITTED and say why. ` +
            `Do not widen the pattern list.`,
        ).toBeNull();
      }
    }
  });

  test("no exemption is stale, and the enumeration actually sees the scripts", () => {
    // A stale exemption is an exemption nobody is reviewing: if sfce-delegate
    // were renamed, NETWORK_PERMITTED would keep exempting a name that no
    // longer exists while the new name went unchecked.
    const present = shippedScripts();
    for (const name of NETWORK_PERMITTED) {
      expect(
        present.includes(name),
        `NETWORK_PERMITTED names ${name}, which is not in scripts/`,
      ).toBe(true);
    }
    // And the enumeration must actually be finding files. A readdir that
    // returned nothing -- wrong path, changed layout -- would make the
    // no-network loop above iterate zero scripts and pass vacuously, which is
    // the same shape of bug as the echo that stood in for the eval gate.
    expect(present.length).toBeGreaterThanOrEqual(ALL_SHIPPED.length);
    for (const name of ALL_SHIPPED) {
      expect(present, `the enumeration missed ${name}`).toContain(name);
    }
  });

  test("no hook script invokes the delegation tier", () => {
    // Calling sfce-delegate from a hook would put a network round-trip on every
    // matched tool call and route the hook payload to a third party. The
    // no-network invariant above would still pass, because the hook itself
    // would contain no curl.
    for (const name of ALL_SHIPPED) {
      expect(read(name), `${name} invokes sfce-delegate`).not.toContain("sfce-delegate");
    }
  });

  test("the delegation tier cannot be pointed at an arbitrary host", () => {
    // It is the one script allowed to talk to the network, so the set of hosts
    // it will talk to is the whole of its blast radius. The endpoint override
    // exists for offline testing and is constrained to loopback; without that
    // constraint an env var would be a way to ship the repository's own source
    // (which is passed as reference material) to a third party.
    const body = read("sfce-delegate");
    expect(body).toContain('DEFAULT_API_BASE="https://api.anthropic.com"');
    expect(body).toContain("http://127.0.0.1");
    expect(body).toMatch(/fatal "SFCE_WORKER_API_BASE must be/);
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
