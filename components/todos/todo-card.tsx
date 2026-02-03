import { Calendar, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TODO_STATUS_TONE_PERSONAL, TODO_STATUS_TONE_TEAM } from "@/lib/constants";
import type { Member, Todo } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";
import { todoStatusData } from "@/components/todos/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PersonalProps = {
  variant: "personal";
  todo: Todo;
  onToggle: (todoId: Id<"todos">) => void;
  onDragStart: (event: React.DragEvent, todoId: Id<"todos">) => void;
  onDropOnCard?: (event: React.DragEvent, targetId: Id<"todos">) => void;
  isDropTarget?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDelete: (todoId: Id<"todos">) => void;
};

type TeamProps = {
  variant: "team";
  todo: Todo;
  members: Member[];
  assignee?: { name: string; avatar?: string };
  onAdvance: (todoId: Id<"todos">) => void;
  onAssign: (todoId: Id<"todos">, assigneeId: string) => void;
  onDragStart?: (event: React.DragEvent, todoId: Id<"todos">) => void;
  onDropOnCard?: (event: React.DragEvent, targetId: Id<"todos">) => void;
  isDropTarget?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDelete: (todoId: Id<"todos">) => void;
};

type TodoCardProps = PersonalProps | TeamProps;

export function TodoCard(props: TodoCardProps) {
  const { todo } = props;
  const tone =
    props.variant === "team" ? TODO_STATUS_TONE_TEAM : TODO_STATUS_TONE_PERSONAL;
  const dueLabel = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString()
    : null;

  if (props.variant === "team") {
    const assigneeFirstName = props.assignee?.name?.split(" ")[0];
    return (
    <Card
      className={`glass-panel relative border-white/5 bg-white/5 shadow-md hover:shadow-lg transition-all ${
        props.isDropTarget
          ? "ring-2 ring-[var(--accent)]/80 shadow-[0_0_0_1px_var(--accent)] scale-[1.01]"
          : ""
      }`}
      draggable={!!props.onDragStart}
      onDragStart={
        props.onDragStart
          ? (event) => {
              event.dataTransfer.setData("todoId", todo._id);
              event.dataTransfer.setData("todoStatus", todo.status);
              props.onDragStart?.(event, todo._id);
            }
          : undefined
      }
      onDragOver={props.onDropOnCard ? (event) => event.preventDefault() : undefined}
      onDragEnter={props.onDragEnter}
      onDragLeave={props.onDragLeave}
      onDrop={
        props.onDropOnCard
          ? (event) => props.onDropOnCard?.(event, todo._id)
          : undefined
      }
    >
        <CardContent className="grid gap-3 pt-4">
        {props.isDropTarget ? (
          <div className="pointer-events-none absolute -top-2 left-3 right-3 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        ) : null}
        <div className="flex items-start justify-between gap-2">
            <div>
            <p className="text-sm font-semibold text-[var(--foreground)] line-clamp-3 break-words">
              {todo.title}
            </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                {props.assignee ? (
                  <>
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={props.assignee.avatar} alt={props.assignee.name} />
                      <AvatarFallback className="text-[9px] font-semibold">
                        {assigneeFirstName?.substring(0, 1) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="opacity-80">{assigneeFirstName}</span>
                  </>
                ) : (
                  <span className="opacity-60">Unassigned</span>
                )}
              </div>
            </div>
            <Badge className={tone[todo.status]}>{todo.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Calendar className="h-4 w-4" />
            <span>{dueLabel ? `Due ${dueLabel}` : "No due date"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => props.onAdvance(todo._id)}>
              {todo.status === "Done" ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Circle className="mr-2 h-4 w-4" />
              )}
              Advance
            </Button>
            <Select
              value={todo.assigneeId || "unassigned"}
              onValueChange={(value) => props.onAssign(todo._id, value)}
            >
              <SelectTrigger className="w-[160px]">
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
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onDelete(todo._id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`glass-panel relative border-white/5 bg-white/5 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${
        props.isDropTarget
          ? "ring-2 ring-[var(--accent)]/80 shadow-[0_0_0_1px_var(--accent)] scale-[1.01]"
          : ""
      }`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("todoId", todo._id);
        event.dataTransfer.setData("todoStatus", todo.status);
        props.onDragStart(event, todo._id);
      }}
      onDragOver={props.onDropOnCard ? (event) => event.preventDefault() : undefined}
      onDragEnter={props.onDragEnter}
      onDragLeave={props.onDragLeave}
      onDrop={
        props.onDropOnCard
          ? (event) => props.onDropOnCard?.(event, todo._id)
          : undefined
      }
    >
      {props.isDropTarget ? (
        <div className="pointer-events-none absolute -top-2 left-3 right-3 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
      ) : null}
      <CardContent className="flex items-start gap-3 pt-4">
        <button
          onClick={() => props.onToggle(todo._id)}
          className="mt-1 flex items-center justify-center shrink-0 group/circle"
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
        <div className="space-y-3 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)] line-clamp-3 break-words">
            {todo.title}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Calendar className="h-4 w-4" />
              <span>{dueLabel ? `Due ${dueLabel}` : "No due date"}</span>
            </div>
            <Badge className={tone[todo.status]}>{todo.status}</Badge>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onDelete(todo._id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
