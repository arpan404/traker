import type { Id } from "@/convex/_generated/dataModel";
import type { Member, Todo } from "@/lib/types";
import { TodoStatusPill } from "@/components/todos/status-pill";
import { todoStatusData } from "@/components/todos/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PersonalProps = {
  variant: "personal";
  todos: Todo[];
  onToggle: (todoId: Id<"todos">) => void;
  onDelete: (todoId: Id<"todos">) => void;
};

type TeamProps = {
  variant: "team";
  todos: Todo[];
  members: Member[];
  memberLookup: Map<string, { name: string; avatar?: string }>;
  onToggle: (todoId: Id<"todos">) => void;
  onAssign: (todoId: Id<"todos">, assigneeId: string) => void;
  onDelete: (todoId: Id<"todos">) => void;
};

type TodosTableProps = PersonalProps | TeamProps;

export function TodosTable(props: TodosTableProps) {
  const hasAssignee = props.variant === "team";

  return (
    <div className="canvas-panel overflow-hidden border-[var(--border)] bg-[var(--card)]">
      <div
        className={`grid gap-4 border-b border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)] ${
          hasAssignee
            ? "grid-cols-[1fr_160px_120px_160px_120px]"
            : "grid-cols-[1fr_120px_120px_120px]"
        }`}
      >
        <span>Task</span>
        {hasAssignee ? <span>Assignee</span> : null}
        <span>Status</span>
        <span>Due Date</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {props.todos.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs text-[var(--muted-foreground)] font-medium">
            No todos found.
          </div>
        ) : (
          props.todos.map((todo) => (
            <div
              key={todo._id}
              className={`grid gap-4 px-4 py-3 items-center group hover:bg-[var(--muted)] transition-colors cursor-default ${
                hasAssignee
                  ? "grid-cols-[1fr_160px_120px_160px_120px]"
                  : "grid-cols-[1fr_120px_120px_120px]"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => props.onToggle(todo._id)}
                  className="flex items-center justify-center shrink-0 group/circle"
                >
                  <div
                    className="h-4 w-4 rounded-full border-[2.5px] border-[var(--status-text-color)] flex items-center justify-center"
                    data-status={todoStatusData(todo.status)}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-text-color)] opacity-0 group-hover/circle:opacity-100 transition-opacity" />
                    {todo.status === "Done" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-text-color)]" />
                    )}
                  </div>
                </button>
                <span className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {todo.title}
                </span>
              </div>
              {hasAssignee ? (
                <Select
                  value={todo.assigneeId || "unassigned"}
                  onValueChange={(value) =>
                    props.onAssign(todo._id, value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-transparent">
                    <SelectValue placeholder="Assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {props.members.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.fullName || "Teammate"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <div>
                <TodoStatusPill
                  status={todo.status}
                  className="text-[10px] px-2 py-0.5 rounded font-extrabold"
                />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] font-bold tabular-nums">
                {todo.dueDate
                  ? new Date(todo.dueDate).toLocaleDateString()
                  : "—"}
              </span>
              <div>
                <button
                  className="rounded-md border border-[var(--border)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/40 transition-colors"
                  onClick={() => props.onDelete(todo._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
