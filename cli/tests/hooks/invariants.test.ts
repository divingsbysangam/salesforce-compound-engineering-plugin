import { describe, expect, test } from "bun:test";
import { lstatSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { extname, join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SCRIPTS = join(REPO_ROOT, "scripts");
const FIXTURES = join(REPO_ROOT, "cli", "tests", "hooks", "fixtures");
const HOOKS_JSON = join(REPO_ROOT, "hooks", "hooks.json");

const HOOK_SCRIPTS = [
  "sfce-metadata-gate",
  "sfce-skill-observer",
  "sfce-bash-observer",
  "sfce-gate-selfcheck",
];
const ALL_SHIPPED = [...HOOK_SCRIPTS, "skill-usage", "session-start"];

/**
 * THREAT MODEL FOR THE NO-NETWORK INVARIANT
 *
 * The property: nothing a hook runs, and nothing else under scripts/ except the
 * files named below, can reach the network. Hooks run on every matched tool
 * call, before permission resolution, with the user's full rights and no
 * sandbox, so a network-capable hook is a way to move a repository's contents
 * off the machine without anyone having asked for it.
 *
 * What the test does to hold that property:
 *   - walks scripts/ RECURSIVELY, every regular file whatever its extension
 *     (.py and .mjs included), so a helper in a subdirectory or a new language
 *     is covered on arrival rather than when someone remembers to list it;
 *   - FAILS on any symlink under scripts/. A link can point outside the scanned
 *     tree, so scanning its target would scan the wrong thing and skipping it
 *     would exempt it. Refusing links is simpler and stricter than resolving;
 *   - reads hooks/hooks.json and requires every hook command to be exactly a
 *     scanned, non-exempt script plus bare-word arguments, so a hook cannot run
 *     an inline command, a file outside scripts/, or an exempt script;
 *   - skips only WHOLE-LINE comments. A comment cannot execute; a trailing
 *     comment on a code line is still scanned.
 *
 * What it does NOT catch: this is a pattern scan, not an interpreter. Deliberate
 * obfuscation (a command name assembled from pieces, eval of decoded text),
 * DNS side channels via ordinary tools (dig, nslookup, ping), and handing a URL
 * to the OS (open, osascript) are out of reach. It defends against a well-meant
 * edit that quietly adds a network call, not against a hostile author -- a
 * hostile author already controls the hook.
 *
 * EXEMPTIONS ARE EXACT-NAME AND WHOLE-FILE. A path in NETWORK_PERMITTED is
 * matched by its full path relative to scripts/, never by prefix or glob, and
 * the whole file is skipped, because a per-line allowance would have to be
 * re-reviewed on every edit to the file and a pattern exemption silently covers
 * whatever is added next. Whole-file means the exempt file's OWN safety has to
 * be tested behaviourally elsewhere, which is why the endpoint test below runs
 * the delegate rather than grepping it for strings. Adding an entry is a
 * threat-model change, not a convenience.
 */
const NETWORK_PERMITTED: Record<string, string> = {
  // The cheap-worker tier. Its entire purpose is one API call, to Anthropic or
  // loopback only; that constraint is tested by running it, below and in
  // cli/tests/delegate/delegate.test.ts ("the endpoint override cannot point
  // anywhere").
  "sfce-delegate": "opt-in delegation tier; never run by a hook",
  // CI-only release check (the Release check workflow): asks the public npm
  // registry which versions it serves. It sends nothing from the repository and
  // no hook or runtime path invokes it.
  "check-npm-release.mjs": "CI release check against the public npm registry; never run by a hook",
};

const BANNED: RegExp[] = [
  // command-line clients and raw sockets
  /\bcurl\b/, /\bwget\b/, /\bnc\b/, /\bncat\b/, /\bsocat\b/, /\btelnet\b/, /\bs_client\b/,
  /\/dev\/(tcp|udp)\//, /\bssh\b/, /\bscp\b/, /\brsync\b/,
  /\bgh\s+api\b/, /\bgit\s+(push|fetch|clone|pull|ls-remote)\b/,
  /\bnpm\s+(install|i|publish)\b/, /\bpip\s+install\b/,
  // python
  /urllib/, /http\.client/, /\bsocket\b/, /\bhttpx\b/, /\baiohttp\b/,
  /\bimport\s+requests\b/, /\bfrom\s+requests\b/, /\brequests\./,
  // node / bun
  /require\(\s*['"](node:)?(https?|http2|net|tls|dgram)['"]\s*\)/,
  /from\s+['"](node:)?(https?|http2|net|tls|dgram)['"]/,
  /fetch\s*\(/,
  // perl / ruby
  /IO::Socket/, /net\/http/,
  // a literal remote URL
  /https?:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?/i,
];

const JS_LIKE = new Set([".mjs", ".cjs", ".js", ".ts"]);

/** Drop whole-line comments only; code lines are scanned in full. */
function stripCommentLines(relPath: string, body: string): string {
  const isJs = JS_LIKE.has(extname(relPath));
  return body
    .split("\n")
    .filter((l) => (isJs ? !/^\s*(\/\/|\/\*|\*)/.test(l) : !/^\s*#/.test(l)))
    .join("\n");
}

interface ScriptTree {
  files: string[];
  symlinks: string[];
}

/** Every entry under scripts/, recursively, paths relative to scripts/. */
function walkScripts(dir = SCRIPTS, prefix = ""): ScriptTree {
  const out: ScriptTree = { files: [], symlinks: [] };
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const abs = join(dir, e.name);
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) out.symlinks.push(rel);
    else if (st.isDirectory()) {
      const sub = walkScripts(abs, rel);
      out.files.push(...sub.files);
      out.symlinks.push(...sub.symlinks);
    } else if (st.isFile()) out.files.push(rel);
  }
  out.files.sort();
  out.symlinks.sort();
  return out;
}

/** Every shipped file under scripts/, discovered rather than listed. */
const shippedScripts = (): string[] => walkScripts().files;

const read = (name: string) => readFileSync(join(SCRIPTS, name), "utf-8");

/** Every `command` string in hooks/hooks.json, however deeply nested. */
function hookCommands(): string[] {
  const found: string[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) node.forEach(visit);
    else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (k === "command" && typeof v === "string") found.push(v);
        else visit(v);
      }
    }
  };
  visit(JSON.parse(readFileSync(HOOKS_JSON, "utf-8")));
  return found;
}

// A hook command must be exactly a quoted plugin script plus bare-word args.
const HOOK_COMMAND_SHAPE = /^"\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/([A-Za-z0-9._\/-]+)"((?:\s+[A-Za-z0-9_-]+)*)$/;

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
    //
    // Enumerated, not listed. A hardcoded list silently exempts whatever is
    // added next, which is the failure mode that let a network-capable script
    // sit in scripts/ covered by nothing.
    for (const name of shippedScripts()) {
      if (Object.hasOwn(NETWORK_PERMITTED, name)) continue;
      const body = stripCommentLines(name, read(name));
      for (const pattern of BANNED) {
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

  test("the pattern list catches the constructs it claims to", () => {
    // A pattern that never matches is a pattern that silently stopped guarding.
    const probes = [
      "exec 3<>/dev/tcp/10.0.0.1/80", "echo x >/dev/udp/1.2.3.4/53", "x | nc host 80", "ncat host 80",
      "socat - TCP:host:80", "telnet host 80", "openssl s_client -connect host:443",
      "from socket import socket", "import httpx", "import aiohttp", "import requests as r",
      "node -e \"require('https').request(u)\"", "import https from 'node:https'",
      "git push origin", "gh api /repos", "perl -MIO::Socket::INET -e 1", "ruby -rnet/http -e 1",
      "curl -s x", "await fetch (u)",
    ];
    for (const p of probes) {
      expect(BANNED.some((r) => r.test(p)), `no pattern catches: ${p}`).toBe(true);
    }
  });

  test("scripts/ contains no symlinks", () => {
    // A link can point anywhere, so it is neither scanned nor exempted: it fails.
    expect(walkScripts().symlinks, "symlinks under scripts/ defeat the scan").toEqual([]);
  });

  test("no exemption is stale, and the enumeration actually sees the scripts", () => {
    // A stale exemption is an exemption nobody is reviewing: if sfce-delegate
    // were renamed, NETWORK_PERMITTED would keep exempting a name that no
    // longer exists while the new name went unchecked.
    const present = shippedScripts();
    for (const name of Object.keys(NETWORK_PERMITTED)) {
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

  test("every hook command runs a scanned, non-exempt script and nothing else", () => {
    const commands = hookCommands();
    expect(commands.length, "no hook commands found in hooks/hooks.json").toBeGreaterThan(0);
    const scanned = new Set(shippedScripts());
    for (const cmd of commands) {
      const m = HOOK_COMMAND_SHAPE.exec(cmd);
      expect(m, `hook command is not a plain plugin script invocation: ${cmd}`).not.toBeNull();
      const script = m![1]!;
      expect(scanned.has(script), `hook runs ${script}, which the no-network scan does not cover`).toBe(true);
      expect(
        Object.hasOwn(NETWORK_PERMITTED, script),
        `hook runs ${script}, which is exempt from the no-network scan`,
      ).toBe(false);
    }
  });

  test("no hook, and no non-exempt script, invokes an exempt script", () => {
    // Calling sfce-delegate from a hook would put a network round-trip on every
    // matched tool call and route the hook payload to a third party. The
    // no-network scan would still pass, because the hook itself would contain
    // no curl -- so the exempt NAMES are banned from everything that is scanned.
    const exempt = Object.keys(NETWORK_PERMITTED);
    for (const cmd of hookCommands()) {
      for (const name of exempt) expect(cmd, `a hook command references ${name}`).not.toContain(name);
    }
    for (const file of shippedScripts()) {
      if (Object.hasOwn(NETWORK_PERMITTED, file)) continue;
      const body = read(file);
      for (const name of exempt) expect(body, `${file} references ${name}`).not.toContain(name);
    }
  });

  test("the delegation tier refuses a non-Anthropic, non-loopback endpoint when run", async () => {
    // Behavioural, not a grep: the exemption above is whole-file, so the
    // endpoint constraint is only as good as what the script DOES. The full
    // matrix lives in cli/tests/delegate/delegate.test.ts under "the endpoint
    // override cannot point anywhere"; these are the cases that defeated the
    // original prefix-glob gate. --dry-run, so no request is made even if one
    // regressed.
    const dir = mkdtempSync(join(tmpdir(), "sfce-invariant-endpoint-"));
    const spec = join(dir, "spec.md");
    const ref = join(dir, "ref.md");
    writeFileSync(spec, "Generate a data holder class with three fields.\n");
    writeFileSync(ref, "public class Holder { public String name; }\n");
    const cases: Array<[string, number]> = [
      ["http://localhost:18081@evil.example:18081", 1],
      ["http://localhost:x@169.254.169.254", 1],
      ["http://127.0.0.1:80@attacker.example", 1],
      ["https://evil.example.com", 1],
      ["http://127.0.0.1:18081", 0],
    ];
    for (const [url, want] of cases) {
      const proc = Bun.spawn(
        [join(SCRIPTS, "sfce-delegate"), "--spec", spec, "--reference", ref, "--out", join(dir, "o.cls"),
          "--expect-lines", "60", "--dry-run"],
        {
          env: {
            PATH: process.env.PATH ?? "",
            HOME: dir,
            TMPDIR: dir,
            ANTHROPIC_API_KEY: ["offline", "fake", "key"].join("-"),
            SFCE_WORKER_API_BASE: url,
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const code = await proc.exited;
      expect(code, `endpoint ${url}: expected exit ${want}`).toBe(want);
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
