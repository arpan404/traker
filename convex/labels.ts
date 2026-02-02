import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";

export const list = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db
      .query("labels")
      .withIndex("by_teamId_name", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "MEMBER");
    const existing = await ctx.db
      .query("labels")
      .withIndex("by_teamId_name", (q) =>
        q.eq("teamId", args.teamId).eq("name", args.name),
      )
      .unique();
    if (existing) {
      throw new ConvexError("Label already exists");
    }
    return ctx.db.insert("labels", {
      teamId: args.teamId,
      name: args.name,
      color: args.color,
    });
  },
});
