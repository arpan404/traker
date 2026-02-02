import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";
import {
  issuePriorityValidator,
  issueStatusValidator,
} from "./lib/validators";
import { logIssueEvent } from "./lib/issueEvents";

export const list = query({
  args: {
    teamId: v.id("teams"),
    status: v.optional(issueStatusValidator),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.string()),
    priority: v.optional(issuePriorityValidator),
    labelId: v.optional(v.id("labels")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);

    const baseQuery = args.status
      ? ctx.db
          .query("issues")
          .withIndex("by_teamId_status", (q) =>
            q.eq("teamId", args.teamId).eq("status", args.status!),
          )
      : ctx.db
          .query("issues")
          .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId));

    let issues = await baseQuery.collect();

    if (args.projectId) {
      issues = issues.filter((issue) => issue.projectId === args.projectId);
    }
    if (args.assigneeId) {
      issues = issues.filter((issue) => issue.assigneeId === args.assigneeId);
    }
    if (args.priority) {
      issues = issues.filter((issue) => issue.priority === args.priority);
    }
    if (args.labelId) {
      const labelLinks = await ctx.db
        .query("issueLabels")
        .withIndex("by_labelId", (q) => q.eq("labelId", args.labelId!))
        .collect();
      const issueIds = new Set(labelLinks.map((link) => link.issueId));
      issues = issues.filter((issue) => issueIds.has(issue._id));
    }
    if (args.search) {
      const term = args.search.toLowerCase();
      issues = issues.filter((issue) => issue.title.toLowerCase().includes(term));
    }

    return issues;
  },
});

export const get = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    await requireTeamMember(ctx, issue.teamId);
    return issue;
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    status: v.optional(issueStatusValidator),
    priority: v.optional(issuePriorityValidator),
    assigneeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, args.teamId, "MEMBER");
    const now = Date.now();
    const issueId = await ctx.db.insert("issues", {
      teamId: args.teamId,
      projectId: args.projectId,
      title: args.title,
      status: args.status ?? "Backlog",
      priority: args.priority ?? "Medium",
      assigneeId: args.assigneeId,
      reporterId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await logIssueEvent(ctx, {
      teamId: args.teamId,
      issueId,
      actorId: userId,
      type: "CREATED",
      payload: { title: args.title },
    });

    return issueId;
  },
});

export const update = mutation({
  args: {
    issueId: v.id("issues"),
    patch: v.object({
      title: v.optional(v.string()),
      status: v.optional(issueStatusValidator),
      priority: v.optional(issuePriorityValidator),
      assigneeId: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      summaryDoc: v.optional(v.any()),
      detailsDoc: v.optional(v.any()),
      impactDoc: v.optional(v.any()),
      stepsTakenDoc: v.optional(v.any()),
      nextStepsDoc: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    const { userId } = await requireRole(ctx, issue.teamId, "MEMBER");

    const updates = {
      ...args.patch,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(issue._id, updates);

    if (args.patch.status && args.patch.status !== issue.status) {
      await logIssueEvent(ctx, {
        teamId: issue.teamId,
        issueId: issue._id,
        actorId: userId,
        type: "STATUS_CHANGED",
        payload: { from: issue.status, to: args.patch.status },
      });
    }
  },
});

export const move = mutation({
  args: {
    issueId: v.id("issues"),
    newStatus: issueStatusValidator,
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    const { userId } = await requireRole(ctx, issue.teamId, "MEMBER");
    if (issue.status === args.newStatus) {
      return;
    }

    await ctx.db.patch(issue._id, {
      status: args.newStatus,
      updatedAt: Date.now(),
    });

    await logIssueEvent(ctx, {
      teamId: issue.teamId,
      issueId: issue._id,
      actorId: userId,
      type: "STATUS_CHANGED",
      payload: { from: issue.status, to: args.newStatus },
    });
  },
});
