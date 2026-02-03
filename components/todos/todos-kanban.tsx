import { useState, type DragEvent } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { TODO_STATUSES, TODO_STATUS_TONE_PERSONAL } from "@/lib/constants";
import type { Member, Todo, TodoStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TodoCard } from "@/components/todos/todo-card";

type PersonalProps = {
  variant: "personal";
  todosByStatus: Record<TodoStatus, Todo[]>;
  onDrop: (status: TodoStatus, event: DragEvent) => void;
  onDragStart: (event: DragEvent, todoId: Id<"todos">) => void;
  onToggle: (todoId: Id<"todos">) => void;
  onNew: (status: TodoStatus) => void;
  onDropOnCard: (targetId: Id<"todos">, status: TodoStatus, event: DragEvent) => void;
};

type TeamProps = {
  variant: "team";
  todosByStatus: Record<TodoStatus, Todo[]>;
  members: Member[];
  memberLookup: Map<string, { name: string; avatar?: string }>;
  onAdvance: (todoId: Id<"todos">) => void;
  onAssign: (todoId: Id<"todos">, assigneeId: string) => void;
  onNew: (status: TodoStatus) => void;
  onDrop: (status: TodoStatus, event: DragEvent) => void;
  onDragStart: (event: DragEvent, todoId: Id<"todos">) => void;
  onDropOnCard: (targetId: Id<"todos">, status: TodoStatus, event: DragEvent) => void;
};

type TodosKanbanProps = PersonalProps | TeamProps;

export function TodosKanban(props: TodosKanbanProps) {
  const [dropTargetId, setDropTargetId] = useState<Id<"todos"> | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto pb-4">
      {TODO_STATUSES.map((status) => {
        const items = props.todosByStatus[status] ?? [];
        return (
          <Card
            key={status}
            className="glass-panel border-none shadow-xl flex flex-col min-w-[340px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              setDropTargetId(null);
              props.onDrop(status, event);
            }}
          >
            <CardHeader className="flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Badge className={TODO_STATUS_TONE_PERSONAL[status]}>
                  {status}
                </Badge>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {items.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {items.length === 0 ? (
                <div className="glass-panel border-dashed border-white/10 bg-white/5 px-3 py-8 text-center text-xs text-[var(--muted-foreground)] opacity-60">
                  No todos here yet
                </div>
              ) : (
                items.map((todo) =>
                  props.variant === "team" ? (
                    <TodoCard
                      key={todo._id}
                      variant="team"
                      todo={todo}
                      members={props.members}
                      assignee={
                        todo.assigneeId
                          ? props.memberLookup.get(todo.assigneeId)
                          : undefined
                      }
                      onAdvance={props.onAdvance}
                      onAssign={props.onAssign}
                      onDragStart={props.onDragStart}
                      onDropOnCard={(event, targetId) =>
                        props.onDropOnCard(targetId, status, event)
                      }
                      isDropTarget={dropTargetId === todo._id}
                      onDragEnter={() => setDropTargetId(todo._id)}
                      onDragLeave={() =>
                        setDropTargetId((current) =>
                          current === todo._id ? null : current,
                        )
                      }
                    />
                  ) : (
                    <TodoCard
                      key={todo._id}
                      variant="personal"
                      todo={todo}
                      onToggle={props.onToggle}
                      onDragStart={props.onDragStart}
                      onDropOnCard={(event, targetId) =>
                        props.onDropOnCard(targetId, status, event)
                      }
                      isDropTarget={dropTargetId === todo._id}
                      onDragEnter={() => setDropTargetId(todo._id)}
                      onDragLeave={() =>
                        setDropTargetId((current) =>
                          current === todo._id ? null : current,
                        )
                      }
                    />
                  ),
                )
              )}
              <button
                className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-bold text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 transition-colors w-full text-left mt-1"
                onClick={() => props.onNew(status)}
              >
                <span className="text-lg font-light opacity-60">+</span>
                New todo
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
