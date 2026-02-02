import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserId, requireTeamMember } from "./lib/auth";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        return team
          ? {
              team,
              role: membership.role,
            }
          : null;
      }),
    );

    return teams.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new ConvexError("Team slug already exists");
    }

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      slug: args.slug,
      ownerUserId: userId,
      createdAt: now,
    });

    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "OWNER",
      joinedAt: now,
    });

    return teamId;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!team) {
      throw new ConvexError("Team not found");
    }

    await requireTeamMember(ctx, team._id);
    return team;
  },
});

export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new ConvexError("Team not found");
    }
    await requireTeamMember(ctx, team._id);
    return team;
  },
});
