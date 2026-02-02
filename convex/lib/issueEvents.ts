import type { MutationCtx } from "./types";
import type { Id } from "../_generated/dataModel";

export const logIssueEvent = async (
  ctx: MutationCtx,
  args: {
    teamId: Id<"teams">;
    issueId: Id<"issues">;
    actorId?: string | null;
    type: string;
    payload: Record<string, unknown>;
  },
) => {
  await ctx.db.insert("issueEvents", {
    teamId: args.teamId,
    issueId: args.issueId,
    actorId: args.actorId ?? undefined,
    type: args.type,
    payload: args.payload,
    createdAt: Date.now(),
  });
};
