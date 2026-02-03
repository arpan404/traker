import type { Id } from "@/convex/_generated/dataModel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/constants";
import type { IssueDraft, Member, Project } from "@/lib/types";

interface CreateIssueSheetProps {
  open: boolean;
  draft: IssueDraft;
  members: Member[];
  projects: Project[];
  onOpenChange: (open: boolean) => void;
  onDraftChange: (patch: Partial<IssueDraft>) => void;
  onSubmit: () => void;
}

export function CreateIssueSheet({
  open,
  draft,
  members,
  projects,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: CreateIssueSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto" side="right">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-[var(--foreground)]">
            Create New Issue
          </h2>
          <div className="grid gap-6">
            <div className="grid gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Title
              </label>
              <input
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                value={draft.title}
                onChange={(event) =>
                  onDraftChange({ title: event.target.value })
                }
                placeholder="Describe the issue"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Status
                </label>
                <select
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={draft.status}
                  onChange={(event) =>
                    onDraftChange({
                      status: event.target.value as typeof ISSUE_STATUSES[number],
                    })
                  }
                >
                  {ISSUE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Priority
                </label>
                <select
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={draft.priority}
                  onChange={(event) =>
                    onDraftChange({
                      priority: event.target.value as typeof ISSUE_PRIORITIES[number],
                    })
                  }
                >
                  {ISSUE_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Assignee
                </label>
                <select
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={draft.assigneeId}
                  onChange={(event) =>
                    onDraftChange({ assigneeId: event.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member.userId}>
                      {member.fullName ?? member.userId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Project
                </label>
                <select
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={draft.projectId}
                  onChange={(event) =>
                    onDraftChange({
                      projectId: event.target.value as Id<"projects"> | "",
                    })
                  }
                >
                  <option value="">None</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.key}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary-foreground)] shadow-[var(--shadow-md)] hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={!draft.title.trim()}
              onClick={onSubmit}
            >
              Create and Open
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
