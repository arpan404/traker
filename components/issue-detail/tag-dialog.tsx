import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TagDialogProps {
  open: boolean;
  name: string;
  color: string;
  colorPresets: readonly string[];
  onOpenChange: (open: boolean) => void;
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: () => void;
}

export function TagDialog({
  open,
  name,
  color,
  colorPresets,
  onOpenChange,
  onNameChange,
  onColorChange,
  onSubmit,
}: TagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
            Name
          </label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Bug, Feature, ..."
          />
          <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={cn(
                  "h-7 w-7 rounded-full border transition-transform",
                  color === preset
                    ? "ring-2 ring-[var(--foreground)]/60 scale-105"
                    : "border-[var(--border)]",
                )}
                style={{ backgroundColor: preset }}
                onClick={() => onColorChange(preset)}
                aria-label={`Pick ${preset}`}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <button
            className="rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)]"
            onClick={onSubmit}
          >
            Create Tag
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
