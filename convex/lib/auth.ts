import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./types";
import type { Id } from "../_generated/dataModel";
import { isRoleAtLeast } from "./roles";
import type { Role } from "./validators";

type Ctx = MutationCtx | QueryCtx;

export const getCurrentUserId = async (ctx: Ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new ConvexError("Unauthenticated");
  }
  return identity.subject;
};

export const requireTeamMember = async (ctx: Ctx, teamId: Id<"teams">) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new ConvexError("Unauthenticated");
  }
  const userId = identity.subject;
  const fullName = identity.name;
  const avatarUrl = identity.pictureUrl;

  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_teamId_userId", (q) =>
      q.eq("teamId", teamId).eq("userId", userId),
    )
    .unique();

  if (!member) {
    throw new ConvexError("Not a team member");
  }

  // Sync metadata if changed (only in mutation context)
  if ("patch" in ctx.db && (member.fullName !== fullName || member.avatarUrl !== avatarUrl)) {
    await ctx.db.patch(member._id, { fullName, avatarUrl });
  }

  return { userId, member };
};

export const requireRole = async (
  ctx: Ctx,
  teamId: Id<"teams">,
  minimumRole: Role,
) => {
  const { userId, member } = await requireTeamMember(ctx, teamId);
  if (!isRoleAtLeast(member.role as Role, minimumRole)) {
    throw new ConvexError("Insufficient role");
  }
  return { userId, member };
};
