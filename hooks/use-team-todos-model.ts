import { useMemo, useState, type DragEvent } from "react";
import { useParams } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";

import { api } from "@/convex/_generated/api";
import { TODO_STATUSES } from "@/lib/constants";
import type { TodoStatus } from "@/lib/types";
import type { TeamTodoDraft as TodoDraft, TeamTodoFilters as TodoFilters } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";
import type { Todo } from "@/lib/types";

const DEFAULT_FILTERS: TodoFilters = {
  status: "all",
  assigneeId: "all",
  search: "",
};

const DEFAULT_DRAFT: TodoDraft = {
  title: "",
  assigneeId: "unassigned",
  dueDate: "",
};

export function useTeamTodosModel() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const skip = "skip" as const;

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<TodoDraft>(DEFAULT_DRAFT);

  const team = useQuery(
    api.teams.getBySlug,
    slug && isAuthenticated ? { slug } : skip,
  );
  const members = useQuery(
    api.members.list,
    team ? { teamId: team._id } : skip,
  );
  const todos = useQuery(
    api.todos.listForTeam,
    team
      ? {
          teamId: team._id,
          status: (filters.status === "all" ? undefined : filters.status) as
            | TodoStatus
            | undefined,
          assigneeId:
            filters.assigneeId === "all" ? undefined : filters.assigneeId,
          search: filters.search || undefined,
        }
      : skip,
  );

  const createTodo = useMutation(api.todos.createTeamTodo);
  const updateTodo = useMutation(api.todos.update);
  const toggleStatus = useMutation(api.todos.toggleStatus);
  const reorderTodo = useMutation(api.todos.reorder);

  const memberLookup = useMemo(() => {
    const map = new Map<string, { name: string; avatar?: string }>();
    (members ?? []).forEach((member) => {
      map.set(member.userId, {
        name: member.fullName || "Teammate",
        avatar: member.avatarUrl || undefined,
      });
    });
    return map;
  }, [members]);

  const safeTodos: Todo[] = todos ?? [];
  const todosByStatus = useMemo(
    () =>
      TODO_STATUSES.reduce<Record<TodoStatus, Todo[]>>((acc, status) => {
        acc[status] = safeTodos.filter((todo) => todo.status === status);
        return acc;
      }, {} as Record<TodoStatus, Todo[]>),
    [safeTodos],
  );

  const isReady = !isLoading && isAuthenticated && team && members && todos;

  const handleCreate = async () => {
    const title = draft.title.trim();
    if (!title || !team) return;
    const dueDate =
      draft.dueDate.trim().length > 0
        ? new Date(`${draft.dueDate}T00:00:00`).getTime()
        : undefined;
    await createTodo({
      teamId: team._id,
      title,
      assigneeId:
        draft.assigneeId === "unassigned" ? undefined : draft.assigneeId,
      dueDate,
    });
    setDraft(DEFAULT_DRAFT);
    setShowCreate(false);
  };

  const handleDrop = async (status: TodoStatus, event: DragEvent) => {
    event.preventDefault();
    const todoId = event.dataTransfer.getData("todoId") as Id<"todos">;
    if (!todoId) return;
    await reorderTodo({ todoId, status });
  };

  const handleDropOnCard = async (
    targetId: Id<"todos">,
    status: TodoStatus,
    event: DragEvent,
  ) => {
    event.preventDefault();
    const todoId = event.dataTransfer.getData("todoId") as Id<"todos">;
    if (!todoId || todoId === targetId) return;
    await reorderTodo({ todoId, status, beforeId: targetId });
  };

  const handleDragStart = (_event: DragEvent, _todoId: Id<"todos">) => {};

  const updateDraft = (patch: Partial<TodoDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateFilters = (patch: Partial<TodoFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const openCreate = () => {
    setShowCreate(true);
  };

  const setAssignee = (todoId: Id<"todos">, assigneeId: string) =>
    updateTodo({
      todoId,
      patch: {
        assigneeId: assigneeId === "unassigned" ? undefined : assigneeId,
      },
    });

  return {
    user,
    team,
    members: members ?? [],
    todos: todos ?? [],
    filters,
    view,
    setView,
    draft,
    showCreate,
    setShowCreate,
    updateDraft,
    updateFilters,
    openCreate,
    memberLookup,
    todosByStatus,
    toggleStatus,
    setAssignee,
    handleDragStart,
    handleDrop,
    handleDropOnCard,
    handleCreate,
    isReady,
  };
}
