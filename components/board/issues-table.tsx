import type { Id } from "@/convex/_generated/dataModel";
import type { Issue, Member } from "@/lib/types";
import { AssigneeBadge } from "./assignee-badge";

interface IssuesTableProps {
  issues: Issue[];
  membersByUserId: Map<string, Member>;
  onOpenIssue: (issueId: Id<"issues">) => void;
}

export function IssuesTable({
  issues,
  membersByUserId,
  onOpenIssue,
}: IssuesTableProps) {
  return (
    <div className="glass-panel overflow-hidden border-none shadow-xl">
      <div className="grid grid-cols-[minmax(220px,_3fr)_1fr_1fr_1.5fr_1fr] gap-3 border-b border-white/5 bg-white/5 backdrop-blur-md px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        <span>Issue</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Assignee</span>
        <span>Project</span>
      </div>
      <div className="divide-y divide-white/5 overflow-auto bg-transparent">
        {issues.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No issues in this view.
          </div>
        ) : (
          issues.map((issue) => {
            const assignee = issue.assigneeId
              ? membersByUserId.get(issue.assigneeId)
              : undefined;

            return (
              <button
                key={issue._id}
                className="grid w-full grid-cols-[minmax(220px,_3fr)_1fr_1fr_1.5fr_1fr] gap-3 px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors group"
                onClick={() => onOpenIssue(issue._id)}
                data-status={issue.status}
              >
                <span className="font-medium group-hover:text-[var(--accent)] transition-colors">
                  {issue.title}
                </span>
                <div className="flex items-center">
                  <span className="status-pill inline-flex items-center rounded-full px-2 py-0.5 text-[10px]">
                    {issue.status}
                  </span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)] flex items-center">
                  {issue.priority}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] flex items-center truncate gap-2">
                  {issue.assigneeId ? (
                    <>
                      <AssigneeBadge
                        member={assignee}
                        fallbackInitial={issue.assigneeId.substring(0, 1)}
                      />
                      {assignee?.fullName ?? issue.assigneeId}
                    </>
                  ) : (
                    "Unassigned"
                  )}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] flex items-center">
                  {issue.projectId ?? "—"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
