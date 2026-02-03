import { useMemo, useState, type DragEvent } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TODO_STATUSES } from "@/lib/constants";
import type { TodoStatus } from "@/lib/types";
import type { PersonalTodoDraft as TodoDraft, PersonalTodoFilters as TodoFilters, Todo } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

const DEFAULT_FILTERS: TodoFilters = {
  status: "all",
  search: "",
};

const DEFAULT_DRAFT: TodoDraft = {
  title: "",
  dueDate: "",
  status: "Todo",
};

export function usePersonalTodosModel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<TodoDraft>(DEFAULT_DRAFT);

  const todos = useQuery(
    api.todos.listForUser,
    isAuthenticated
      ? {
          status: (filters.status === "all" ? undefined : filters.status) as
            | TodoStatus
            | undefined,
          search: filters.search || undefined,
        }
      : "skip",
  );

  const createTodo = useMutation(api.todos.createPersonalTodo);
  const toggleStatus = useMutation(api.todos.toggleStatus);
  const updateTodoStatus = useMutation(api.todos.update);
  const reorderTodo = useMutation(api.todos.reorder);

  const safeTodos: Todo[] = todos ?? [];
  const todosByStatus = useMemo(() => {
    return TODO_STATUSES.reduce<Record<TodoStatus, Todo[]>>((acc, status) => {
      acc[status] = safeTodos.filter((todo) => todo.status === status);
      return acc;
    }, {} as Record<TodoStatus, Todo[]>);
  }, [safeTodos]);

  const isReady = !isLoading && isAuthenticated && !!todos;

  const updateFilters = (patch: Partial<TodoFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const updateDraft = (patch: Partial<TodoDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const openCreate = (status?: TodoStatus) => {
    setDraft({ ...DEFAULT_DRAFT, status: status ?? "Todo" });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    const title = draft.title.trim();
    if (!title) return;
    const dueDate =
      draft.dueDate.trim().length > 0
        ? new Date(`${draft.dueDate}T00:00:00`).getTime()
        : undefined;
    await createTodo({ title, dueDate, status: draft.status });
    setDraft(DEFAULT_DRAFT);
    setShowCreate(false);
  };

  const handleDragStart = (event: DragEvent, todoId: Id<"todos">) => {
    event.dataTransfer.setData("todoId", todoId);
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

  return {
    isReady,
    view,
    setView,
    filters,
    updateFilters,
    todos: todos ?? [],
    todosByStatus,
    showCreate,
    setShowCreate,
    openCreate,
    draft,
    updateDraft,
    handleCreate,
    toggleStatus,
    handleDragStart,
    handleDrop,
    handleDropOnCard,
  };
}
