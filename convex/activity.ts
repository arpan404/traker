import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireTeamMember } from "./lib/auth";
import { insertTeamEvent } from "./lib/teamEvents";
import type { Id } from "./_generated/dataModel";

export const logTeamEvent = mutation({
  args: {
    teamId: v.id("teams"),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireTeamMember(ctx, args.teamId);
    await insertTeamEvent(ctx, {
      teamId: args.teamId,
      actorId: userId,
      type: args.type,
      payload: args.payload,
    });
  },
});

export const listTeamEvents = query({
  args: {
    teamId: v.id("teams"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("teamEvents")
      .withIndex("by_teamId_createdAt", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(limit);
  },
});

export const listTeamEventsWithMembers = query({
  args: {
    teamId: v.id("teams"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const baseQuery = ctx.db
      .query("teamEvents")
      .withIndex("by_teamId_createdAt", (q) => q.eq("teamId", args.teamId))
      .order("desc");

    const events = await baseQuery.paginate(args.paginationOpts);

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    const memberByUserId = new Map(
      members.map((member) => [member.userId, member]),
    );

    const enriched = await Promise.all(
      events.page.map(async (event) => {
        let entity: {
          type: "Issue" | "Todo" | "Project" | "Page";
          id?: string;
          title?: string;
          key?: string;
        } | null = null;
        let change:
          | {
              label?: string;
              from?: string;
              to?: string;
              fields?: string[];
            }
          | null = null;

        if (
          event.type === "ISSUE_CREATED" ||
          event.type === "ISSUE_UPDATED" ||
          event.type === "ISSUE_STATUS_CHANGED" ||
          event.type === "ISSUE_COMMENTED"
        ) {
          const issueId = event.payload?.issueId as Id<"issues"> | undefined;
          const issue = issueId
            ? await ctx.db.get(issueId)
            : null;
          entity = {
            type: "Issue",
            id: issue?._id,
            title: issue?.title ?? event.payload?.title,
          };
          if (event.type === "ISSUE_STATUS_CHANGED") {
            change = {
              label: "Status",
              from: event.payload?.from as string | undefined,
              to: event.payload?.to as string | undefined,
            };
          } else if (event.type === "ISSUE_UPDATED") {
            change = {
              fields: (event.payload?.fields as string[] | undefined) ?? [],
            };
          }
        } else if (
          event.type === "TODO_CREATED" ||
          event.type === "TODO_UPDATED" ||
          event.type === "TODO_STATUS_CHANGED"
        ) {
          const todoId = event.payload?.todoId as Id<"todos"> | undefined;
          const todo = todoId ? await ctx.db.get(todoId) : null;
          entity = {
            type: "Todo",
            id: todo?._id,
            title: todo?.title ?? event.payload?.title,
          };
          if (event.type === "TODO_STATUS_CHANGED") {
            change = {
              label: "Status",
              from: event.payload?.from as string | undefined,
              to: event.payload?.to as string | undefined,
            };
          } else if (event.type === "TODO_UPDATED") {
            change = {
              fields: (event.payload?.fields as string[] | undefined) ?? [],
            };
          }
        } else if (event.type === "PROJECT_CREATED") {
          const projectId = event.payload?.projectId as
            | Id<"projects">
            | undefined;
          const project = projectId
            ? await ctx.db.get(projectId)
            : null;
          entity = {
            type: "Project",
            id: project?._id,
            title: project?.name ?? event.payload?.name,
            key: project?.key ?? event.payload?.key,
          };
        } else if (event.type === "PAGE_VIEW") {
          entity = {
            type: "Page",
            title: event.payload?.label ?? "Page",
          };
        }

        const member = event.actorId
          ? memberByUserId.get(event.actorId)
          : undefined;

        return {
          ...event,
          actor: member
            ? {
                userId: member.userId,
                fullName: member.fullName,
                avatarUrl: member.avatarUrl,
                role: member.role,
              }
            : null,
          entity,
          change,
        };
      }),
    );

    return {
      ...events,
      page: enriched,
    };
  },
});
