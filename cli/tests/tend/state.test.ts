import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import {
  allState,
  applyLearning,
  bindFeed,
  claimWork,
  completeWork,
  digest,
  feedHealth,
  listCards,
  proposeLearning,
  requestLearning,
  revertLearning,
  stateFile,
  StaleActionError,
  upsertCard,
  verifyAction,
} from "../../src/tend/state.js";
import type { Card } from "../../src/tend/types.js";

const FIXTURE_DIR = join(import.meta.dir, "fixtures");

function stateOptions() {
  return { stateDir: join(tmpdir(), `sfce-tend-test-${randomUUID()}`), scope: "test" };
}

function cleanup(options: ReturnType<typeof stateOptions>) {
  rmSync(options.stateDir, { recursive: true, force: true });
}

function cardFor(feedId = "sf-platform-delivery"): Card {
  return {
    id: "card-1",
    feedId,
    title: "Deployment needs review",
    summary: "A deployment target changed after collection.",
    status: "new",
    evidence: [
      {
        id: "evidence-1",
        source: "salesforce-cli",
        locator: "sf project deploy report",
        summary: "Deployment report captured from the target org.",
        capturedAt: "2026-07-14T00:00:00.000Z",
      },
    ],
    actions: [
      {
        id: "deploy",
        label: "Deploy after review",
        kind: "mutate",
        approvalRequired: true,
        targetDigest: digest({ metadata: ["ApexClass:Example"], version: 1 }),
        status: "pending",
      },
    ],
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T00:00:00.000Z",
  };
}

describe("Tend local state", () => {
  test("accepts mocked source snapshots for every initial feed", () => {
    const options = stateOptions();
    try {
      const feeds = allState(options).feeds.map((feed) => feed.id);
      for (const feedId of feeds) {
        const snapshot = JSON.parse(readFileSync(join(FIXTURE_DIR, `${feedId}.json`), "utf8")) as {
          feedId: string;
          source: string;
          locator: string;
          summary: string;
          capturedAt: string;
          target: unknown;
        };
        expect(snapshot.feedId).toBe(feedId);
        upsertCard(
          {
            id: `fixture-${feedId}`,
            feedId,
            title: `${feedId} fixture`,
            summary: snapshot.summary,
            status: "new",
            evidence: [
              {
                id: `evidence-${feedId}`,
                source: snapshot.source,
                locator: snapshot.locator,
                summary: snapshot.summary,
                capturedAt: snapshot.capturedAt,
              },
            ],
            actions: [
              {
                id: "inspect",
                label: "Inspect fixture",
                kind: "inspect",
                approvalRequired: false,
                targetDigest: digest(snapshot.target),
                status: "pending",
              },
            ],
            createdAt: snapshot.capturedAt,
            updatedAt: snapshot.capturedAt,
          },
          options,
        );
      }
      expect(listCards(undefined, options)).toHaveLength(5);
    } finally {
      cleanup(options);
    }
  });

  test("seeds the five Salesforce responsibilities and isolates scopes", () => {
    const first = stateOptions();
    const second = { ...first, scope: "other" };
    try {
      expect(allState(first).feeds.map((feed) => feed.id)).toEqual([
        "sf-platform-delivery",
        "sf-agentforce-lifecycle",
        "sf-org-health",
        "sf-mcp-integrations",
        "sf-knowledge",
      ]);
      bindFeed("sf-platform-delivery", "thread-a", first);
      expect(feedHealth("sf-platform-delivery", first).threadId).toBe("thread-a");
      expect(feedHealth("sf-platform-delivery", second).threadId).toBeNull();
      expect(existsSync(stateFile(first))).toBe(true);
    } finally {
      cleanup(first);
    }
  });

  test("enforces one durable thread per feed", () => {
    const options = stateOptions();
    try {
      bindFeed("sf-platform-delivery", "thread-a", options);
      expect(() => bindFeed("sf-platform-delivery", "thread-b", options)).toThrow(
        "one thread must own one feed",
      );
    } finally {
      cleanup(options);
    }
  });

  test("claims and completes work only through the bound thread", () => {
    const options = stateOptions();
    try {
      bindFeed("sf-platform-delivery", "thread-a", options);
      upsertCard(cardFor(), options);
      expect(() => claimWork("sf-platform-delivery", "card-1", "deploy", "thread-b", options)).toThrow(
        "not the bound home thread",
      );
      const work = claimWork("sf-platform-delivery", "card-1", "deploy", "thread-a", options);
      expect(() => completeWork(work.id, "User-approved deployment completed.", options)).toThrow(
        "must be freshly verified",
      );
      verifyAction(
        "sf-platform-delivery",
        "card-1",
        "deploy",
        digest({ metadata: ["ApexClass:Example"], version: 1 }),
        true,
        options,
      );
      const receipt = completeWork(work.id, "User-approved deployment completed.", options);
      expect(receipt.status).toBe("completed");
      expect(listCards("sf-platform-delivery", options)[0]?.status).toBe("completed");
    } finally {
      cleanup(options);
    }
  });

  test("rejects stale action targets and records a receipt", () => {
    const options = stateOptions();
    try {
      upsertCard(cardFor(), options);
      expect(() =>
        verifyAction(
          "sf-platform-delivery",
          "card-1",
          "deploy",
          digest({ metadata: ["ApexClass:Example"], version: 2 }),
          true,
          options,
        ),
      ).toThrow(StaleActionError);
      expect(allState(options).receipts.at(-1)?.status).toBe("rejected");
      expect(() =>
        verifyAction(
          "sf-platform-delivery",
          "card-1",
          "deploy",
          digest({ metadata: ["ApexClass:Example"], version: 1 }),
          false,
          options,
        ),
      ).toThrow("requires explicit approval");
      const receipt = verifyAction(
        "sf-platform-delivery",
        "card-1",
        "deploy",
        digest({ metadata: ["ApexClass:Example"], version: 1 }),
        true,
        options,
      );
      expect(receipt.status).toBe("verified");
    } finally {
      cleanup(options);
    }
  });

  test("keeps learning proposals reviewable and reversible", () => {
    const options = stateOptions();
    try {
      const requested = requestLearning("sf-knowledge", "Prefer package.xml for Agentforce bundles", options);
      const proposed = proposeLearning(requested.id, "Add a package.xml verification step.", ["docs/plan.md"], options);
      expect(() => applyLearning(proposed.id, false, options)).toThrow("requires explicit approval");
      const receipt = applyLearning(proposed.id, true, options);
      expect(receipt.type).toBe("learning_application");
      expect(revertLearning(proposed.id, options).status).toBe("reverted");
    } finally {
      cleanup(options);
    }
  });
});
