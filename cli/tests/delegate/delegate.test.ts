import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const DELEGATE = join(REPO_ROOT, "scripts", "sfce-delegate");

const EXIT_OK = 0;
const EXIT_ERROR = 1;
const EXIT_USAGE = 2;
const EXIT_DECLINED = 3;

/**
 * scripts/sfce-delegate — the cheap-worker delegation tier.
 *
 * WHY THESE TESTS RUN AGAINST A LOOPBACK MOCK RATHER THAN BEING SKIPPED.
 *
 * The obvious shape for a test suite over a script that calls an API is "skip
 * unless a key is present", and that shape is how the skill-triggering eval
 * spent a release asserting nothing. Everything here that does not need a model
 * is tested without one: the gates, the fence stripping, the token reporting,
 * the exit-code contract, and the full happy path. Only the QUALITY of a real
 * worker's output needs a real key, and that is stated as an open dependency
 * rather than mocked and called done.
 *
 * The mock is reachable only because the script constrains SFCE_WORKER_API_BASE
 * to the real Anthropic endpoint or loopback. That constraint is itself tested
 * below: a free-form endpoint override would turn an env var into a way to ship
 * a repository's source to a third party.
 */

// --- loopback mock worker --------------------------------------------------

let server: ReturnType<typeof Bun.serve>;
let base = "";
let lastRequest: any = null;
// What the next call returns. Set per test.
let nextBody: unknown = null;
let nextStatus = 200;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    async fetch(req) {
      lastRequest = await req.json().catch(() => null);
      return new Response(JSON.stringify(nextBody), {
        status: nextStatus,
        headers: { "content-type": "application/json" },
      });
    },
  });
  base = `http://127.0.0.1:${server.port}`;
});

afterAll(() => server?.stop(true));

const okResponse = (text: string, inTok = 1234, outTok = 567) => ({
  id: "msg_test",
  type: "message",
  model: "claude-haiku-4-5-20251001",
  content: [{ type: "text", text }],
  usage: { input_tokens: inTok, output_tokens: outTok },
});

// --- harness ---------------------------------------------------------------

interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

let workdir = "";

function scratch(): string {
  workdir = mkdtempSync(join(tmpdir(), "sfce-delegate-test-"));
  return workdir;
}

/**
 * ASYNC ON PURPOSE. An earlier version used Bun.spawnSync, and every test that
 * reached the mock hung for the full curl timeout: spawnSync BLOCKS Bun's event
 * loop, so the in-process Bun.serve could never answer the request curl had
 * already sent. The symptom was a 120s-per-test stall with no error, which
 * reads like a network problem rather than a test-harness one.
 */
async function run(args: string[], env: Record<string, string | undefined> = {}): Promise<RunResult> {
  // Start from a deliberately clean environment. Inheriting the developer's
  // real ANTHROPIC_API_KEY would make the "no key declines" test pass or fail
  // depending on whose machine it ran on, and would send a live request from a
  // unit test.
  const baseEnv: Record<string, string> = {
    PATH: process.env.PATH ?? "",
    HOME: workdir || tmpdir(),
    TMPDIR: workdir || tmpdir(),
  };
  const merged: Record<string, string> = { ...baseEnv };
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) merged[k] = v;
  }
  const proc = Bun.spawn([DELEGATE, ...args], {
    env: merged,
    cwd: REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

// A reference and a spec that are deliberately free of every excluded term, so
// the happy path exercises the pipeline rather than the denylist.
const CLEAN_REFERENCE = `# TestDataFactory pattern

public class TestDataFactory {
    public static List<Account> makeAccounts(Integer count) {
        List<Account> out = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            out.add(new Account(Name = 'Acct ' + i));
        }
        return out;
    }
}
`;

const CLEAN_SPEC = `Generate a TestDataFactory with makeAccounts, makeContacts and
makeOpportunities. Follow the reference shape exactly. Bulk-capable collections,
no inserts.
`;

function fixtures(overrides: { spec?: string; reference?: string } = {}) {
  const dir = scratch();
  const spec = join(dir, "spec.md");
  const ref = join(dir, "reference.md");
  const out = join(dir, "TestDataFactory.cls");
  writeFileSync(spec, overrides.spec ?? CLEAN_SPEC);
  writeFileSync(ref, overrides.reference ?? CLEAN_REFERENCE);
  return { dir, spec, ref, out };
}

const liveEnv = (extra: Record<string, string | undefined> = {}) => ({
  ANTHROPIC_API_KEY: "sk-ant-test-not-a-real-key",
  SFCE_WORKER_API_BASE: base,
  ...extra,
});

// --- (a) the happy path: a boilerplate generation lands correct code -------

describe("acceptance (a): a boilerplate generation runs via the worker and lands code", () => {
  const GENERATED = `public class TestDataFactory {
    public static List<Account> makeAccounts(Integer count) {
        List<Account> out = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            out.add(new Account(Name = 'Acct ' + i));
        }
        return out;
    }
}`;

  test("writes the worker's code to --out and nothing else to stdout", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse(GENERATED);

    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--kind", "test-factory", "--expect-lines", "60"],
      liveEnv(),
    );

    expect(r.code).toBe(EXIT_OK);
    expect(readFileSync(f.out, "utf-8")).toContain("public class TestDataFactory");
    expect(readFileSync(f.out, "utf-8")).toContain("makeAccounts");

    // THE POINT OF THE WHOLE TIER. stdout is the path, not the code. If the
    // generated source came back on stdout it would land in the calling
    // session's context and the saving would be zero.
    expect(r.stdout.trim()).toBe(f.out);
    expect(r.stdout).not.toContain("public class");
  });

  test("the worker receives the spec AND the reference", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse(GENERATED);
    await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());

    const content = lastRequest?.messages?.[0]?.content ?? "";
    expect(content).toContain("makeOpportunities");        // from the spec
    expect(content).toContain("TestDataFactory pattern");  // from the reference
  });

  test("the file ends with a newline even when the worker omits one", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(readFileSync(f.out, "utf-8").endsWith("\n")).toBe(true);
  });
});

// --- (b) token counts are reported ----------------------------------------

describe("acceptance (b): token deltas are reported to stderr", () => {
  test("input and output token counts appear on stderr", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}", 4321, 890);
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());

    expect(r.stderr).toContain("input_tokens=4321");
    expect(r.stderr).toContain("output_tokens=890");
    // The number that justifies the tier: output tokens that never reached the
    // orchestrator. Reported explicitly so the saving is visible, not implied.
    expect(r.stderr).toContain("890 output tokens did NOT enter the caller context");
  });

  test("token reporting goes to stderr, never stdout", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}", 11, 22);
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.stdout).not.toContain("input_tokens");
  });
});

// --- (c) the threshold and the exclusions ---------------------------------

describe("acceptance (c): the size threshold is enforced", () => {
  test("below the threshold it declines rather than delegating", async () => {
    const f = fixtures();
    nextBody = okResponse("public class A {}");
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "10"],
      liveEnv(),
    );
    expect(r.code).toBe(EXIT_DECLINED);
    expect(r.stderr).toContain("below the 40-line threshold");
  });

  test("the threshold is configurable", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "10"],
      liveEnv({ SFCE_DELEGATE_MIN_LINES: "5" }),
    );
    expect(r.code).toBe(EXIT_OK);
  });

  test("a declined job writes no output file", async () => {
    // A decline that left a partial or stale file behind would be worse than an
    // error: the caller would find a file and assume it was generated.
    const f = fixtures();
    await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "1"], liveEnv());
    expect(() => statSync(f.out)).toThrow();
  });
});

describe("acceptance (c): excluded topics are refused", () => {
  // The whole safety argument of the tier. Each of these must never reach a
  // cheap worker, and the denylist is deliberately over-broad because the
  // failure costs are asymmetric: a false refusal costs one round-trip, a false
  // accept ships security logic written by a weak model.
  const EXCLUDED_SPECS: Array<[string, string]> = [
    ["sharing model", "Generate a service class declared with sharing that respects the sharing model."],
    ["CRUD/FLS", "Generate a selector that performs a CRUD check before querying."],
    ["field-level security", "Add field-level security enforcement to the accessor."],
    ["stripInaccessible", "Use Security.stripInaccessible on the result set."],
    ["USER_MODE", "Query the records WITH USER_MODE and return them."],
    ["permission set", "Generate the matching permission set metadata for the fields."],
    ["governor limits", "Rework the loop so it respects governor limits on SOQL."],
    ["callouts", "Generate a service that performs an HTTP callout to the billing API."],
    ["named credentials", "Wire the request through a Named Credential."],
    ["secrets", "Read the API key from a protected custom setting."],
    ["SOQL injection", "Escape the input with String.escapeSingleQuotes before building the query."],
    ["debugging", "Reproduce the bug and identify the root cause of the null pointer."],
  ];

  for (const [label, specText] of EXCLUDED_SPECS) {
    test(`refuses: ${label}`, async () => {
      const f = fixtures({ spec: specText });
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100"],
        liveEnv(),
      );
      expect(r.code).toBe(EXIT_DECLINED);
      expect(r.stderr).toContain("excluded topic");
      expect(() => statSync(f.out)).toThrow();
    });
  }

  test("an excluded term in a REFERENCE is caught, not just in the spec", async () => {
    // The bug this replaced: the scan accumulated reference text inside a
    // `| while` loop, so every assignment was lost with the subshell and only
    // the spec was ever scanned. A clean-looking spec pointing at a reference
    // full of sharing logic sailed straight through.
    const f = fixtures({
      spec: "Generate a plain data holder class following the reference.",
      reference: "public with sharing class Example { /* stripInaccessible usage */ }",
    });
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100"],
      liveEnv(),
    );
    expect(r.code).toBe(EXIT_DECLINED);
    expect(r.stderr).toContain("excluded topic");
  });

  test("the exclusion scan is case-insensitive", async () => {
    const f = fixtures({ spec: "Generate a class that enforces FIELD-LEVEL SECURITY." });
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100"],
      liveEnv(),
    );
    expect(r.code).toBe(EXIT_DECLINED);
  });

  test("exclusions are checked BEFORE the network call", async () => {
    // An excluded spec must never leave the machine. Checking after the call
    // would mean the sensitive text had already been sent.
    const f = fixtures({ spec: "Enforce CRUD and sharing on every query." });
    lastRequest = null;
    await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100"], liveEnv());
    expect(lastRequest).toBeNull();
  });

  test("the worker's own DELEGATION_REFUSED is honoured as a decline", async () => {
    // A second, independent chance to catch what the keyword denylist missed.
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("DELEGATION_REFUSED");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_DECLINED);
    expect(r.stderr).toContain("the worker refused");
    expect(() => statSync(f.out)).toThrow();
  });
});

// --- (d) clean fallbacks ---------------------------------------------------

describe("acceptance (d): every missing prerequisite declines cleanly", () => {
  test("no ANTHROPIC_API_KEY declines, and is not an error", async () => {
    // The normal state for most installs. It must be exit 3 and never 1, or
    // every caller would have to special-case the common path.
    const f = fixtures();
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      { SFCE_WORKER_API_BASE: base },
    );
    expect(r.code).toBe(EXIT_DECLINED);
    expect(r.stderr).toContain("ANTHROPIC_API_KEY is not set");
  });

  test("unset SFCE_WORKER_MODEL falls back to the Haiku-class default", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_OK);
    expect(lastRequest?.model).toBe("claude-haiku-4-5-20251001");
  });

  test("a set SFCE_WORKER_MODEL is used", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      liveEnv({ SFCE_WORKER_MODEL: "claude-sonnet-5" }),
    );
    expect(lastRequest?.model).toBe("claude-sonnet-5");
  });

  test("an EMPTY SFCE_WORKER_MODEL is treated as unset, not sent as a model name", async () => {
    // `export SFCE_WORKER_MODEL=` is a plausible mistake. Treating it as unset
    // is kinder than sending an empty model name and surfacing whatever the API
    // says about it.
    //
    // This test originally asserted a DECLINE, and finding out why it failed is
    // what removed a dead branch from the script: `${VAR:-default}` substitutes
    // the default for set-but-empty too, so the empty-value check below it could
    // never fire and only read as though the case were handled.
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      liveEnv({ SFCE_WORKER_MODEL: "" }),
    );
    expect(r.code).toBe(EXIT_OK);
    expect(lastRequest?.model).toBe("claude-haiku-4-5-20251001");
  });

  test("no --reference declines: an unreferenced generation is not pattern-matching", async () => {
    const f = fixtures();
    const r = await run(["--spec", f.spec, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_DECLINED);
    expect(r.stderr).toContain("no --reference given");
  });

  test("--dry-run runs every gate and makes no network call", async () => {
    const f = fixtures();
    lastRequest = null;
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60", "--dry-run"],
      liveEnv(),
    );
    expect(r.code).toBe(EXIT_OK);
    expect(r.stderr).toContain("no network call was made");
    expect(lastRequest).toBeNull();
    expect(() => statSync(f.out)).toThrow();
  });
});

// --- endpoint constraint ---------------------------------------------------

describe("the endpoint override cannot point anywhere", () => {
  test("a non-loopback, non-Anthropic endpoint is refused", async () => {
    // The test seam must not double as an exfiltration path: this script is
    // handed the repository's own source as reference material.
    const f = fixtures();
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      liveEnv({ SFCE_WORKER_API_BASE: "https://evil.example.com" }),
    );
    // ERROR, not DECLINED: a bad endpoint is a misconfiguration to stop on.
    // Declining would silently fall back to inline work and hide it.
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("must be https://api.anthropic.com or a loopback address");
  });

  test("http to a non-loopback host is refused too", async () => {
    const f = fixtures();
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      liveEnv({ SFCE_WORKER_API_BASE: "http://192.168.1.50:8080" }),
    );
    expect(r.code).toBe(EXIT_ERROR);
  });
});

// --- response handling -----------------------------------------------------

describe("response handling", () => {
  test("an outer markdown fence is stripped", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("```apex\npublic class Fenced {}\n```");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_OK);
    const written = readFileSync(f.out, "utf-8");
    expect(written).toBe("public class Fenced {}\n");
    expect(written).not.toContain("```");
  });

  test("a bare fence with no language tag is stripped", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("```\npublic class Bare {}\n```");
    await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(readFileSync(f.out, "utf-8")).toBe("public class Bare {}\n");
  });

  test("prose mixed with fenced code is REFUSED, not partially written", async () => {
    // The dangerous middle case. A response that explains itself around a code
    // block is not a file, and writing the fenced part would silently drop
    // whatever the prose said mattered.
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("Here is the class:\n\n```apex\npublic class A {}\n```\n\nNote: incomplete.");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("mixes prose and fenced code");
    expect(() => statSync(f.out)).toThrow();
  });

  test("an empty response is an error, not an empty file", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("   \n  ");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(() => statSync(f.out)).toThrow();
  });

  test("an API error payload is surfaced", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = { type: "error", error: { type: "overloaded_error", message: "server overloaded" } };
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("server overloaded");
  });

  test("HTTP 429 is an error naming rate limiting", async () => {
    const f = fixtures();
    nextStatus = 429;
    nextBody = { type: "error", error: { type: "rate_limit_error", message: "slow down" } };
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("rate limited");
  });

  test("HTTP 401 names the credentials rather than the network", async () => {
    const f = fixtures();
    nextStatus = 401;
    nextBody = { type: "error", error: { type: "authentication_error", message: "bad key" } };
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("credentials");
  });
});

// --- usage contract --------------------------------------------------------

describe("usage errors are distinct from declines", () => {
  test("a missing --spec is a usage error", async () => {
    scratch();
    expect((await run(["--out", "/tmp/x.cls"], liveEnv())).code).toBe(EXIT_USAGE);
  });

  test("a missing --out is a usage error", async () => {
    const f = fixtures();
    expect((await run(["--spec", f.spec, "--reference", f.ref], liveEnv())).code).toBe(EXIT_USAGE);
  });

  test("an unreadable spec is a usage error, not a decline", async () => {
    scratch();
    const r = await run(["--spec", join(workdir, "nope.md"), "--reference", "/etc/hosts", "--out", "/tmp/x.cls"], liveEnv());
    expect(r.code).toBe(EXIT_USAGE);
  });

  test("an unknown --kind is a usage error", async () => {
    const f = fixtures();
    expect((await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--kind", "nonsense"], liveEnv())).code)
      .toBe(EXIT_USAGE);
  });

  test("a non-numeric --expect-lines is a usage error", async () => {
    const f = fixtures();
    expect((await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "lots"], liveEnv())).code)
      .toBe(EXIT_USAGE);
  });
});

// --- the quoting trap that cost real time ---------------------------------

describe("the script's own quoting stays sound", () => {
  test("no apostrophe appears inside a python3 -c '...' block", async () => {
    // A single apostrophe inside `python3 -c '...'` closes the shell quote and
    // bash then parses the python source as shell. The syntax error surfaces
    // dozens of lines below the real cause, which is what made it expensive:
    // the reported line had nothing wrong with it.
    const body = readFileSync(DELEGATE, "utf-8");
    const lines = body.split("\n");
    let inBlock = false;
    const offenders: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (!inBlock && /python3 -I -c '$/.test(line)) {
        inBlock = true;
        continue;
      }
      if (inBlock) {
        if (/^'/.test(line)) {
          inBlock = false;
          continue;
        }
        if (line.includes("'")) offenders.push(`${i + 1}: ${line.trim()}`);
      }
    }
    expect(offenders, `apostrophe inside a python -c block:\n${offenders.join("\n")}`).toEqual([]);
    expect(inBlock, "a python3 -c block was never closed").toBe(false);
  });

  test("the script parses under macOS system bash 3.2 constructs", async () => {
    // No mapfile, no associative arrays, no ${x,,} case modification. Every
    // other script here holds this line and the delegate runs in the same
    // places.
    //
    // Comment lines are stripped first. Without that, this test failed on the
    // script's own comment EXPLAINING why ${x,,} is avoided -- a check that
    // forbids naming the thing it forbids is a check that cannot be documented.
    const code = readFileSync(DELEGATE, "utf-8")
      .split("\n")
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");
    expect(code).not.toMatch(/\bmapfile\b/);
    expect(code).not.toMatch(/\bdeclare\s+-A\b/);
    expect(code).not.toMatch(/\$\{[A-Za-z_][A-Za-z0-9_]*,,\}/);
    expect(code).not.toMatch(/\$\{[A-Za-z_][A-Za-z0-9_]*\^\^\}/);
  });
});
