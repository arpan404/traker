import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId, requireRole } from "./lib/auth";
import { roleValidator } from "./lib/validators";

const TOKEN_BYTES = 32;
const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hashToken = async (token: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
};

const randomToken = () => {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, args.teamId, "ADMIN");
    const token = randomToken();
    const tokenHash = await hashToken(token);
    const now = Date.now();
    const expiresAt = now + INVITE_TTL_MS;

    await ctx.db.insert("teamInvites", {
      teamId: args.teamId,
      email: args.email.toLowerCase(),
      role: args.role,
      tokenHash,
      expiresAt,
      createdByUserId: userId,
      createdAt: now,
    });

    return { token, expiresAt };
  },
});

export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenHash = await hashToken(args.token);
    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!invite) {
      return { valid: false, reason: "invalid" };
    }

    if (invite.acceptedAt) {
      return { valid: false, reason: "accepted" };
    }

    if (invite.expiresAt < Date.now()) {
      return { valid: false, reason: "expired" };
    }

    const team = await ctx.db.get(invite.teamId);

    return {
      valid: true,
      teamId: invite.teamId,
      teamSlug: team?.slug,
      teamName: team?.name,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    };
  },
});

export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const tokenHash = await hashToken(args.token);
    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!invite) {
      return { status: "invalid" as const };
    }
    if (invite.acceptedAt) {
      const team = await ctx.db.get(invite.teamId);
      return {
        status: "accepted" as const,
        teamId: invite.teamId,
        teamSlug: team?.slug,
      };
    }
    if (invite.expiresAt < Date.now()) {
      return { status: "expired" as const };
    }

    const existingMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q) =>
        q.eq("teamId", invite.teamId).eq("userId", userId),
      )
      .unique();

    if (existingMember) {
      await ctx.db.patch(invite._id, { acceptedAt: Date.now() });
      const team = await ctx.db.get(invite.teamId);
      return {
        status: "already_member" as const,
        teamId: invite.teamId,
        teamSlug: team?.slug,
      };
    }

    await ctx.db.insert("teamMembers", {
      teamId: invite.teamId,
      userId,
      role: invite.role,
      joinedAt: Date.now(),
    });

    await ctx.db.patch(invite._id, { acceptedAt: Date.now() });

    const team = await ctx.db.get(invite.teamId);
    return {
      status: "accepted" as const,
      teamId: invite.teamId,
      teamSlug: team?.slug,
    };
  },
});

export const list = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.teamId, "ADMIN");
    const now = Date.now();
    const invites = await ctx.db
      .query("teamInvites")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    return invites.filter((invite) => !invite.acceptedAt && invite.expiresAt > now);
  },
});

export const cancel = mutation({
  args: { inviteId: v.id("teamInvites") },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) return;
    await requireRole(ctx, invite.teamId, "ADMIN");
    await ctx.db.delete(args.inviteId);
  },
});
