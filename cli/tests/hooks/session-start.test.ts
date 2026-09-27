import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SCRIPT = join(REPO_ROOT, "scripts", "session-start");

let home: string;
let project: string;

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "sfce-primer-"));
  project = join(home, "acme");
  const src = join(project, "force-app", "main", "default");
  for (const d of ["classes", "triggers", "flows", "lwc/accountCard", "lwc/__tests__"]) {
    mkdirSync(join(src, d), { recursive: true });
  }
  writeFileSync(
    join(project, "sfdx-project.json"),
    JSON.stringify({ name: "acme", sourceApiVersion: "66.0", packageDirectories: [{ path: "force-app" }] }),
  );
  for (const f of ["classes/AccountService.cls", "classes/fflib_SObjectDomain.cls", "triggers/Account.trigger", "flows/Lead.flow-meta.xml"]) {
    writeFileSync(join(src, f), "");
  }
  mkdirSync(join(home, ".sfdx"), { recursive: true });
  mkdirSync(join(project, ".sf"), { recursive: true });
});
afterEach(() => rmSync(home, { recursive: true, force: true }));

async function run(cwd: string) {
  const proc = Bun.spawn([SCRIPT], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "", HOME: home },
  });
  const out = await new Response(proc.stdout).text();
  expect(await proc.exited).toBe(0);
  return out;
}

describe("session-start project context", () => {
  test("outside a DX project only the primer prints", async () => {
    const out = await run(home);
    expect(out).toContain("compound-engineering plugin active");
    expect(out).not.toContain("Salesforce project context");
  });

  test("inside a DX project it adds project facts", async () => {
    const out = await run(join(project, "force-app"));
    expect(out).toContain("acme · API 66.0 · packages: force-app");
    expect(out).toContain("2 Apex classes, 1 triggers, 1 LWC, 1 Flows");
    expect(out).toContain("trigger framework: fflib");
    expect(out).toContain("Default org: not set");
  });

  test("names the default org and flags production, without leaking tokens", async () => {
    writeFileSync(join(project, ".sf", "config.json"), JSON.stringify({ "target-org": "prod" }));
    writeFileSync(join(home, ".sfdx", "alias.json"), JSON.stringify({ orgs: { prod: "a@acme.com" } }));
    writeFileSync(
      join(home, ".sfdx", "a@acme.com.json"),
      JSON.stringify({ instanceUrl: "https://acme.my.salesforce.com", isSandbox: false, accessToken: "SECRET_TOKEN" }),
    );
    const out = await run(project);
    expect(out).toContain("Default org: prod (PRODUCTION)");
    expect(out).not.toContain("SECRET_TOKEN");
  });

  test("the context block stays small", async () => {
    const out = await run(project);
    const block = out.slice(out.indexOf("Salesforce project context"));
    expect(block.length).toBeLessThanOrEqual(500);
  });
});
