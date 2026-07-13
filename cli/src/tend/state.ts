import { createHash, randomUUID } from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";
import { DEFAULT_FEEDS, defaultFeed } from "./definitions.js";
import type {
  Card,
  CardAction,
  CardStatus,
  FeedBinding,
  FeedState,
  LearningProposal,
  Receipt,
  TendState,
  WorkItem,
} from "./types.js";

export interface StateOptions {
  stateDir?: string;
  scope?: string;
  now?: () => string;
}

export class TendStateError extends Error {}
export class NotFoundError extends TendStateError {}
export class ConflictError extends TendStateError {}
export class StaleActionError extends TendStateError {}

function nowFor(options: StateOptions): string {
  return (options.now ?? (() => new Date().toISOString()))();
}

function scopeFor(options: StateOptions): string {
  if (options.scope) return options.scope.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cwd = resolve(process.cwd());
  return `${createHash("sha256").update(cwd).digest("hex").slice(0, 12)}`;
}

export function resolveStateDir(options: StateOptions = {}): string {
  if (options.stateDir) return resolve(options.stateDir);
  if (process.env.SFCE_TEND_HOME) return resolve(process.env.SFCE_TEND_HOME);
  const base = process.env.XDG_STATE_HOME
    ? resolve(process.env.XDG_STATE_HOME)
    : join(homedir(), ".sfce");
  return join(base, "tend");
}

export function stateFile(options: StateOptions = {}): string {
  return join(resolveStateDir(options), scopeFor(options), "state.json");
}

function emptyState(now: string): TendState {
  return {
    version: 1,
    feeds: [],
    cards: [],
    work: [],
    receipts: [],
    learnings: [],
    updatedAt: now,
  };
}

function seedFeeds(state: TendState, now: string): void {
  for (const definition of DEFAULT_FEEDS) {
    if (state.feeds.some((feed) => feed.id === definition.id)) continue;
    state.feeds.push({ ...definition, status: "active", createdAt: now, updatedAt: now });
  }
}

export function loadState(options: StateOptions = {}): TendState {
  const file = stateFile(options);
  const now = nowFor(options);
  mkdirSync(join(resolveStateDir(options), scopeFor(options)), { recursive: true });

  let state = emptyState(now);
  if (existsSync(file)) {
    try {
      state = JSON.parse(readFileSync(file, "utf8")) as TendState;
    } catch (error) {
      throw new TendStateError(`Invalid Tend state at ${file}: ${String(error)}`);
    }
  }
  seedFeeds(state, now);
  return state;
}

export function saveState(state: TendState, options: StateOptions = {}): string {
  const file = stateFile(options);
  const directory = join(resolveStateDir(options), scopeFor(options));
  mkdirSync(directory, { recursive: true });
  state.updatedAt = nowFor(options);
  const temporary = join(directory, `.state.${process.pid}.${randomUUID()}.tmp`);
  writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, file);
  return file;
}

function feedOrThrow(state: TendState, feedId: string): FeedState {
  const feed = state.feeds.find((candidate) => candidate.id === feedId);
  if (!feed) throw new NotFoundError(`Feed not found: ${feedId}`);
  return feed;
}

function cardOrThrow(state: TendState, cardId: string): Card {
  const card = state.cards.find((candidate) => candidate.id === cardId);
  if (!card) throw new NotFoundError(`Card not found: ${cardId}`);
  return card;
}

export function createFeed(feedId: string, options: StateOptions = {}): FeedState {
  const state = loadState(options);
  const existing = state.feeds.find((feed) => feed.id === feedId);
  if (existing) return existing;
  const definition = defaultFeed(feedId);
  if (!definition) throw new NotFoundError(`Unknown feed definition: ${feedId}`);
  const now = nowFor(options);
  const feed: FeedState = { ...definition, status: "active", createdAt: now, updatedAt: now };
  state.feeds.push(feed);
  saveState(state, options);
  return feed;
}

export function bindFeed(feedId: string, threadId: string, options: StateOptions = {}): FeedBinding {
  const state = loadState(options);
  const feed = feedOrThrow(state, feedId);
  if (feed.binding && feed.binding.threadId !== threadId) {
    throw new ConflictError(
      `Feed ${feedId} is already bound to thread ${feed.binding.threadId}; one thread must own one feed`,
    );
  }
  const binding = feed.binding ?? { feedId, threadId, boundAt: nowFor(options) };
  feed.binding = binding;
  feed.updatedAt = nowFor(options);
  saveState(state, options);
  return binding;
}

export function feedHealth(feedId: string, options: StateOptions = {}): Record<string, unknown> {
  const state = loadState(options);
  const feed = feedOrThrow(state, feedId);
  return {
    status: "healthy",
    feedId,
    feedStatus: feed.status,
    bound: Boolean(feed.binding),
    threadId: feed.binding?.threadId ?? null,
    stateFile: stateFile(options),
    updatedAt: state.updatedAt,
  };
}

export function digest(value: unknown): string {
  const canonicalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonicalize);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, child]) => [key, canonicalize(child)]),
      );
    }
    return input;
  };
  const canonical = JSON.stringify(canonicalize(value));
  return createHash("sha256").update(canonical).digest("hex");
}

export function upsertCard(card: Card, options: StateOptions = {}): Card {
  const state = loadState(options);
  feedOrThrow(state, card.feedId);
  const now = nowFor(options);
  const existingIndex = state.cards.findIndex((candidate) => candidate.id === card.id);
  const normalized: Card = { ...card, updatedAt: now, createdAt: card.createdAt || now };
  if (existingIndex >= 0) state.cards[existingIndex] = normalized;
  else state.cards.push(normalized);
  saveState(state, options);
  return normalized;
}

export function listCards(feedId: string | undefined, options: StateOptions = {}): Card[] {
  const state = loadState(options);
  if (feedId) feedOrThrow(state, feedId);
  return state.cards.filter((card) => !feedId || card.feedId === feedId);
}

export function claimWork(
  feedId: string,
  cardId: string,
  actionId: string,
  threadId: string,
  options: StateOptions = {},
): WorkItem {
  const state = loadState(options);
  const feed = feedOrThrow(state, feedId);
  const card = cardOrThrow(state, cardId);
  if (card.feedId !== feedId) throw new ConflictError(`Card ${cardId} does not belong to feed ${feedId}`);
  if (!feed.binding || feed.binding.threadId !== threadId) {
    throw new ConflictError(`Thread ${threadId} is not the bound home thread for ${feedId}`);
  }
  const action = card.actions.find((candidate) => candidate.id === actionId);
  if (!action) throw new NotFoundError(`Action not found: ${actionId}`);
  const existing = state.work.find(
    (work) => work.cardId === cardId && work.actionId === actionId && work.status !== "stale",
  );
  if (existing) return existing;
  const now = nowFor(options);
  const work: WorkItem = {
    id: randomUUID(),
    feedId,
    cardId,
    actionId,
    threadId,
    status: "claimed",
    createdAt: now,
    updatedAt: now,
  };
  card.status = "in_progress";
  state.work.push(work);
  saveState(state, options);
  return work;
}

export function completeWork(workId: string, detail: string, options: StateOptions = {}): Receipt {
  const state = loadState(options);
  const work = state.work.find((candidate) => candidate.id === workId);
  if (!work) throw new NotFoundError(`Work item not found: ${workId}`);
  const card = cardOrThrow(state, work.cardId);
  const action = card.actions.find((candidate) => candidate.id === work.actionId);
  if (!action) throw new NotFoundError(`Action not found: ${work.actionId}`);
  if (action.approvalRequired && action.status !== "verified") {
    throw new ConflictError(`Action ${action.id} must be freshly verified before work can complete`);
  }
  work.status = "completed";
  work.updatedAt = nowFor(options);
  card.status = "completed";
  const receipt: Receipt = {
    id: randomUUID(),
    feedId: work.feedId,
    cardId: work.cardId,
    actionId: work.actionId,
    type: "work_completion",
    status: "completed",
    detail,
    createdAt: nowFor(options),
  };
  state.receipts.push(receipt);
  saveState(state, options);
  return receipt;
}

export function verifyAction(
  feedId: string,
  cardId: string,
  actionId: string,
  currentDigest: string,
  approved: boolean,
  options: StateOptions = {},
): Receipt {
  const state = loadState(options);
  const feed = feedOrThrow(state, feedId);
  const card = cardOrThrow(state, cardId);
  const action = card.actions.find((candidate) => candidate.id === actionId);
  if (!action) throw new NotFoundError(`Action not found: ${actionId}`);
  if (card.feedId !== feedId) throw new ConflictError(`Card ${cardId} does not belong to feed ${feedId}`);
  if (action.approvalRequired && !approved) {
    throw new ConflictError(`Action ${actionId} requires explicit approval`);
  }
  const now = nowFor(options);
  if (action.targetDigest !== currentDigest) {
    action.status = "rejected";
    const receipt: Receipt = {
      id: randomUUID(),
      feedId,
      cardId,
      actionId,
      type: "action_verification",
      status: "rejected",
      digest: currentDigest,
      detail: "Rejected because the authoritative target changed after the card was created.",
      createdAt: now,
    };
    state.receipts.push(receipt);
    saveState(state, options);
    throw new StaleActionError(receipt.detail);
  }
  action.status = "verified";
  const receipt: Receipt = {
    id: randomUUID(),
    feedId,
    cardId,
    actionId,
    type: "action_verification",
    status: "verified",
    digest: currentDigest,
    detail: "Approved action target was freshly verified.",
    createdAt: now,
  };
  state.receipts.push(receipt);
  saveState(state, options);
  return receipt;
}

export function requestLearning(feedId: string, title: string, options: StateOptions = {}): LearningProposal {
  const state = loadState(options);
  feedOrThrow(state, feedId);
  const now = nowFor(options);
  const proposal: LearningProposal = {
    id: randomUUID(),
    feedId,
    title,
    change: "",
    evidence: [],
    status: "requested",
    createdAt: now,
    updatedAt: now,
  };
  state.learnings.push(proposal);
  saveState(state, options);
  return proposal;
}

export function proposeLearning(
  proposalId: string,
  change: string,
  evidence: string[],
  options: StateOptions = {},
): LearningProposal {
  const state = loadState(options);
  const proposal = state.learnings.find((candidate) => candidate.id === proposalId);
  if (!proposal) throw new NotFoundError(`Learning proposal not found: ${proposalId}`);
  proposal.change = change;
  proposal.evidence = evidence;
  proposal.status = "proposed";
  proposal.updatedAt = nowFor(options);
  saveState(state, options);
  return proposal;
}

export function applyLearning(
  proposalId: string,
  approved: boolean,
  options: StateOptions = {},
): Receipt {
  const state = loadState(options);
  const proposal = state.learnings.find((candidate) => candidate.id === proposalId);
  if (!proposal) throw new NotFoundError(`Learning proposal not found: ${proposalId}`);
  if (proposal.status !== "proposed") throw new ConflictError(`Learning proposal ${proposalId} is not ready to apply`);
  if (!approved) throw new ConflictError(`Learning proposal ${proposalId} requires explicit approval`);
  proposal.status = "applied";
  proposal.updatedAt = nowFor(options);
  const receipt: Receipt = {
    id: randomUUID(),
    feedId: proposal.feedId,
    type: "learning_application",
    status: "completed",
    detail: `Applied reviewed learning proposal ${proposalId}: ${proposal.change}`,
    createdAt: nowFor(options),
  };
  state.receipts.push(receipt);
  saveState(state, options);
  return receipt;
}

export function revertLearning(proposalId: string, options: StateOptions = {}): LearningProposal {
  const state = loadState(options);
  const proposal = state.learnings.find((candidate) => candidate.id === proposalId);
  if (!proposal) throw new NotFoundError(`Learning proposal not found: ${proposalId}`);
  if (proposal.status !== "applied") throw new ConflictError(`Learning proposal ${proposalId} is not applied`);
  proposal.status = "reverted";
  proposal.updatedAt = nowFor(options);
  saveState(state, options);
  return proposal;
}

export function allState(options: StateOptions = {}): TendState {
  return loadState(options);
}

export function defaultTestStateDir(): string {
  return join(tmpdir(), `sfce-tend-${randomUUID()}`);
}

export type { CardAction, CardStatus };
