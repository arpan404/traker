import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";

export const list = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db
      .query("projects")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "ADMIN");
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_teamId_key", (q) =>
        q.eq("teamId", args.teamId).eq("key", args.key),
      )
      .unique();
    if (existing) {
      throw new ConvexError("Project key already exists");
    }
    return ctx.db.insert("projects", {
      teamId: args.teamId,
      name: args.name,
      key: args.key,
      createdAt: Date.now(),
    });
  },
});
