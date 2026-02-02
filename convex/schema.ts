import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { issuePriorityValidator, issueStatusValidator, roleValidator } from "./lib/validators";

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerUserId: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    role: roleValidator,
    joinedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_userId", ["teamId", "userId"]),

  teamInvites: defineTable({
    teamId: v.id("teams"),
    email: v.string(),
    role: roleValidator,
    tokenHash: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_tokenHash", ["tokenHash"])
    .index("by_email_teamId", ["email", "teamId"]),

  projects: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    key: v.string(),
    createdAt: v.number(),
  }).index("by_teamId", ["teamId"]).index("by_teamId_key", ["teamId", "key"]),

  issues: defineTable({
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    status: issueStatusValidator,
    priority: issuePriorityValidator,
    assigneeId: v.optional(v.string()),
    reporterId: v.string(),
    summaryDoc: v.optional(v.any()),
    detailsDoc: v.optional(v.any()),
    impactDoc: v.optional(v.any()),
    stepsTakenDoc: v.optional(v.any()),
    nextStepsDoc: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_status", ["teamId", "status"])
    .index("by_teamId_projectId", ["teamId", "projectId"]),

  comments: defineTable({
    teamId: v.id("teams"),
    issueId: v.id("issues"),
    authorId: v.string(),
    bodyDoc: v.any(),
    createdAt: v.number(),
  }).index("by_issueId", ["issueId"]),

  labels: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    color: v.optional(v.string()),
  }).index("by_teamId_name", ["teamId", "name"]),

  issueLabels: defineTable({
    teamId: v.id("teams"),
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  })
    .index("by_issueId", ["issueId"])
    .index("by_labelId", ["labelId"])
    .index("by_issueId_labelId", ["issueId", "labelId"]),

  issueEvents: defineTable({
    teamId: v.id("teams"),
    issueId: v.id("issues"),
    actorId: v.optional(v.string()),
    type: v.string(),
    payload: v.any(),
    createdAt: v.number(),
  }).index("by_issueId", ["issueId"]),

  files: defineTable({
    teamId: v.id("teams"),
    issueId: v.optional(v.id("issues")),
    uploaderId: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number(),
  })
    .index("by_issueId", ["issueId"])
    .index("by_teamId", ["teamId"])
    .index("by_storageId", ["storageId"]),
});
