import { defineCommand } from "citty";
import { readFileSync } from "fs";
import {
  allState,
  applyLearning,
  bindFeed,
  claimWork,
  completeWork,
  createFeed,
  feedHealth,
  listCards,
  proposeLearning,
  requestLearning,
  revertLearning,
  type StateOptions,
  upsertCard,
  verifyAction,
} from "./state.js";
import type { Card } from "./types.js";

function options(args: Record<string, unknown>): StateOptions {
  return {
    stateDir: typeof args.stateDir === "string" ? args.stateDir : undefined,
    scope: typeof args.scope === "string" ? args.scope : undefined,
  };
}

function commonArgs() {
  return {
    "state-dir": {
      type: "string" as const,
      description: "Override the local Tend state directory (useful for tests/worktrees)",
    },
    scope: {
      type: "string" as const,
      description: "State scope; defaults to a hash of the current repository path",
    },
  };
}

function output(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

const feedList = defineCommand({
  meta: { name: "list", description: "List Salesforce Tend feeds" },
  args: commonArgs(),
  run({ args }) {
    output(allState(options(args)).feeds);
  },
});

const feedCreate = defineCommand({
  meta: { name: "create", description: "Create or initialize a Salesforce Tend feed" },
  args: {
    id: { type: "positional", description: "Feed id", required: true },
    ...commonArgs(),
  },
  run({ args }) {
    output(createFeed(args.id, options(args)));
  },
});

const feedBind = defineCommand({
  meta: { name: "bind", description: "Bind exactly one durable thread to a feed" },
  args: {
    id: { type: "positional", description: "Feed id", required: true },
    thread: { type: "string", description: "Home thread id", required: true },
    ...commonArgs(),
  },
  run({ args }) {
    output(bindFeed(args.id, args.thread, options(args)));
  },
});

const feedHealthCommand = defineCommand({
  meta: { name: "health", description: "Check feed state and thread binding health" },
  args: {
    id: { type: "positional", description: "Feed id", required: true },
    ...commonArgs(),
  },
  run({ args }) {
    output(feedHealth(args.id, options(args)));
  },
});

const feedState = defineCommand({
  meta: { name: "state", description: "Read local Tend state" },
  args: commonArgs(),
  run({ args }) {
    output(allState(options(args)));
  },
});

export const feedCommand = defineCommand({
  meta: { name: "feed", description: "Manage Salesforce Tend feeds" },
  subCommands: {
    list: feedList,
    create: feedCreate,
    bind: feedBind,
    health: feedHealthCommand,
    state: feedState,
  },
});

const cardList = defineCommand({
  meta: { name: "list", description: "List source-backed feed cards" },
  args: {
    feed: { type: "string", description: "Filter by feed id" },
    ...commonArgs(),
  },
  run({ args }) {
    output(listCards(args.feed, options(args)));
  },
});

const cardUpsert = defineCommand({
  meta: { name: "upsert", description: "Store a source-backed card from JSON" },
  args: {
    "card-file": { type: "string", description: "Path to a Card JSON document", required: true },
    ...commonArgs(),
  },
  run({ args }) {
    const card = JSON.parse(readFileSync(String(args.cardFile), "utf8")) as Card;
    output(upsertCard(card, options(args)));
  },
});

export const cardCommand = defineCommand({
  meta: { name: "card", description: "Manage source-backed Salesforce Tend cards" },
  subCommands: { list: cardList, upsert: cardUpsert },
});

const workList = defineCommand({
  meta: { name: "list", description: "List queued and claimed feed work" },
  args: {
    feed: { type: "string", description: "Filter by feed id" },
    ...commonArgs(),
  },
  run({ args }) {
    const state = allState(options(args));
    output(state.work.filter((work) => !args.feed || work.feedId === args.feed));
  },
});

const workClaim = defineCommand({
  meta: { name: "claim", description: "Claim one card action for the bound feed thread" },
  args: {
    feed: { type: "string", required: true, description: "Feed id" },
    card: { type: "string", required: true, description: "Card id" },
    action: { type: "string", required: true, description: "Card action id" },
    thread: { type: "string", required: true, description: "Bound home thread id" },
    ...commonArgs(),
  },
  run({ args }) {
    output(claimWork(args.feed, args.card, args.action, args.thread, options(args)));
  },
});

const workComplete = defineCommand({
  meta: { name: "complete", description: "Complete claimed work and record a receipt" },
  args: {
    id: { type: "string", required: true, description: "Work item id" },
    detail: { type: "string", required: true, description: "Completion detail" },
    ...commonArgs(),
  },
  run({ args }) {
    output(completeWork(args.id, args.detail, options(args)));
  },
});

export const workCommand = defineCommand({
  meta: { name: "work", description: "Manage feed work items" },
  subCommands: { list: workList, claim: workClaim, complete: workComplete },
});

const actionVerify = defineCommand({
  meta: { name: "verify", description: "Freshly verify an approved action target" },
  args: {
    feed: { type: "string", required: true, description: "Feed id" },
    card: { type: "string", required: true, description: "Card id" },
    action: { type: "string", required: true, description: "Card action id" },
    "current-digest": { type: "string", required: true, description: "Digest reread immediately before acting" },
    approve: { type: "boolean", default: false, description: "Explicitly approve the verified action" },
    ...commonArgs(),
  },
  run({ args }) {
    output(verifyAction(args.feed, args.card, args.action, String(args.currentDigest), args.approve, options(args)));
  },
});

export const actionCommand = defineCommand({
  meta: { name: "action", description: "Verify approval-gated feed actions" },
  subCommands: { verify: actionVerify },
});

const learningRequest = defineCommand({
  meta: { name: "request", description: "Request a reviewed learning proposal" },
  args: {
    feed: { type: "string", required: true, description: "Feed id" },
    title: { type: "string", required: true, description: "Learning title" },
    ...commonArgs(),
  },
  run({ args }) {
    output(requestLearning(args.feed, args.title, options(args)));
  },
});

const learningPropose = defineCommand({
  meta: { name: "propose", description: "Write the editable learning proposal" },
  args: {
    id: { type: "string", required: true, description: "Learning proposal id" },
    change: { type: "string", required: true, description: "Proposed policy or workflow change" },
    evidence: { type: "string", description: "Comma-separated evidence references", default: "" },
    ...commonArgs(),
  },
  run({ args }) {
    output(proposeLearning(args.id, args.change, args.evidence ? args.evidence.split(",") : [], options(args)));
  },
});

const learningApply = defineCommand({
  meta: { name: "apply", description: "Apply a reviewed learning proposal" },
  args: {
    id: { type: "string", required: true, description: "Learning proposal id" },
    approve: { type: "boolean", default: false, description: "Explicitly approve the policy change" },
    ...commonArgs(),
  },
  run({ args }) {
    output(applyLearning(args.id, args.approve, options(args)));
  },
});

const learningRevert = defineCommand({
  meta: { name: "revert", description: "Revert an applied learning proposal" },
  args: {
    id: { type: "string", required: true, description: "Learning proposal id" },
    ...commonArgs(),
  },
  run({ args }) {
    output(revertLearning(args.id, options(args)));
  },
});

export const learningCommand = defineCommand({
  meta: { name: "learning", description: "Manage reviewed Salesforce engineering learnings" },
  subCommands: {
    request: learningRequest,
    propose: learningPropose,
    apply: learningApply,
    revert: learningRevert,
  },
});
