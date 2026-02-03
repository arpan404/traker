import { Columns, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TODO_STATUSES } from "@/lib/constants";
import type { Member } from "@/lib/types";

interface TodosToolbarBaseProps {
  view: "kanban" | "table";
  status: string;
  search: string;
  onViewChange: (view: "kanban" | "table") => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (value: string) => void;
}

type TodosToolbarProps = TodosToolbarBaseProps &
  (
    | {
        members?: undefined;
        assigneeId?: undefined;
        currentUserId?: undefined;
        onAssigneeChange?: undefined;
      }
    | {
        members: Member[];
        assigneeId: string;
        currentUserId?: string;
        onAssigneeChange: (value: string) => void;
      }
  );

const isTeamToolbar = (
  props: TodosToolbarProps,
): props is TodosToolbarBaseProps & {
  members: Member[];
  assigneeId: string;
  currentUserId?: string;
  onAssigneeChange: (value: string) => void;
} => "members" in props;

export function TodosToolbar(props: TodosToolbarProps) {
  const {
    view,
    status,
    search,
    onViewChange,
    onStatusChange,
    onSearchChange,
  } = props;
  const isTeam = isTeamToolbar(props);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div className="flex items-center gap-1">
        <button
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
            view === "kanban"
              ? "bg-[var(--muted)] text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
          }`}
          onClick={() => onViewChange("kanban")}
        >
          <Columns className="h-3.5 w-3.5" />
          Board
        </button>
        <button
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
            view === "table"
              ? "bg-[var(--muted)] text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
          }`}
          onClick={() => onViewChange("table")}
        >
          <List className="h-3.5 w-3.5" />
          Table
        </button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search todos..."
            className="bg-transparent border-[var(--border)] h-9 text-xs focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-transparent">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TODO_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isTeam ? (
          <Select
            value={props.assigneeId}
            onValueChange={props.onAssigneeChange}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs bg-transparent">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {props.members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.fullName || "Teammate"}
                  {member.userId === props.currentUserId ? " (You)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    </div>
  );
}
