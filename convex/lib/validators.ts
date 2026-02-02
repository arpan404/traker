import { v } from "convex/values";

export const Roles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;
export type Role = (typeof Roles)[number];

export const roleValidator = v.union(
  v.literal("OWNER"),
  v.literal("ADMIN"),
  v.literal("MEMBER"),
  v.literal("VIEWER"),
);

export const IssueStatuses = [
  "Backlog",
  "Open",
  "In Progress",
  "Testing",
  "In Review",
  "Won\u2019t Fix",
  "Resolved",
] as const;
export type IssueStatus = (typeof IssueStatuses)[number];

export const issueStatusValidator = v.union(
  v.literal("Backlog"),
  v.literal("Open"),
  v.literal("In Progress"),
  v.literal("Testing"),
  v.literal("In Review"),
  v.literal("Won\u2019t Fix"),
  v.literal("Resolved"),
);

export const IssuePriorities = ["Low", "Medium", "High", "Urgent"] as const;
export type IssuePriority = (typeof IssuePriorities)[number];

export const issuePriorityValidator = v.union(
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("Urgent"),
);
