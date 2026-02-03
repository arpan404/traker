import type { Id } from "@/convex/_generated/dataModel";
import type { Issue, Label, Member, IssueStatus } from "@/lib/types";
import { AssigneeBadge } from "./assignee-badge";

interface IssueCardProps {
  issue: Issue;
  labels: Label[];
  assignee?: Member;
  onOpen: (issueId: Id<"issues">) => void;
  isDropTarget?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDropOnCard?: (
    targetId: Id<"issues">,
    status: IssueStatus,
    event: React.DragEvent<HTMLButtonElement>,
  ) => void;
}

export function IssueCard({
  issue,
  labels,
  assignee,
  onOpen,
  isDropTarget,
  onDragEnter,
  onDragLeave,
  onDropOnCard,
}: IssueCardProps) {
  return (
    <button
      className={`glass-panel group/card relative w-full min-w-0 p-4 text-left shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col gap-2 border-white/5 hover:border-[var(--accent)] ${
        isDropTarget
          ? "ring-2 ring-[var(--accent)]/80 shadow-[0_0_0_1px_var(--accent)] scale-[1.01]"
          : ""
      }`}
      onClick={() => onOpen(issue._id)}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", issue._id);
        event.dataTransfer.setData("issueId", issue._id);
        event.dataTransfer.setData("issueStatus", issue.status);
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDropOnCard ? (event) => event.preventDefault() : undefined}
      onDrop={
        onDropOnCard
          ? (event) => onDropOnCard(issue._id, issue.status, event)
          : undefined
      }
      data-status={issue.status}
    >
      {isDropTarget ? (
        <div className="pointer-events-none absolute -top-2 left-3 right-3 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
      ) : null}
      <div className="flex items-start gap-3">
        <div className="mt-1.5 h-3 w-3 rounded-full border-[2.5px] border-[var(--status-text-color)] flex items-center justify-center shrink-0 shadow-sm">
          <div className="h-1 w-1 rounded-full bg-[var(--status-text-color)] opacity-0 group-hover/card:opacity-100 transition-opacity" />
        </div>
        <p className="font-bold text-[14px] leading-snug text-[var(--foreground)] line-clamp-3 break-words whitespace-pre-wrap">
          {issue.title}
        </p>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {labels.map((label) => {
          const color = label.color ?? "#6b7280";
          return (
            <span
              key={label._id}
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: color,
                borderColor: color,
                color: "white",
              }}
            >
              {label.name}
            </span>
          );
        })}
        <span
          className="status-pill text-[10px] px-1.5 py-0.5 rounded"
          data-status={
            issue.priority === "High"
              ? "Won't Fix"
              : issue.priority === "Medium"
                ? "In Review"
                : "Backlog"
          }
        >
          {issue.priority}
        </span>
      </div>

      {issue.assigneeId && (
        <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)] font-bold tabular-nums">
          <div className="flex items-center gap-1.5 ml-auto">
            <AssigneeBadge
              member={assignee}
              fallbackInitial={issue.assigneeId.substring(0, 1)}
            />
            <span className="text-[10px] font-medium truncate max-w-[60px]">
              {assignee?.fullName?.split(" ")[0] ?? issue.assigneeId}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
