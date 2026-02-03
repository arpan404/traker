import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member, TeamTodoDraft as TodoDraft } from "@/lib/types";

interface CreateTodoDialogProps {
  open: boolean;
  draft: TodoDraft;
  members: Member[];
  onOpenChange: (open: boolean) => void;
  onDraftChange: (patch: Partial<TodoDraft>) => void;
  onSubmit: () => void;
}

export function CreateTodoDialog({
  open,
  draft,
  members,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: CreateTodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team todo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
            placeholder="Ship onboarding flow"
          />
          <Select
            value={draft.assigneeId}
            onValueChange={(value) => onDraftChange({ assigneeId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.fullName || "Teammate"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={draft.dueDate}
            onChange={(event) => onDraftChange({ dueDate: event.target.value })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!draft.title.trim()}>
            Create todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
