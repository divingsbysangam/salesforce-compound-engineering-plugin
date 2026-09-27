import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const GATE = join(REPO_ROOT, "scripts", "sfce-deploy-gate");

let home: string;
let project: string;

function auth(username: string, fields: Record<string, unknown>) {
  writeFileSync(join(home, ".sfdx", `${username}.json`), JSON.stringify({ username, ...fields }));
}

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "sfce-deploy-"));
  project = join(home, "proj");
  mkdirSync(join(home, ".sfdx"), { recursive: true });
  mkdirSync(join(project, ".sf"), { recursive: true });
  writeFileSync(
    join(home, ".sfdx", "alias.json"),
    JSON.stringify({ orgs: { prod: "admin@acme.com", uat: "admin@acme.com.uat", dev: "me@scratch.org" } }),
  );
  auth("admin@acme.com", { instanceUrl: "https://acme.my.salesforce.com", isSandbox: false });
  auth("admin@acme.com.uat", { instanceUrl: "https://acme--uat.sandbox.my.salesforce.com", isSandbox: true });
  auth("me@scratch.org", { instanceUrl: "https://x.scratch.my.salesforce.com", isScratch: true });
});
afterEach(() => rmSync(home, { recursive: true, force: true }));

async function run(command: string, env: Record<string, string> = {}) {
  const proc = Bun.spawn([GATE, "PreToolUse"], {
    stdin: new TextEncoder().encode(
      JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", cwd: project, tool_input: { command } }),
    ),
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "", HOME: home, ...env },
  });
  const stdout = await new Response(proc.stdout).text();
  const code = await proc.exited;
  const decision = stdout.trim() ? JSON.parse(stdout).hookSpecificOutput.permissionDecision : null;
  return { code, decision, stdout };
}

describe("deploy gate", () => {
  test("ignores commands that are not deploys", async () => {
    expect((await run("git status")).decision).toBeNull();
    expect((await run("sf org list")).decision).toBeNull();
  });

  test("asks before a direct production deploy", async () => {
    const r = await run("sf project deploy start --source-dir force-app -o prod");
    expect(r.code).toBe(0);
    expect(r.decision).toBe("ask");
    expect(r.stdout).toContain("PRODUCTION");
  });

  test("lets validation and dry runs against production through", async () => {
    expect((await run("sf project deploy validate -d force-app -o prod")).decision).toBeNull();
    expect((await run("sf project deploy start --dry-run -d force-app -o prod")).decision).toBeNull();
  });

  test("-c on the modern command is --ignore-conflicts, not check-only", async () => {
    expect((await run("sf project deploy start -c -d force-app -o prod")).decision).toBe("ask");
  });

  test("denies NoTestRun on production", async () => {
    const r = await run("sf project deploy start -d force-app -o prod --test-level NoTestRun");
    expect(r.decision).toBe("deny");
  });

  test("sandboxes and scratch orgs deploy freely", async () => {
    expect((await run("sf project deploy start -d force-app -o uat")).decision).toBeNull();
    expect((await run("sf project deploy start -d force-app --target-org dev")).decision).toBeNull();
  });

  test("destructive changes ask on a sandbox but not on a scratch org", async () => {
    expect((await run("sf project delete source -m ApexClass:Foo -o uat")).decision).toBe("ask");
    expect(
      (await run("sf project deploy start -x package.xml --post-destructive-changes d.xml -o uat")).decision,
    ).toBe("ask");
    expect((await run("sf project delete source -m ApexClass:Foo -o dev")).decision).toBeNull();
  });

  test("uses the project default target org when -o is absent", async () => {
    writeFileSync(join(project, ".sf", "config.json"), JSON.stringify({ "target-org": "prod" }));
    expect((await run("sf project deploy start -d force-app")).decision).toBe("ask");
  });

  test("finds a deploy inside a compound command", async () => {
    expect((await run("cd proj && sf project deploy start -d force-app -o prod")).decision).toBe("ask");
  });

  test("an unknown org is allowed (fail open)", async () => {
    expect((await run("sf project deploy start -d force-app -o nobody")).decision).toBeNull();
  });

  test("SFCE_DEPLOY_GATE=0 turns it off", async () => {
    const r = await run("sf project deploy start -d force-app -o prod", { SFCE_DEPLOY_GATE: "0" });
    expect(r.decision).toBeNull();
  });

  test("never echoes a token", async () => {
    auth("admin@acme.com", {
      instanceUrl: "https://acme.my.salesforce.com",
      isSandbox: false,
      accessToken: "SECRET_TOKEN_VALUE",
    });
    const r = await run("sf project deploy start -d force-app -o prod");
    expect(r.stdout).not.toContain("SECRET_TOKEN_VALUE");
  });
});
