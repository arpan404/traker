import { CheckCircle2, ChevronDown, MoreHorizontal } from "lucide-react";
import type { RefObject } from "react";

interface IssueHeaderProps {
  status: string;
  title: string;
  statusColor: { bg: string };
  titleRef: RefObject<HTMLTextAreaElement | null>;
  onTitleChange: (value: string, element: HTMLTextAreaElement) => void;
  onClose?: () => void;
}

export function IssueHeader({
  status,
  title,
  statusColor,
  titleRef,
  onTitleChange,
  onClose,
}: IssueHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: statusColor.bg }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-white/90" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            {status}
          </div>
        </div>
        {onClose && (
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-[var(--muted)]/40 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4 text-[var(--muted-foreground)]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--muted)]/40 rounded-md transition-colors"
            >
              <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
            </button>
          </div>
        )}
      </div>

      <textarea
        ref={titleRef}
        className="w-full bg-transparent text-[28px] font-semibold tracking-[-0.02em] text-[var(--foreground)] outline-none border-none placeholder:opacity-20 resize-none h-auto overflow-hidden leading-[1.15] pb-1"
        value={title}
        rows={1}
        onChange={(event) => onTitleChange(event.target.value, event.target)}
        placeholder="Untitled"
      />
    </div>
  );
}
