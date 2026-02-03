import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
    const base = (args.slug || args.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "team";
    let slug = base;
    let suffix = 1;
    while (
      await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      slug,
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
      return null;
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
      return null;
    }
    await requireTeamMember(ctx, team._id);
    return team;
  },
});
