import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PersonalTodoDraft as TodoDraft } from "@/lib/types";

interface CreateTodoDialogProps {
  open: boolean;
  draft: TodoDraft;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (patch: Partial<TodoDraft>) => void;
  onSubmit: () => void;
}

export function CreateTodoDialog({
  open,
  draft,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: CreateTodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-[var(--border)] bg-[var(--card)] p-0 overflow-hidden shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Create New Todo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted-foreground)]">
                Description
              </label>
              <Input
                value={draft.title}
                onChange={(event) =>
                  onDraftChange({ title: event.target.value })
                }
                placeholder="Finish monthly report..."
                className="h-11 bg-[var(--background)] border-[var(--border)] focus:ring-1 focus:ring-[var(--accent)] text-sm font-medium"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted-foreground)]">
                Due Date
              </label>
              <Input
                type="date"
                value={draft.dueDate}
                onChange={(event) =>
                  onDraftChange({ dueDate: event.target.value })
                }
                className="h-11 bg-[var(--background)] border-[var(--border)] focus:ring-1 focus:ring-[var(--accent)] text-sm"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] p-6 bg-[var(--muted)]/30 flex items-center justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={onSubmit}
            disabled={!draft.title.trim()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-8 font-bold shadow-sm"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
