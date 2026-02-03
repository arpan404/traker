import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";

export const listByIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    await requireTeamMember(ctx, issue.teamId);
    return ctx.db
      .query("issueLabels")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
  },
});

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db
      .query("issueLabels")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const toggle = mutation({
  args: {
    teamId: v.id("teams"),
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "MEMBER");
    const existing = await ctx.db
      .query("issueLabels")
      .withIndex("by_issueId_labelId", (q) =>
        q.eq("issueId", args.issueId).eq("labelId", args.labelId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { attached: false };
    }
    await ctx.db.insert("issueLabels", {
      teamId: args.teamId,
      issueId: args.issueId,
      labelId: args.labelId,
    });
    return { attached: true };
  },
});
