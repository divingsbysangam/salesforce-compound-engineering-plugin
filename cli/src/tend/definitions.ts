import type { FeedDefinition } from "./types.js";

export const DEFAULT_FEEDS: FeedDefinition[] = [
  {
    id: "sf-platform-delivery",
    name: "Salesforce platform delivery",
    responsibility: "Keep Apex, LWC, Flow, metadata, tests, and deployments moving safely.",
    sources: ["repository", "salesforce-cli", "salesforce-dx-mcp"],
    mutationPolicy: "approval-required",
  },
  {
    id: "sf-agentforce-lifecycle",
    name: "Agentforce lifecycle",
    responsibility: "Keep Agent Script, preview, testing, publishing, activation, and observation healthy.",
    sources: ["repository", "agentforce-dx", "salesforce-dx-mcp"],
    mutationPolicy: "approval-required",
  },
  {
    id: "sf-org-health",
    name: "Salesforce org health",
    responsibility: "Surface limits, coverage, errors, deployment health, and adoption signals.",
    sources: ["salesforce-cli", "salesforce-dx-mcp", "event-monitoring"],
    mutationPolicy: "read-only",
  },
  {
    id: "sf-mcp-integrations",
    name: "Salesforce MCP integrations",
    responsibility: "Keep DX MCP, hosted MCP, External Client Apps, and tool security understandable and current.",
    sources: ["mcp-config", "salesforce-docs", "salesforce-dx-mcp"],
    mutationPolicy: "approval-required",
  },
  {
    id: "sf-knowledge",
    name: "Salesforce engineering knowledge",
    responsibility: "Compound solved problems, refresh stale learnings, and propose reversible policy improvements.",
    sources: ["docs/solutions", "docs/plans", "repository", "session-history"],
    mutationPolicy: "approval-required",
  },
];

export function defaultFeed(id: string): FeedDefinition | undefined {
  return DEFAULT_FEEDS.find((feed) => feed.id === id);
}
