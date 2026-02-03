import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";
import {
  issuePriorityValidator,
  issueStatusValidator,
} from "./lib/validators";
import { logIssueEvent } from "./lib/issueEvents";
import { insertTeamEvent } from "./lib/teamEvents";

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

    return issues.sort(
      (a, b) =>
        (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
    );
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
    type: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, args.teamId, "MEMBER");
    const now = Date.now();
    const order = now;
    const issueId = await ctx.db.insert("issues", {
      teamId: args.teamId,
      projectId: args.projectId,
      title: args.title,
      status: args.status ?? "Untriaged",
      priority: args.priority ?? "Medium",
      type: args.type,
      assigneeId: args.assigneeId,
      order,
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
    await insertTeamEvent(ctx, {
      teamId: args.teamId,
      actorId: userId,
      type: "ISSUE_CREATED",
      payload: { issueId, title: args.title },
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
      type: v.optional(v.string()),
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

    const changedFields: string[] = [];
    if (args.patch.title && args.patch.title !== issue.title) {
      changedFields.push("title");
    }
    if (args.patch.priority && args.patch.priority !== issue.priority) {
      changedFields.push("priority");
    }
    if (args.patch.assigneeId !== undefined && args.patch.assigneeId !== issue.assigneeId) {
      changedFields.push("assignee");
    }
    if (args.patch.type !== undefined && args.patch.type !== issue.type) {
      changedFields.push("type");
    }
    if (args.patch.projectId !== undefined && args.patch.projectId !== issue.projectId) {
      changedFields.push("project");
    }
    if (args.patch.summaryDoc !== undefined) {
      changedFields.push("summary");
    }
    if (args.patch.detailsDoc !== undefined) {
      changedFields.push("details");
    }
    if (args.patch.impactDoc !== undefined) {
      changedFields.push("impact");
    }
    if (args.patch.stepsTakenDoc !== undefined) {
      changedFields.push("steps");
    }
    if (args.patch.nextStepsDoc !== undefined) {
      changedFields.push("nextSteps");
    }

    if (changedFields.length > 0) {
      await insertTeamEvent(ctx, {
        teamId: issue.teamId,
        actorId: userId,
        type: "ISSUE_UPDATED",
        payload: {
          issueId: issue._id,
          title: args.patch.title ?? issue.title,
          fields: changedFields,
        },
      });
    }

    if (args.patch.status && args.patch.status !== issue.status) {
      await logIssueEvent(ctx, {
        teamId: issue.teamId,
        issueId: issue._id,
        actorId: userId,
        type: "STATUS_CHANGED",
        payload: { from: issue.status, to: args.patch.status },
      });
      await insertTeamEvent(ctx, {
        teamId: issue.teamId,
        actorId: userId,
        type: "ISSUE_STATUS_CHANGED",
        payload: {
          issueId: issue._id,
          title: args.patch.title ?? issue.title,
          from: issue.status,
          to: args.patch.status,
        },
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

    const now = Date.now();
    const targetIssues = await ctx.db
      .query("issues")
      .withIndex("by_teamId_status", (q) =>
        q.eq("teamId", issue.teamId).eq("status", args.newStatus),
      )
      .collect();
    const maxOrder = targetIssues.reduce(
      (max, current) => Math.max(max, current.order ?? current.createdAt),
      0,
    );

    await ctx.db.patch(issue._id, {
      status: args.newStatus,
      order: maxOrder + 1,
      updatedAt: now,
    });

    await logIssueEvent(ctx, {
      teamId: issue.teamId,
      issueId: issue._id,
      actorId: userId,
      type: "STATUS_CHANGED",
      payload: { from: issue.status, to: args.newStatus },
    });
    await insertTeamEvent(ctx, {
      teamId: issue.teamId,
      actorId: userId,
      type: "ISSUE_STATUS_CHANGED",
      payload: {
        issueId: issue._id,
        title: issue.title,
        from: issue.status,
        to: args.newStatus,
      },
    });
  },
});

export const reorder = mutation({
  args: {
    issueId: v.id("issues"),
    status: issueStatusValidator,
    beforeId: v.optional(v.id("issues")),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    const { userId } = await requireRole(ctx, issue.teamId, "MEMBER");

    const targetStatus = args.status;
    const targetIssues = await ctx.db
      .query("issues")
      .withIndex("by_teamId_status", (q) =>
        q.eq("teamId", issue.teamId).eq("status", targetStatus),
      )
      .collect();

    const sorted = targetIssues
      .filter((item) => item._id !== issue._id)
      .sort(
        (a, b) =>
          (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
      );

    let newOrder: number;
    if (args.beforeId) {
      const beforeIndex = sorted.findIndex((item) => item._id === args.beforeId);
      const beforeItem = beforeIndex >= 0 ? sorted[beforeIndex] : null;
      const prevItem = beforeIndex > 0 ? sorted[beforeIndex - 1] : null;
      const beforeOrder = beforeItem?.order ?? beforeItem?.createdAt ?? Date.now();
      const prevOrder = prevItem?.order ?? prevItem?.createdAt;
      newOrder = prevOrder !== undefined ? (prevOrder + beforeOrder) / 2 : beforeOrder - 1;
    } else {
      const last = sorted.at(-1);
      const lastOrder = last ? (last.order ?? last.createdAt) : Date.now();
      newOrder = lastOrder + 1;
    }

    const statusChanged = issue.status !== targetStatus;
    await ctx.db.patch(issue._id, {
      status: targetStatus,
      order: newOrder,
      updatedAt: Date.now(),
    });

    if (statusChanged) {
      await logIssueEvent(ctx, {
        teamId: issue.teamId,
        issueId: issue._id,
        actorId: userId,
        type: "STATUS_CHANGED",
        payload: { from: issue.status, to: targetStatus },
      });
      await insertTeamEvent(ctx, {
        teamId: issue.teamId,
        actorId: userId,
        type: "ISSUE_STATUS_CHANGED",
        payload: {
          issueId: issue._id,
          title: issue.title,
          from: issue.status,
          to: targetStatus,
        },
      });
    }
  },
});
