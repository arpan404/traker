import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId, requireRole, requireTeamMember } from "./lib/auth";
import { todoStatusValidator } from "./lib/validators";
import { insertTeamEvent } from "./lib/teamEvents";

export const listForTeam = query({
  args: {
    teamId: v.id("teams"),
    status: v.optional(todoStatusValidator),
    assigneeId: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const baseQuery = args.status
      ? ctx.db
        .query("todos")
        .withIndex("by_teamId_status", (q) =>
          q.eq("teamId", args.teamId).eq("status", args.status!),
        )
      : ctx.db
        .query("todos")
        .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId));

    let todos = (await baseQuery.collect()).filter(
      (todo) => todo.scope === "TEAM",
    );

    if (args.assigneeId) {
      if (args.assigneeId === "unassigned") {
        todos = todos.filter((todo) => !todo.assigneeId);
      } else {
        todos = todos.filter((todo) => todo.assigneeId === args.assigneeId);
      }
    }
    if (args.search) {
      const term = args.search.toLowerCase();
      todos = todos.filter((todo) => todo.title.toLowerCase().includes(term));
    }

    return todos.sort(
      (a, b) =>
        (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
    );
  },
});

export const listForUser = query({
  args: {
    status: v.optional(todoStatusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const baseQuery = args.status
      ? ctx.db
        .query("todos")
        .withIndex("by_ownerUserId_status", (q) =>
          q.eq("ownerUserId", userId).eq("status", args.status!),
        )
      : ctx.db
        .query("todos")
        .withIndex("by_ownerUserId", (q) => q.eq("ownerUserId", userId));

    let todos = (await baseQuery.collect()).filter(
      (todo) => todo.scope === "PERSONAL",
    );
    if (args.search) {
      const term = args.search.toLowerCase();
      todos = todos.filter((todo) => todo.title.toLowerCase().includes(term));
    }
    return todos.sort(
      (a, b) =>
        (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
    );
  },
});

export const createTeamTodo = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    assigneeId: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.optional(todoStatusValidator),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, args.teamId, "MEMBER");
    const now = Date.now();
    const todoId = await ctx.db.insert("todos", {
      scope: "TEAM",
      teamId: args.teamId,
      title: args.title,
      status: args.status ?? "Todo",
      assigneeId: args.assigneeId,
      dueDate: args.dueDate,
      order: now,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
    await insertTeamEvent(ctx, {
      teamId: args.teamId,
      actorId: userId,
      type: "TODO_CREATED",
      payload: { todoId, title: args.title },
    });
    return todoId;
  },
});

export const createPersonalTodo = mutation({
  args: {
    title: v.string(),
    dueDate: v.optional(v.number()),
    status: v.optional(todoStatusValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const now = Date.now();
    return ctx.db.insert("todos", {
      scope: "PERSONAL",
      ownerUserId: userId,
      title: args.title,
      status: args.status ?? "Todo",
      createdByUserId: userId,
      dueDate: args.dueDate,
      order: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    todoId: v.id("todos"),
    patch: v.object({
      title: v.optional(v.string()),
      status: v.optional(todoStatusValidator),
      assigneeId: v.optional(v.string()),
      dueDate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new ConvexError("Todo not found");
    }
    let actorId: string | undefined;
    if (todo.scope === "TEAM") {
      const auth = await requireRole(ctx, todo.teamId!, "MEMBER");
      actorId = auth.userId;
    } else {
      const userId = await getCurrentUserId(ctx);
      if (todo.ownerUserId !== userId) {
        throw new ConvexError("Unauthorized");
      }
    }

    await ctx.db.patch(todo._id, {
      ...args.patch,
      updatedAt: Date.now(),
    });

    if (todo.scope === "TEAM") {
      const changedFields: string[] = [];
      if (args.patch.title && args.patch.title !== todo.title) {
        changedFields.push("title");
      }
      if (args.patch.status && args.patch.status !== todo.status) {
        changedFields.push("status");
      }
      if (args.patch.assigneeId !== undefined && args.patch.assigneeId !== todo.assigneeId) {
        changedFields.push("assignee");
      }
      if (args.patch.dueDate !== undefined && args.patch.dueDate !== todo.dueDate) {
        changedFields.push("dueDate");
      }

      if (changedFields.length > 0) {
        await insertTeamEvent(ctx, {
          teamId: todo.teamId!,
          actorId,
          type: "TODO_UPDATED",
          payload: {
            todoId: todo._id,
            title: args.patch.title ?? todo.title,
            fields: changedFields,
          },
        });
      }
    }
  },
});

export const toggleStatus = mutation({
  args: {
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new ConvexError("Todo not found");
    }
    let actorId: string | undefined;
    if (todo.scope === "TEAM") {
      const auth = await requireRole(ctx, todo.teamId!, "MEMBER");
      actorId = auth.userId;
    } else {
      const userId = await getCurrentUserId(ctx);
      if (todo.ownerUserId !== userId) {
        throw new ConvexError("Unauthorized");
      }
    }

    const nextStatus =
      todo.status === "Todo"
        ? "In Progress"
        : todo.status === "In Progress"
          ? "Done"
          : "Todo";

    await ctx.db.patch(todo._id, {
      status: nextStatus,
      updatedAt: Date.now(),
    });

    if (todo.scope === "TEAM") {
      await insertTeamEvent(ctx, {
        teamId: todo.teamId!,
        actorId,
        type: "TODO_STATUS_CHANGED",
        payload: {
          todoId: todo._id,
          title: todo.title,
          from: todo.status,
          to: nextStatus,
        },
      });
    }
  },
});

export const reorder = mutation({
  args: {
    todoId: v.id("todos"),
    status: todoStatusValidator,
    beforeId: v.optional(v.id("todos")),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new ConvexError("Todo not found");
    }

    let actorId: string | undefined;
    if (todo.scope === "TEAM") {
      const auth = await requireRole(ctx, todo.teamId!, "MEMBER");
      actorId = auth.userId;
    } else {
      const userId = await getCurrentUserId(ctx);
      if (todo.ownerUserId !== userId) {
        throw new ConvexError("Unauthorized");
      }
    }

    const targetStatus = args.status;
    const baseQuery =
      todo.scope === "TEAM"
        ? ctx.db
            .query("todos")
            .withIndex("by_teamId_status", (q) =>
              q.eq("teamId", todo.teamId!).eq("status", targetStatus),
            )
        : ctx.db
            .query("todos")
            .withIndex("by_ownerUserId_status", (q) =>
              q.eq("ownerUserId", todo.ownerUserId!).eq("status", targetStatus),
            );

    const targetTodos = (await baseQuery.collect()).filter(
      (item) => item.scope === todo.scope,
    );

    const sorted = targetTodos
      .filter((item) => item._id !== todo._id)
      .sort(
        (a, b) =>
          (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
      );

    let newOrder: number;
    if (args.beforeId) {
      const beforeIndex = sorted.findIndex((item) => item._id === args.beforeId);
      const beforeItem = beforeIndex >= 0 ? sorted[beforeIndex] : null;
      const prevItem = beforeIndex > 0 ? sorted[beforeIndex - 1] : null;
      const beforeOrder = beforeItem?.order ?? beforeItem?.createdAt ?? Date.now();
      const prevOrder = prevItem?.order ?? prevItem?.createdAt;
      newOrder = prevOrder !== undefined ? (prevOrder + beforeOrder) / 2 : beforeOrder - 1;
    } else {
      const last = sorted.at(-1);
      const lastOrder = last ? (last.order ?? last.createdAt) : Date.now();
      newOrder = lastOrder + 1;
    }

    const statusChanged = todo.status !== targetStatus;
    await ctx.db.patch(todo._id, {
      status: targetStatus,
      order: newOrder,
      updatedAt: Date.now(),
    });

    if (todo.scope === "TEAM" && statusChanged) {
      await insertTeamEvent(ctx, {
        teamId: todo.teamId!,
        actorId,
        type: "TODO_STATUS_CHANGED",
        payload: {
          todoId: todo._id,
          title: todo.title,
          from: todo.status,
          to: targetStatus,
        },
      });
    }
  },
});
