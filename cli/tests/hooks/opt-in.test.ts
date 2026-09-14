import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, cpSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const HOOKS = JSON.parse(readFileSync(join(REPO_ROOT, "hooks", "hooks.json"), "utf-8"));
const MANIFEST = JSON.parse(
  readFileSync(join(REPO_ROOT, ".claude-plugin", "plugin.json"), "utf-8"),
);

const SHIPPED_SCRIPTS = [
  "sfce-metadata-gate",
  "sfce-skill-observer",
  "sfce-bash-observer",
  "sfce-gate-selfcheck",
  "skill-usage",
  "session-start",
];

let state: string;
beforeEach(() => {
  state = join(tmpdir(), `sfce-optin-${randomUUID()}`);
  mkdirSync(state, { recursive: true });
});
afterEach(() => rmSync(state, { recursive: true, force: true }));

interface Res { code: number; stdout: string; stderr: string }

async function runScript(
  script: string,
  arg: string,
  payload: string,
  env: Record<string, string> = {},
  root = REPO_ROOT,
): Promise<Res> {
  const proc = Bun.spawn([join(root, "scripts", script), arg], {
    stdin: new TextEncoder().encode(payload),
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: state,
      SFCE_STATE_HOME: state,
      CLAUDE_PLUGIN_ROOT: root,
      ...env,
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, stdout, stderr };
}

const editPayload = JSON.stringify({
  hook_event_name: "PreToolUse",
  tool_name: "Edit",
  session_id: "no-grant",
  agent_id: null,
  cwd: "/repo",
  tool_input: { file_path: "/repo/force-app/main/default/classes/Foo.cls" },
});

// ===========================================================================
// 1. The default install. Nothing may change for a user who opted into nothing.
// ===========================================================================
describe("default install is inert", () => {
  test("both options default to false in the manifest", () => {
    expect(MANIFEST.userConfig.metadata_gate.default).toBe(false);
    expect(MANIFEST.userConfig.skill_telemetry.default).toBe(false);
  });

  test("with both flags unset, metadata edits produce zero denies", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await runScript("sfce-metadata-gate", "PreToolUse", editPayload);
      expect(r.code).toBe(0);
      expect(r.stdout.trim()).toBe("");
    }
    expect(readdirSync(state).length).toBe(0);
  });

  test("the self-check prints nothing at all when the gate is off", async () => {
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}");
    expect(r.code).toBe(0);
    expect(r.stdout.trim()).toBe("");
    expect(r.stderr.trim()).toBe("");
  });

  test("a 256KB payload with flags unset: exit 0, no stderr reaches the user", async () => {
    // Q7: a handler that exits before draining stdin triggers a broken pipe on
    // the writer. With the flags unset that is the path EVERY install takes on
    // every Edit, so a regression here is felt by everyone who installed and
    // enabled nothing.
    const big = JSON.stringify({
      hook_event_name: "PreToolUse",
      tool_name: "Edit",
      tool_input: { file_path: "/repo/a.cls", content: "x".repeat(262_144) },
    });
    expect(big.length).toBeGreaterThan(262_144);
    for (const s of ["sfce-metadata-gate", "sfce-skill-observer", "sfce-bash-observer"]) {
      const r = await runScript(s, "PreToolUse", big);
      expect(r.code, `${s} must exit 0`).toBe(0);
      expect(r.stderr.trim(), `${s} must be silent`).toBe("");
    }
  });
});

// ===========================================================================
// 2. Opting in actually does something.
// ===========================================================================
describe("opting in", () => {
  test("gate on + enforce: an unauthorised metadata edit is denied", async () => {
    const r = await runScript("sfce-metadata-gate", "PreToolUse", editPayload, {
      SFCE_GATE_ENABLED: "1",
      SFCE_GATE_ENFORCE: "1",
    });
    expect(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  test("the plugin-option env name enables the gate too", async () => {
    // Without this the userConfig toggle would be decorative: the scripts read
    // SFCE_ names, and a user flipping the option in /plugin configure would
    // see no change whatsoever.
    const r = await runScript("sfce-metadata-gate", "PreToolUse", editPayload, {
      CLAUDE_PLUGIN_OPTION_METADATA_GATE: "1",
      SFCE_GATE_ENFORCE: "1",
    });
    expect(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  test("the plugin-option env name enables telemetry too", async () => {
    const skillPayload = JSON.stringify({
      hook_event_name: "PostToolUse",
      tool_name: "Skill",
      session_id: "s1",
      agent_id: null,
      cwd: "/repo",
      tool_input: { skill: "sf-compound-engineering:sf-work" },
    });
    await runScript("sfce-skill-observer", "PostToolUse", skillPayload, {
      CLAUDE_PLUGIN_OPTION_SKILL_TELEMETRY: "1",
    });
    expect(existsSync(join(state, "telemetry"))).toBe(true);
  });
});

// ===========================================================================
// 3. The self-check proves the gate DENIES, not merely that it parsed.
// ===========================================================================
describe("self-check", () => {
  function sandboxPlugin(): string {
    const root = join(state, "plugin");
    mkdirSync(join(root, "scripts"), { recursive: true });
    mkdirSync(join(root, "hooks"), { recursive: true });
    for (const s of ["sfce-metadata-gate", "sfce-gate-selfcheck"]) {
      cpSync(join(REPO_ROOT, "scripts", s), join(root, "scripts", s));
      chmodSync(join(root, "scripts", s), 0o755);
    }
    for (const f of ["authoring-skills.txt", "metadata-path-routing.txt"]) {
      cpSync(join(REPO_ROOT, "hooks", f), join(root, "hooks", f));
    }
    return root;
  }

  test("a healthy gate reports enabled with no warnings", async () => {
    const root = sandboxPlugin();
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("ENABLED");
    expect(r.stdout).not.toContain("WARNING");
  });

  test("a non-executable gate script is caught", async () => {
    const root = sandboxPlugin();
    chmodSync(join(root, "scripts", "sfce-metadata-gate"), 0o644);
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(r.stdout).toContain("not executable");
    expect(r.stdout).toContain("ungated");
  });

  test("a gate that no longer denies is caught", async () => {
    // The check that matters. Asserting the script merely parsed would pass
    // here: this gate runs fine, it just never denies anything.
    const root = sandboxPlugin();
    const p = join(root, "scripts", "sfce-metadata-gate");
    writeFileSync(p, `#!/bin/bash\ncat >/dev/null\nexit 0\n`);
    chmodSync(p, 0o755);
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(r.stdout).toContain("did NOT deny");
    expect(r.stdout).toContain("loaded but not enforcing");
  });

  test("a self-check run leaves telemetry and grant state byte-identical", async () => {
    // A real run would inject a synthetic event every session, corrupting the
    // counts U7 reports AND satisfying U7's own inert-gate warning.
    const root = sandboxPlugin();
    mkdirSync(join(state, "telemetry"), { recursive: true });
    mkdirSync(join(state, "gate", "grants"), { recursive: true });
    writeFileSync(join(state, "telemetry", "skills-2026-01-01.jsonl"), "{}\n");
    writeFileSync(join(state, "gate", "grants", "keep"), "v=1\nexpires=1\n");

    const snapshot = (): string => {
      const walk = (d: string): string[] =>
        readdirSync(d, { withFileTypes: true }).flatMap((e) =>
          e.isDirectory() ? walk(join(d, e.name))
            : [`${join(d, e.name)}:${readFileSync(join(d, e.name), "utf-8")}`]);
      return walk(join(state, "telemetry")).concat(walk(join(state, "gate"))).sort().join("|");
    };
    const before = snapshot();
    await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(snapshot()).toBe(before);
  });

  test("the override prints an unmissable line", async () => {
    const root = sandboxPlugin();
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1", SFCE_GATE_OVERRIDE: "1" }, root);
    expect(r.stdout).toContain("ENFORCEMENT IS OFF FOR THIS SESSION");
  });

  test("it prints the enforcement-input digest, and the digest moves when an input changes", async () => {
    const root = sandboxPlugin();
    const read = async () => {
      const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
        { SFCE_GATE_ENABLED: "1" }, root);
      return /enforcement inputs digest: (\w+)/.exec(r.stdout)?.[1];
    };
    const first = await read();
    expect(first).toBeTruthy();
    writeFileSync(join(root, "hooks", "authoring-skills.txt"), "sf-work\nsf-evil\n");
    expect(await read()).not.toBe(first);
  });

  test("it reports the gate-audit summary so the record reaches a human", async () => {
    const root = sandboxPlugin();
    mkdirSync(join(state, "gate"), { recursive: true });
    writeFileSync(
      join(state, "gate", "audit.jsonl"),
      [
        JSON.stringify({ v: 1, event: "gate_decision", decision: "override", call: "x1" }),
        JSON.stringify({ v: 1, event: "bash_bypass", class: "heredoc" }),
        // Landed with no matching decision: a genuine inert-gate event.
        JSON.stringify({ v: 1, event: "gate_decision", decision: "edit_landed", call: "x2" }),
      ].join("\n") + "\n",
    );
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(r.stdout).toContain("gate audit since install");
    expect(r.stdout).toMatch(/overrides 1/);
    expect(r.stdout).toMatch(/shell bypasses 1/);
    expect(r.stdout).toMatch(/no decision row 1/);
  });

  test("an overridden edit is not reported as missing a decision", async () => {
    // The mirror of the reporter bug: an override IS a decision, and excluding
    // it raised a false alarm on the summary a human is meant to trust.
    const root = sandboxPlugin();
    mkdirSync(join(state, "gate"), { recursive: true });
    writeFileSync(
      join(state, "gate", "audit.jsonl"),
      [
        JSON.stringify({ v: 1, event: "gate_decision", decision: "override", call: "y1" }),
        JSON.stringify({ v: 1, event: "gate_decision", decision: "edit_landed", call: "y1" }),
      ].join("\n") + "\n",
    );
    const r = await runScript("sfce-gate-selfcheck", "SessionStart", "{}",
      { SFCE_GATE_ENABLED: "1" }, root);
    expect(r.stdout).toMatch(/no decision row 0/);
  });
});

// ===========================================================================
// 4. The registration itself.
// ===========================================================================
describe("hooks.json registration", () => {
  const allHandlers = () =>
    Object.entries(HOOKS.hooks).flatMap(([event, groups]: [string, any]) =>
      groups.flatMap((g: any) => g.hooks.map((h: any) => ({ event, matcher: g.matcher, ...h }))));

  test("every handler declares a timeout of 10 seconds or less", () => {
    // The default is 600s, and a timed-out gate fails open -- so a long timeout
    // buys nothing and costs a ten-minute stall on a single edit.
    for (const h of allHandlers()) {
      expect(h.timeout, `${h.event} handler has no timeout`).toBeDefined();
      expect(h.timeout, `${h.event} timeout ${h.timeout} is too long`).toBeLessThanOrEqual(10);
    }
  });

  test("the primer handler group is untouched", () => {
    const primer = HOOKS.hooks.SessionStart[0];
    expect(primer.matcher).toBe("startup");
    expect(primer.hooks[0].command).toContain("scripts/session-start");
    expect(primer.hooks[0].timeout).toBe(10);
  });

  test("revocation is matched on clear|resume only", () => {
    // KTD4: an allowlist, not a denylist. "Any source except startup" would
    // catch compact, which is the long run this design exists to protect.
    const group = HOOKS.hooks.SessionStart.find((g: any) => g.matcher === "clear|resume");
    expect(group).toBeDefined();
    expect(group.hooks[0].command).toContain("sfce-skill-observer");
  });

  test("the deny matcher is narrow: no Bash, no MultiEdit", () => {
    const pre = HOOKS.hooks.PreToolUse;
    expect(pre.length).toBe(1);
    expect(pre[0].matcher).toBe("Edit|Write|NotebookEdit");
    expect(pre[0].matcher).not.toContain("Bash");
    expect(pre[0].matcher).not.toContain("MultiEdit");
  });

  test("both skill-entry paths are registered", () => {
    // Either alone loses an entire entry path (U1).
    const post = HOOKS.hooks.PostToolUse.find((g: any) => g.matcher === "Skill");
    expect(post).toBeDefined();
    expect(HOOKS.hooks.UserPromptExpansion).toBeDefined();
    expect(HOOKS.hooks.UserPromptExpansion[0].hooks[0].command)
      .toContain("sfce-skill-observer");
  });

  test("every referenced script exists and is executable", () => {
    for (const h of allHandlers()) {
      const m = /\/scripts\/([a-z-]+)"/.exec(h.command);
      expect(m, `cannot parse command: ${h.command}`).toBeTruthy();
      const p = join(REPO_ROOT, "scripts", m![1] as string);
      expect(existsSync(p), `${m![1]} missing`).toBe(true);
      expect(statSync(p).mode & 0o111, `${m![1]} not executable`).toBeGreaterThan(0);
    }
  });

  test("the plugin-root placeholder is quoted, so a path with spaces survives", () => {
    // This repository lives under "Manual Library" — an unquoted placeholder
    // would split on the space and every handler would fail to launch.
    for (const h of allHandlers()) {
      expect(h.command, h.command).toContain('"${CLAUDE_PLUGIN_ROOT}');
    }
  });
});

// ===========================================================================
// 5. The manifest.
// ===========================================================================
describe("userConfig manifest", () => {
  test("every option declares a title", () => {
    // U1 proved by controlled A/B that an option without `title` makes the
    // ENTIRE plugin fail to load: every skill becomes "Unknown command", with
    // no validation error and no warning.
    for (const [key, opt] of Object.entries<any>(MANIFEST.userConfig)) {
      expect(opt.title, `${key} has no title — this silently breaks the plugin`).toBeTruthy();
      expect(typeof opt.title).toBe("string");
    }
  });

  test("the gate option renders the threat-model block verbatim", () => {
    const d = MANIFEST.userConfig.metadata_gate.description as string;
    for (const phrase of [
      "absence of a deny is never evidence of authorisation",
      "with your full user permissions and no sandbox",
      "can bypass this gate at any time",
      "MCP writes and org deploys are ungated",
      "Symlinked paths defeat a shape-only predicate",
      "Enforcement exists on Claude Code only",
    ]) {
      expect(d, `threat-model clause missing: ${phrase}`).toContain(phrase);
    }
  });

  test("the telemetry option states the local-only guarantee", () => {
    const d = MANIFEST.userConfig.skill_telemetry.description as string;
    expect(d).toContain("Nothing leaves your machine");
    expect(d).toContain("never prompt text");
  });
});

// ===========================================================================
// 6. Executable bits on everything shipped.
// ===========================================================================
describe("shipped scripts", () => {
  test("every shipped script has the executable bit set", () => {
    for (const s of SHIPPED_SCRIPTS) {
      const p = join(REPO_ROOT, "scripts", s);
      expect(existsSync(p), `${s} missing`).toBe(true);
      expect(statSync(p).mode & 0o111, `${s} is not executable`).toBeGreaterThan(0);
    }
  });
});
