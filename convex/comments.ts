import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";
import { logIssueEvent } from "./lib/issueEvents";
import { insertTeamEvent } from "./lib/teamEvents";

export const list = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    await requireTeamMember(ctx, issue.teamId);
    return ctx.db
      .query("comments")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
  },
});

export const create = mutation({
  args: {
    issueId: v.id("issues"),
    bodyDoc: v.any(),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    const { userId } = await requireRole(ctx, issue.teamId, "MEMBER");
    const commentId = await ctx.db.insert("comments", {
      teamId: issue.teamId,
      issueId: args.issueId,
      authorId: userId,
      bodyDoc: args.bodyDoc,
      createdAt: Date.now(),
    });

    await logIssueEvent(ctx, {
      teamId: issue.teamId,
      issueId: issue._id,
      actorId: userId,
      type: "COMMENTED",
      payload: { commentId },
    });
    await insertTeamEvent(ctx, {
      teamId: issue.teamId,
      actorId: userId,
      type: "ISSUE_COMMENTED",
      payload: { issueId: issue._id, commentId },
    });

    return commentId;
  },
});
