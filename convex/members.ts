import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";
import { roleValidator } from "./lib/validators";

export const list = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const updateRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "OWNER");
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new ConvexError("Team not found");
    }
    if (team.ownerUserId === args.userId && args.role !== "OWNER") {
      throw new ConvexError("Cannot change owner role");
    }

    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .unique();
    if (!member) {
      throw new ConvexError("Member not found");
    }

    await ctx.db.patch(member._id, { role: args.role });
  },
});

export const remove = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "ADMIN");
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new ConvexError("Team not found");
    }
    if (team.ownerUserId === args.userId) {
      throw new ConvexError("Cannot remove owner");
    }

    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .unique();
    if (!member) {
      throw new ConvexError("Member not found");
    }

    await ctx.db.delete(member._id);
  },
});

export const getMyRole = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const { member } = await requireTeamMember(ctx, args.teamId);
    return member.role;
  },
});
