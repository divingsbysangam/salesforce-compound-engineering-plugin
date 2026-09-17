import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const HARNESS_DIR = join(REPO_ROOT, "tests", "skill-triggering");
const WORKFLOW = join(REPO_ROOT, ".github", "workflows", "quality.yml");

const workflow = () => readFileSync(WORKFLOW, "utf-8");

/**
 * The eval gate's wiring, as tests rather than as a promise.
 *
 * The gate spent U13 as a `run: echo "...still needs recorded fixtures"` step.
 * It looked wired up in the workflow listing and asserted nothing. The specific
 * way it failed is worth naming: nobody removed the check, and nobody had to —
 * a narrated step and a real one are indistinguishable in a green CI run.
 *
 * So the wiring gets the same treatment the hook scripts got in U10: the
 * properties CI depends on are expressed as red tests, not as comments someone
 * has to keep reading. Every assertion below corresponds to a way the gate
 * could silently stop gating.
 */

describe("the skill-triggering gate is actually invoked by CI", () => {
  test("quality.yml runs ci.sh", () => {
    // The whole point. A step that names the harness in prose but runs
    // something else is the U13 shape.
    expect(workflow()).toContain("run: tests/skill-triggering/ci.sh");
  });

  test("no step in quality.yml stubs the gate with a bare echo", () => {
    // Narrowly targeted: `echo` is legitimate inside a real script step, so
    // this looks only for a `run:` whose ENTIRE body is an echo mentioning the
    // harness — the exact stub that stood here before.
    const stubbed = /run:\s*\|?\s*\n?\s*echo[^\n]*skill-trigger/i.test(workflow());
    expect(stubbed, "the gate step has been replaced by an echo stub").toBe(false);
  });

  test("the macOS leg runs the selftest, not merely a parse check", () => {
    // bash -n proves the file parses. It does not prove the assertions behave
    // the same under macOS system bash 3.2, which is the shell every fixture
    // recording session actually uses.
    expect(workflow()).toContain("run: tests/skill-triggering/selftest.sh");
  });

  test("exit 77 is not tolerated anywhere in the workflow", () => {
    // The original hole: the harness exited 77 when the CLI was absent and CI
    // read 77 as success. Any reappearance of `|| true`, `continue-on-error`,
    // or an explicit 77 tolerance around these steps re-opens it.
    const body = workflow();
    expect(body).not.toContain("continue-on-error");
    expect(/exit_code\s*==\s*77|\|\|\s*\[\s*\$\?\s*-eq\s*77\s*\]/.test(body)).toBe(false);
  });
});

describe("the gate's scripts exist and can run", () => {
  for (const name of ["ci.sh", "selftest.sh", "run-test.sh"]) {
    test(`${name} exists and is executable`, () => {
      const p = join(HARNESS_DIR, name);
      expect(existsSync(p), `${name} is missing`).toBe(true);
      // A non-executable script makes `run: tests/skill-triggering/ci.sh` fail
      // with "Permission denied", which is at least loud. Asserted anyway
      // because the failure reads as infrastructure noise and invites an
      // `|| true` rather than a chmod.
      expect(statSync(p).mode & 0o111, `${name} is not executable`).toBeGreaterThan(0);
    });
  }
});

describe("the selftest covers the failure modes it claims to", () => {
  // selftest.sh is the only thing standing between "the gate is wired up" and
  // "the gate can go red" while fixtures are unrecorded. If a case is deleted,
  // the gate quietly narrows and CI stays green — which is why the case list
  // is pinned here rather than trusted to review.
  const selftest = () => readFileSync(join(HARNESS_DIR, "selftest.sh"), "utf-8");

  const REQUIRED_CASES = [
    "near-match name is rejected",
    "another plugin's same-named skill is rejected",
    "right skill reached second is rejected",
    "wrong skill is rejected",
    "no Skill event at all is rejected",
    "Bash before Skill is rejected",
    "Edit before Skill is rejected",
    "TodoWrite before Skill is benign",
    "truncated stream after a valid Skill event is rejected",
    "malformed first line is rejected",
    "empty fixture is rejected",
    "missing fixture is a failure, not a skip",
    "fixture without its seed prompt is rejected",
  ];

  for (const name of REQUIRED_CASES) {
    test(`case present: ${name}`, () => {
      expect(selftest()).toContain(name);
    });
  }

  test("the selftest invokes the shipped harness rather than reimplementing it", () => {
    // A selftest that restated the assertions would pass while run-test.sh was
    // broken — the exact bug shape it exists to prevent. It must copy and
    // subprocess the real script.
    const body = selftest();
    expect(body).toContain('HARNESS="$SCRIPT_DIR/run-test.sh"');
    expect(body).toContain('cp "$HARNESS"');
  });
});

describe("ci.sh refuses a partially recorded battery", () => {
  // The arming rule is what stops "record the three easy cases, go green, never
  // finish". Losing it is not a visible regression: CI would still pass, on a
  // subset, while the README promises ten routes.
  const ci = () => readFileSync(join(HARNESS_DIR, "ci.sh"), "utf-8");

  test("a partial fixture set is a failure", () => {
    expect(ci()).toContain("PARTIALLY recorded");
    expect(/present"\s*-lt\s*"\$expected/.test(ci())).toBe(true);
  });

  test("an empty prompts directory is a failure, not an empty-by-design pass", () => {
    // Deleting the seed prompts would otherwise arm the gate vacuously: zero
    // expected, zero present, green.
    expect(ci()).toContain("no seed prompts found");
  });

  test("the unarmed state is stated, not silent", () => {
    expect(ci()).toContain("UNARMED");
  });
});
