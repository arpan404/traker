import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";

export const heartbeat = mutation({
  args: {
    teamId: v.id("teams"),
    activity: v.optional(v.string()),
    location: v.optional(v.string()),
    cursorX: v.optional(v.number()),
    cursorY: v.optional(v.number()),
    isEditing: v.optional(v.boolean()),
    editingTarget: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireTeamMember(ctx, args.teamId);
    const now = Date.now();
    const existing = await ctx.db
      .query("teamPresence")
      .withIndex("by_teamId_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId),
      )
      .unique();

    if (existing) {
      const patch: Record<string, unknown> = {
        lastSeen: now,
      };
      if (args.activity !== undefined) patch.activity = args.activity;
      if (args.location !== undefined) patch.location = args.location;
      if (args.cursorX !== undefined) patch.cursorX = args.cursorX;
      if (args.cursorY !== undefined) patch.cursorY = args.cursorY;
      if (args.isEditing !== undefined) patch.isEditing = args.isEditing;
      if (args.editingTarget !== undefined)
        patch.editingTarget = args.editingTarget;

      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("teamPresence", {
      teamId: args.teamId,
      userId,
      lastSeen: now,
      activity: args.activity,
      location: args.location,
      cursorX: args.cursorX,
      cursorY: args.cursorY,
      isEditing: args.isEditing,
      editingTarget: args.editingTarget,
    });
  },
});

export const listActive = query({
  args: {
    teamId: v.id("teams"),
    sinceMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const now = Date.now();
    const cutoff = now - (args.sinceMs ?? 60_000);

    const presence = await ctx.db
      .query("teamPresence")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const activePresence = presence
      .filter((entry) => entry.lastSeen >= cutoff)
      .sort((a, b) => b.lastSeen - a.lastSeen);

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    const memberByUserId = new Map(
      members.map((member) => [member.userId, member]),
    );

    return activePresence.map((entry) => {
      const member = memberByUserId.get(entry.userId);
      return {
        userId: entry.userId,
        lastSeen: entry.lastSeen,
        activity: entry.activity,
        location: entry.location,
        cursorX: entry.cursorX,
        cursorY: entry.cursorY,
        isEditing: entry.isEditing,
        editingTarget: entry.editingTarget,
        fullName: member?.fullName,
        avatarUrl: member?.avatarUrl,
        role: member?.role,
      };
    });
  },
});
