import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "../../..");

function read(path: string): string {
  return readFileSync(join(root, path), "utf-8");
}

describe("workflow contracts", () => {
  test("plan names the three output tiers in the always-loaded body", () => {
    const skill = read("skills/sf-plan/SKILL.md");
    expect(skill).toContain("**Direct**");
    expect(skill).toContain("**Chat brief**");
    expect(skill).toContain("**Durable**");
    expect(skill).toContain("These three names stay in this file");
  });

  test("brainstorm asks only what the repo cannot settle", () => {
    const guide = read("skills/sf-plan/references/brainstorm/guide.md");
    expect(guide).toContain("Ask only a decision that material cannot settle");
    expect(guide).toContain("Lightweight");
  });

  test("work skips ceremony for a trivial prompt", () => {
    const skill = read("skills/sf-work/SKILL.md");
    expect(skill).toContain("**Trivial**");
    expect(skill).toContain("Skip the research dispatch");
  });

  test("review dispatch does not embed the diff twice", () => {
    const step = read("skills/sf-review/references/step-2-dispatch-review-personas-in-parallel.md");
    expect(step).toContain("Do not also paste the diff");
  });

  test("doc review limits the product finding to an unsettled position", () => {
    const lens = read("skills/sf-review/references/lenses/doc.md");
    expect(lens).toContain("Unsettled product position");
    expect(lens).toContain("DOC-14, not a product position");
  });

  test("resolve-feedback judges top-level comments and avoids pending reviews", () => {
    const guide = read("skills/sf-ship/references/resolve-feedback/guide.md");
    expect(guide).toContain("issues/{pr}/comments");
    expect(guide).toContain("addPullRequestReviewThreadReply");
    expect(guide).toContain("type: needs-human");
  });

  test("handoff separates the writer's voice from the user's", () => {
    const create = read("skills/sf-work/references/handoff/references/create.md");
    const resume = read("skills/sf-work/references/handoff/references/resume.md");
    expect(create).toContain("your inference, or your own call");
    expect(resume).toContain("writer's own reading");
  });

  test("strategy is the agreed shared project document", () => {
    const guide = read("skills/sf-plan/references/strategy/guide.md");
    expect(guide).toContain("agreed shared project document");
  });

  test("browser port comes from the bundled script", () => {
    const workflow = read("skills/sf-review/references/browser/references/workflow.md");
    const script = read("skills/sf-review/references/browser/scripts/resolve-port.sh");
    expect(workflow).toContain("scripts/resolve-port.sh");
    expect(script).toContain('port="${port:-3000}"');
  });

  test("optimize keeps multi-metric wins and screens expensive runs", () => {
    const guide = read("skills/sf-work/references/optimize/guide.md");
    expect(guide).toContain("multi-metric");
    expect(guide).toContain("Locating means");
  });
});
