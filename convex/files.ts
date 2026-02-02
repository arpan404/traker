import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireRole, requireTeamMember } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "MEMBER");
    return ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    issueId: v.optional(v.id("issues")),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, args.teamId, "MEMBER");
    return ctx.db.insert("files", {
      teamId: args.teamId,
      issueId: args.issueId,
      uploaderId: userId,
      storageId: args.storageId,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: Date.now(),
    });
  },
});

export const attachToIssue = mutation({
  args: {
    fileId: v.id("files"),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    await requireRole(ctx, issue.teamId, "MEMBER");

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }
    if (file.teamId !== issue.teamId) {
      throw new ConvexError("Cross-team file attach not allowed");
    }

    await ctx.db.patch(file._id, { issueId: issue._id });
  },
});

export const listForIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new ConvexError("Issue not found");
    }
    await requireTeamMember(ctx, issue.teamId);
    return ctx.db
      .query("files")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
  },
});

export const getUrl = query({
  args: { teamId: v.id("teams"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const file = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique();
    if (!file || file.teamId !== args.teamId) {
      throw new ConvexError("File not found");
    }
    return ctx.storage.getUrl(args.storageId);
  },
});
