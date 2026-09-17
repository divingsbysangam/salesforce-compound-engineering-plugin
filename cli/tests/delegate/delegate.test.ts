import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
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

/**
 * Assembled at runtime rather than written as a literal: a string shaped like a
 * provider key in source trips secret scanners (plugin-scanner flags it as a
 * HARDCODED_SECRET), and this value is not a secret -- it only has to be a
 * non-empty string the mock can recognise.
 */
const OFFLINE_FAKE_KEY = ["offline", "fake", "key"].join("-");

let server: ReturnType<typeof Bun.serve>;
let base = "";
let lastRequest: any = null;
// Whether the last request carried the expected x-api-key header. A boolean,
// so a failing assertion never prints a header value.
let lastKeyHeaderMatched = false;
// What the next call returns. Set per test.
let nextBody: unknown = null;
let nextStatus = 200;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    async fetch(req) {
      lastKeyHeaderMatched = req.headers.get("x-api-key") === OFFLINE_FAKE_KEY;
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

const okResponse = (text: string, inTok = 1234, outTok = 567, stopReason: string | null = "end_turn") => ({
  id: "msg_test",
  type: "message",
  model: "claude-haiku-4-5-20251001",
  content: [{ type: "text", text }],
  stop_reason: stopReason,
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
async function run(
  args: string[],
  env: Record<string, string | undefined> = {},
  timeoutMs = 0,
): Promise<RunResult & { timedOut: boolean }> {
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
  // An optional kill timer, so a script that hangs fails its test instead of
  // stalling the whole suite.
  let timedOut = false;
  const timer = timeoutMs > 0
    ? setTimeout(() => {
        timedOut = true;
        proc.kill(9);
      }, timeoutMs)
    : null;
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (timer) clearTimeout(timer);
  return { code, stdout, stderr, timedOut };
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
  ANTHROPIC_API_KEY: OFFLINE_FAKE_KEY,
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

  test("whitespace inside a keyword does not slip past the scan", async () => {
    // Patterns are written with one space. Double spaces, tabs and a line break
    // between the words all used to pass the gate.
    for (const text of [
      "public with  sharing class Foo {}",
      "public with\tsharing class Foo {}",
      "public with\nsharing class Foo {}",
      "public without \t\n sharing class Foo {}",
      "Use field\nlevel  security on reads.",
    ]) {
      const f = fixtures({ reference: text });
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100", "--dry-run"],
        liveEnv(),
      );
      expect(r.code, `not refused: ${JSON.stringify(text)}`).toBe(EXIT_DECLINED);
      expect(r.stderr).toContain("excluded topic");
    }
  });

  const MORE_EXCLUDED: Array<[string, string]> = [
    ["dynamic query", "String q = 'SELECT Id FROM Account'; Database.query(q);"],
    ["raw HTTP", "HttpRequest req = new HttpRequest(); new Http().send(req);"],
    ["async enqueue", "System.enqueueJob(new Foo());"],
    ["session id", "UserInfo.getSessionId()"],
    ["user-mode DML", "insert as user acc;"],
    ["system mode", "Database.insert(recs, AccessLevel.SYSTEM_MODE);"],
    ["record access", "Organization-wide defaults and record access for the Account object"],
    ["permissions", "Implement the permissions check for the user"],
    ["passwords and tokens", "Store the password and token in a custom setting"],
    ["troubleshooting", "Troubleshoot the NullPointerException in the handler."],
    ["a fix request", "Fix the failing insert in the handler."],
    ["injection", "Guard the filter against injection."],
    ["PermissionSet metadata", "Assign the PermissionSet via PermissionSetAssignment"],
  ];

  for (const [label, text] of MORE_EXCLUDED) {
    test(`refuses: ${label}`, async () => {
      const f = fixtures({ spec: text });
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100", "--dry-run"],
        liveEnv(),
      );
      expect(r.code).toBe(EXIT_DECLINED);
      expect(r.stderr).toContain("excluded topic");
    });
  }

  test("the word-anchored stems do not refuse ordinary boilerplate wording", async () => {
    // " fix the" and " as user" are anchored to a word start so a factory spec
    // asking to prefix names, or saying an object has user lookups, still passes.
    const f = fixtures({
      spec: "Generate a TestDataFactory. Prefix the account names with Test, and the Case has user lookups.",
    });
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "100", "--dry-run"],
      liveEnv(),
    );
    expect(r.code).toBe(EXIT_OK);
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

  // THE BEHAVIOURAL CHECK the no-network invariant relies on for its one
  // exemption (cli/tests/hooks/invariants.test.ts). An earlier gate was a shell
  // glob, `http://localhost:*`, and every URL below matched it: curl reads the
  // part before `@` as userinfo and connects to the host AFTER it, carrying the
  // key, the spec and every reference. Each case runs with --dry-run, so even a
  // regression that accepted one would make no request.
  const REFUSED_ENDPOINTS: Array<[string, string]> = [
    ["userinfo smuggling a real host", "http://localhost:18081@evil.example:18081"],
    ["userinfo aimed at cloud metadata", "http://localhost:x@169.254.169.254"],
    ["a loopback-looking port as userinfo", "http://127.0.0.1:80@attacker.example"],
    ["a port that is really a hostname", "http://127.0.0.1:1.evil.com"],
    ["https to a host that is not Anthropic", "https://api.anthropic.com.evil.example"],
    ["https to Anthropic with userinfo", "https://x@api.anthropic.com"],
    ["https to loopback", "https://127.0.0.1:8443"],
    ["loopback with no explicit port", "http://127.0.0.1"],
    ["loopback with a path", "http://127.0.0.1:8080/proxy"],
    ["loopback with a query", "http://localhost:8080/?u=evil.example"],
    ["loopback with a fragment", "http://localhost:8080#frag"],
    ["an out-of-range port", "http://127.0.0.1:70000"],
    ["a backslash authority trick", "http://127.0.0.1:8080\\@evil.example"],
    ["trailing whitespace", "http://127.0.0.1:8080 "],
    ["an uppercase scheme variant", "HTTP://127.0.0.1:8080"],
  ];

  for (const [label, url] of REFUSED_ENDPOINTS) {
    test(`refuses ${label}`, async () => {
      const f = fixtures();
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60", "--dry-run"],
        liveEnv({ SFCE_WORKER_API_BASE: url }),
      );
      expect(r.code).toBe(EXIT_ERROR);
      expect(r.stderr).toContain("must be https://api.anthropic.com or a loopback address");
      expect(r.stderr).not.toContain("every gate passed");
    });
  }

  test("a valid loopback URL is accepted and rebuilt, with or without a trailing slash", async () => {
    for (const url of ["http://127.0.0.1:18081", "http://localhost:18081/"]) {
      const f = fixtures();
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60", "--dry-run"],
        liveEnv({ SFCE_WORKER_API_BASE: url }),
      );
      expect(r.code).toBe(EXIT_OK);
      expect(r.stderr).toContain("every gate passed");
      const host = url.includes("localhost") ? "localhost" : "127.0.0.1";
      expect(r.stderr).toContain(`endpoint:       http://${host}:18081/v1/messages`);
    }
  });

  test("the default Anthropic endpoint is accepted", async () => {
    const f = fixtures();
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60", "--dry-run"],
      liveEnv({ SFCE_WORKER_API_BASE: undefined }),
    );
    expect(r.code).toBe(EXIT_OK);
    expect(r.stderr).toContain("endpoint:       https://api.anthropic.com/v1/messages");
  });
});

// --- the key never reaches argv --------------------------------------------

describe("the API key is not exposed on the command line", () => {
  /**
   * A PATH-shimmed curl records its argv and its stdin, then fails. Anything in
   * argv is visible to every local user via `ps` for the life of the request.
   * Assertions are booleans over the recorded text, so a failure never prints
   * the key -- which is fake here anyway.
   */
  function shimCurl(dir: string) {
    const bin = join(dir, "shim-bin");
    mkdirSync(bin, { recursive: true });
    const shim = join(bin, "curl");
    writeFileSync(
      shim,
      [
        "#!/bin/sh",
        `for a in "$@"; do printf '%s\\n' "$a"; done > "${join(dir, "curl-argv.log")}"`,
        `cat > "${join(dir, "curl-stdin.log")}"`,
        "exit 7",
        "",
      ].join("\n"),
    );
    chmodSync(shim, 0o755);
    return { bin, argvLog: join(dir, "curl-argv.log"), stdinLog: join(dir, "curl-stdin.log") };
  }

  test("curl gets -q first, reads the key header from stdin, and never sees it in argv", async () => {
    const f = fixtures();
    const shim = shimCurl(f.dir);
    const r = await run(
      ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
      liveEnv({ PATH: `${shim.bin}:${process.env.PATH ?? ""}` }),
    );
    // The shim exits 7, so the script reports a request failure.
    expect(r.code).toBe(EXIT_ERROR);

    const argv = readFileSync(shim.argvLog, "utf-8").split("\n").filter(Boolean);
    // -q must be FIRST or curl has already read ~/.curlrc.
    expect(argv[0]).toBe("-q");
    expect(argv.includes("-K")).toBe(true);
    const keyInArgv = argv.some((a) => a.includes(OFFLINE_FAKE_KEY));
    expect(keyInArgv, "the API key appeared in curl's argv").toBe(false);
    expect(argv.some((a) => a.toLowerCase().includes("x-api-key")), "x-api-key header passed in argv").toBe(false);

    const stdin = readFileSync(shim.stdinLog, "utf-8");
    const keyOnStdin = stdin.includes(`header = "x-api-key: ${OFFLINE_FAKE_KEY}"`);
    expect(keyOnStdin, "the key header was not delivered on stdin").toBe(true);
  });

  test("the real curl delivers the header to the worker", async () => {
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {}");
    lastKeyHeaderMatched = false;
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_OK);
    expect(lastKeyHeaderMatched).toBe(true);
  });

  test("a key containing a quote or newline is refused before curl runs", async () => {
    // It is interpolated into a quoted curl config line; a quote or newline
    // would let the variable inject curl options.
    for (const bad of [`${OFFLINE_FAKE_KEY}"\nurl = "http://evil.example`, `${OFFLINE_FAKE_KEY} x`]) {
      const f = fixtures();
      const shim = shimCurl(f.dir);
      const r = await run(
        ["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"],
        liveEnv({ ANTHROPIC_API_KEY: bad, PATH: `${shim.bin}:${process.env.PATH ?? ""}` }),
      );
      expect(r.code).toBe(EXIT_ERROR);
      expect(r.stderr).toContain("cannot appear in an API key");
      expect(r.stderr.includes(OFFLINE_FAKE_KEY), "the refusal echoed the key").toBe(false);
      expect(() => statSync(shim.argvLog)).toThrow();
    }
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

  test("a max_tokens truncation is an error, and nothing is written", async () => {
    // A class cut off mid-method looks generated. Writing it as success hands
    // the caller a file that does not compile and says nothing about why.
    const f = fixtures();
    nextStatus = 200;
    nextBody = okResponse("public class A {\n    public static void x() {\n        Integer i =", 1, 8000, "max_tokens");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("stop_reason=max_tokens");
    expect(r.stdout).toBe("");
    expect(() => statSync(f.out)).toThrow();
  });

  for (const reason of ["stop_sequence", "tool_use", "pause_turn", "refusal", null]) {
    test(`stop_reason ${reason} is not a finished file`, async () => {
      const f = fixtures();
      nextStatus = 200;
      nextBody = okResponse("public class A {}", 1, 2, reason);
      const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
      expect(r.code).toBe(EXIT_ERROR);
      expect(r.stderr).toContain("the worker did not finish");
      expect(() => statSync(f.out)).toThrow();
    });
  }

  test("an existing --out survives a truncated response", async () => {
    const f = fixtures();
    writeFileSync(f.out, "PRECIOUS EXISTING CONTENT\n");
    nextStatus = 200;
    nextBody = okResponse("public class A {", 1, 8000, "max_tokens");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(readFileSync(f.out, "utf-8")).toBe("PRECIOUS EXISTING CONTENT\n");
  });

  test("an existing --out survives a write that fails part-way, and no temp file is left", async () => {
    // A lone surrogate decodes from JSON but cannot be encoded as UTF-8, so the
    // failure happens AT write time. Opening --out with "w" had already
    // truncated it by then, leaving an empty file where the old one was.
    const f = fixtures();
    writeFileSync(f.out, "PRECIOUS EXISTING CONTENT\n");
    nextStatus = 200;
    nextBody = okResponse("public class A { \ud800 }");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_ERROR);
    expect(r.stderr).toContain("could not write");
    expect(readFileSync(f.out, "utf-8")).toBe("PRECIOUS EXISTING CONTENT\n");
    expect(readdirSync(f.dir).filter((n) => n.includes("sfce-delegate") && n.endsWith(".tmp"))).toEqual([]);
  });

  test("a successful write replaces an existing --out and keeps its mode", async () => {
    const f = fixtures();
    writeFileSync(f.out, "old\n");
    chmodSync(f.out, 0o640);
    nextStatus = 200;
    nextBody = okResponse("public class Replaced {}");
    const r = await run(["--spec", f.spec, "--reference", f.ref, "--out", f.out, "--expect-lines", "60"], liveEnv());
    expect(r.code).toBe(EXIT_OK);
    expect(readFileSync(f.out, "utf-8")).toBe("public class Replaced {}\n");
    expect(statSync(f.out).mode & 0o777).toBe(0o640);
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

  // Each of these used to hang forever: `shift 2` with one argument left fails,
  // $# never reaches zero, and the loop re-reads the same option. The kill
  // timer turns a regression into a failure rather than a stalled suite.
  for (const opt of ["--spec", "--out", "--reference", "--kind", "--expect-lines"]) {
    test(`${opt} with no value is a usage error, not a hang`, async () => {
      const f = fixtures();
      const leading = opt === "--spec" ? ["--out", f.out] : ["--spec", f.spec];
      const r = await run([...leading, opt], liveEnv(), 5000);
      expect(r.timedOut, `${opt} with no value hung`).toBe(false);
      expect(r.code).toBe(EXIT_USAGE);
      expect(r.stderr).toContain(`${opt} requires a value`);
    });
  }

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
