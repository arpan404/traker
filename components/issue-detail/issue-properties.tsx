import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleDot, PlayCircle, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/constants";
import type { IssuePriority, IssueStatus } from "@/lib/types";

interface IssuePropertiesProps {
  issue: Doc<"issues">;
  members: Doc<"teamMembers">[];
  labels: Doc<"labels">[];
  issueLabels: Doc<"issueLabels">[];
  labelsForIssue: Doc<"labels">[];
  statusColor: { bg: string };
  onUpdateStatus: (status: IssueStatus) => void;
  onUpdateAssignee: (assigneeId?: string) => void;
  onUpdatePriority: (priority: IssuePriority) => void;
  onToggleLabel: (labelId: Id<"labels">) => void;
  onOpenTagModal: () => void;
}

export function IssueProperties({
  issue,
  members,
  labels,
  issueLabels,
  labelsForIssue,
  statusColor,
  onUpdateStatus,
  onUpdateAssignee,
  onUpdatePriority,
  onToggleLabel,
  onOpenTagModal,
}: IssuePropertiesProps) {
  return (
    <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]/80 uppercase tracking-widest">
          <PlayCircle className="h-3 w-3" />
          Status
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor.bg }} />
          <select
            className="bg-transparent text-[13px] font-medium text-[var(--foreground)] outline-none cursor-pointer appearance-none"
            value={issue.status}
            onChange={(event) => onUpdateStatus(event.target.value as IssueStatus)}
          >
            {ISSUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]/80 uppercase tracking-widest">
          <Users className="h-3 w-3" />
          Assigned to
        </div>
        <select
          className={cn(
            "bg-transparent text-[13px] font-medium outline-none cursor-pointer appearance-none",
            !issue.assigneeId
              ? "text-[var(--muted-foreground)]/60"
              : "text-[var(--foreground)]",
          )}
          value={issue.assigneeId ?? ""}
          onChange={(event) =>
            onUpdateAssignee(event.target.value || undefined)
          }
        >
          <option value="">Empty</option>
          {members.map((member) => (
            <option key={member._id} value={member.userId}>
              {member.fullName ?? member.userId}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]/80 uppercase tracking-widest">
          <CircleDot className="h-3 w-3" />
          Priority
        </div>
        <select
          className="bg-transparent text-[13px] font-medium outline-none cursor-pointer appearance-none"
          value={issue.priority ?? ""}
          onChange={(event) =>
            onUpdatePriority(event.target.value as IssuePriority)
          }
        >
          <option value="">Empty</option>
          {ISSUE_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]/80 uppercase tracking-widest">
          <Tag className="h-3 w-3" />
          Tags
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {labelsForIssue.map((label) => {
            const color = label.color ?? "#6b7280";
            return (
              <span
                key={label._id}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-white"
                style={{
                  backgroundColor: color,
                  borderColor: color,
                }}
              >
                {label.name}
              </span>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border border-dashed border-[var(--border)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]/40 transition-colors">
                Add tag
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              {labels.map((label) => {
                const attached = issueLabels.some(
                  (link) => link.labelId === label._id,
                );
                const color = label.color ?? "#6b7280";
                return (
                  <DropdownMenuCheckboxItem
                    key={label._id}
                    checked={attached}
                    onCheckedChange={() => onToggleLabel(label._id)}
                  >
                    <span
                      className="mr-2 inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label.name}
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenTagModal}>
                + New tag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
