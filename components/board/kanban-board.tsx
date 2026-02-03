import { useState, type DragEvent } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ISSUE_STATUSES } from "@/lib/constants";
import type { IssueStatus } from "@/lib/types";
import type { Issue, Label, Member } from "@/lib/types";
import { IssueCard } from "./issue-card";

interface KanbanBoardProps {
  issuesByStatus: Record<IssueStatus, Issue[]>;
  issueLabelsByIssueId: Map<Id<"issues">, Label[]>;
  membersByUserId: Map<string, Member>;
  onDropIssue: (status: IssueStatus, event: DragEvent<HTMLDivElement>) => void;
  onDropIssueOnCard: (
    targetId: Id<"issues">,
    status: IssueStatus,
    event: DragEvent<HTMLButtonElement>,
  ) => void;
  onOpenIssue: (issueId: Id<"issues">) => void;
  onNewIssue: (status: IssueStatus) => void;
  onAddComment?: (issueId: Id<"issues">) => void;
  onDeleteIssue?: (issueId: Id<"issues">) => void;
}

export function KanbanBoard({
  issuesByStatus,
  issueLabelsByIssueId,
  membersByUserId,
  onDropIssue,
  onDropIssueOnCard,
  onOpenIssue,
  onNewIssue,
  onAddComment,
  onDeleteIssue,
}: KanbanBoardProps) {
  const [dropTargetId, setDropTargetId] = useState<Id<"issues"> | null>(null);

  return (
    <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-2 min-w-max">
        {ISSUE_STATUSES.map((status) => (
          <div
            key={status}
            className="flex min-h-[520px] flex-col rounded-md min-w-[220px] max-w-[260px] w-[24vw] shrink-0"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              setDropTargetId(null);
              onDropIssue(status, event);
            }}
          >
            <div
              className="flex items-center justify-between px-1 mb-3 group/col"
              data-status={status}
            >
              <div className="flex items-center gap-2">
                <span className="status-pill">{status}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-bold opacity-40">
                  {issuesByStatus[status]?.length ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm">
                  •••
                </button>
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm">
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-h-[100px]" data-status={status}>
              {(issuesByStatus[status] ?? []).map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  labels={issueLabelsByIssueId.get(issue._id) ?? []}
                  assignee={
                    issue.assigneeId
                      ? membersByUserId.get(issue.assigneeId)
                      : undefined
                  }
                  onOpen={onOpenIssue}
                  isDropTarget={dropTargetId === issue._id}
                  onDropOnCard={onDropIssueOnCard}
                  onDragEnter={() => setDropTargetId(issue._id)}
                  onDragLeave={() => setDropTargetId((current) => (current === issue._id ? null : current))}
                  onAddComment={onAddComment}
                  onDelete={onDeleteIssue}
                />
              ))}
              <button
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-bold text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 transition-colors w-full text-left mt-1"
                onClick={() => onNewIssue(status)}
              >
                <span className="text-sm font-light opacity-60">+</span>
                New issue
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
