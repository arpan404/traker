"use client";

import { Loader } from "@/components/ui/loader";
import { CreateTodoDialog } from "@/components/personal-todos/create-todo-dialog";
import { TodosHeader } from "@/components/todos/todos-header";
import { TodosKanban } from "@/components/todos/todos-kanban";
import { TodosTable } from "@/components/todos/todos-table";
import { TodosToolbar } from "@/components/todos/todos-toolbar";
import { usePersonalTodosModel } from "@/hooks/use-personal-todos-model";

export default function PersonalTodosPage() {
  const model = usePersonalTodosModel();

  if (!model.isReady) {
    return <Loader centered size="lg" />;
  }

  return (
    <>
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <TodosHeader
          title="Personal Todos"
          description="Manage your personal tasks and priorities in a focused view."
          actionLabel="New Todo"
          onNew={() => model.openCreate()}
        />

        <TodosToolbar
          view={model.view}
          status={model.filters.status}
          search={model.filters.search}
          onViewChange={model.setView}
          onStatusChange={(value) => model.updateFilters({ status: value })}
          onSearchChange={(value) => model.updateFilters({ search: value })}
        />

        {model.view === "kanban" ? (
          <TodosKanban
            variant="personal"
            todosByStatus={model.todosByStatus}
            onDrop={model.handleDrop}
            onDragStart={model.handleDragStart}
            onToggle={(todoId) => model.toggleStatus({ todoId })}
            onDropOnCard={model.handleDropOnCard}
            onNew={model.openCreate}
          />
        ) : (
          <TodosTable
            variant="personal"
            todos={model.todos}
            onToggle={(todoId) => model.toggleStatus({ todoId })}
          />
        )}
      </div>

      <CreateTodoDialog
        open={model.showCreate}
        draft={model.draft}
        onOpenChange={model.setShowCreate}
        onDraftChange={model.updateDraft}
        onSubmit={model.handleCreate}
      />
    </>
  );
}
