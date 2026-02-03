"use client";

import { Loader } from "@/components/ui/loader";
import { CreateTodoDialog } from "@/components/team-todos/create-todo-dialog";
import { TodosHeader } from "@/components/todos/todos-header";
import { TodosToolbar } from "@/components/todos/todos-toolbar";
import { TodosKanban } from "@/components/todos/todos-kanban";
import { TodosTable } from "@/components/todos/todos-table";
import { useTeamTodosModel } from "@/hooks/use-team-todos-model";

export default function TeamTodosPage() {
  const model = useTeamTodosModel();

  if (!model.isReady) {
    return <Loader centered size="lg" />;
  }

  return (
    <section className="grid gap-6 max-w-[1400px] mx-auto">
      <TodosHeader
        title="Team Todos"
        description="Assign work, track progress, and keep everyone aligned."
        actionLabel="New Todo"
        onNew={() => model.setShowCreate(true)}
      />

      <TodosToolbar
        view={model.view}
        status={model.filters.status}
        search={model.filters.search}
        onViewChange={model.setView}
        onStatusChange={(value) => model.updateFilters({ status: value })}
        onSearchChange={(value) => model.updateFilters({ search: value })}
        members={model.members}
        assigneeId={model.filters.assigneeId}
        currentUserId={model.user?.id}
        onAssigneeChange={(value) => model.updateFilters({ assigneeId: value })}
      />

      {model.view === "kanban" ? (
        <TodosKanban
          variant="team"
          todosByStatus={model.todosByStatus}
          members={model.members}
          memberLookup={model.memberLookup}
          onAdvance={(todoId) => model.toggleStatus({ todoId })}
          onAssign={model.setAssignee}
          onDragStart={model.handleDragStart}
          onDrop={model.handleDrop}
          onDropOnCard={model.handleDropOnCard}
          onNew={model.openCreate}
        />
      ) : (
        <TodosTable
          variant="team"
          todos={model.todos}
          members={model.members}
          memberLookup={model.memberLookup}
          onToggle={(todoId) => model.toggleStatus({ todoId })}
          onAssign={model.setAssignee}
        />
      )}

      <CreateTodoDialog
        open={model.showCreate}
        draft={model.draft}
        members={model.members}
        onOpenChange={model.setShowCreate}
        onDraftChange={model.updateDraft}
        onSubmit={model.handleCreate}
      />
    </section>
  );
}
