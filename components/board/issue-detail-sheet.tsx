import type { Id } from "@/convex/_generated/dataModel";
import type { IssueStatus } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IssueDetailView } from "@/components/issue-detail-view";

interface IssueDetailSheetProps {
  open: boolean;
  issueId?: Id<"issues"> | null;
  teamId?: Id<"teams">;
  initialStatus?: IssueStatus;
  onCreated?: (issueId: Id<"issues">) => void;
  onClose: () => void;
}

export function IssueDetailSheet({
  open,
  issueId,
  teamId,
  initialStatus,
  onCreated,
  onClose,
}: IssueDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        className="sm:max-w-4xl overflow-y-auto bg-[var(--background)] outline-none focus:outline-0"
        side="right"
      >
        <div className="sr-only">
          <SheetHeader>
            <SheetTitle>Issue details</SheetTitle>
          </SheetHeader>
        </div>
        {open ? (
          <div className="p-4 sm:p-8">
            <IssueDetailView
              key={issueId ?? "draft"}
              issueId={issueId ?? undefined}
              teamId={teamId}
              initialStatus={initialStatus}
              onCreated={onCreated}
              onClose={onClose}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
