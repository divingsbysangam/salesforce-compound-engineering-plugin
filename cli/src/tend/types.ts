export type FeedStatus = "active" | "archived";
export type CardStatus = "new" | "in_progress" | "completed" | "dismissed";
export type WorkStatus = "queued" | "claimed" | "completed" | "stale";
export type ActionStatus = "pending" | "verified" | "rejected";
export type LearningStatus = "requested" | "proposed" | "applied" | "reverted";

export interface FeedDefinition {
  id: string;
  name: string;
  responsibility: string;
  sources: string[];
  mutationPolicy: "read-only" | "approval-required";
}

export interface FeedState extends FeedDefinition {
  status: FeedStatus;
  binding?: FeedBinding;
  createdAt: string;
  updatedAt: string;
}

export interface FeedBinding {
  feedId: string;
  threadId: string;
  boundAt: string;
}

export interface Evidence {
  id: string;
  source: string;
  locator: string;
  summary: string;
  capturedAt: string;
}

export interface Action {
  id: string;
  label: string;
  kind: "inspect" | "prepare" | "mutate" | "learn";
  approvalRequired: boolean;
  targetDigest: string;
  status: ActionStatus;
}

/** Backwards-compatible name for callers that model actions as card fields. */
export type CardAction = Action;

export interface Card {
  id: string;
  feedId: string;
  title: string;
  summary: string;
  status: CardStatus;
  evidence: Evidence[];
  actions: Action[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkItem {
  id: string;
  feedId: string;
  cardId: string;
  actionId: string;
  threadId: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  feedId: string;
  cardId?: string;
  actionId?: string;
  type: "action_verification" | "work_completion" | "learning_application";
  status: "verified" | "rejected" | "completed";
  digest?: string;
  detail: string;
  createdAt: string;
}

export interface LearningProposal {
  id: string;
  feedId: string;
  title: string;
  change: string;
  evidence: string[];
  status: LearningStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TendState {
  version: 1;
  feeds: FeedState[];
  cards: Card[];
  work: WorkItem[];
  receipts: Receipt[];
  learnings: LearningProposal[];
  updatedAt: string;
}
