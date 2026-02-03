import type { MutationCtx } from "./types";
import type { Id } from "../_generated/dataModel";

export const insertTeamEvent = async (
  ctx: MutationCtx,
  args: {
    teamId: Id<"teams">;
    actorId?: string | null;
    type: string;
    payload: Record<string, unknown>;
  },
) => {
  await ctx.db.insert("teamEvents", {
    teamId: args.teamId,
    actorId: args.actorId ?? undefined,
    type: args.type,
    payload: args.payload,
    createdAt: Date.now(),
  });
};
