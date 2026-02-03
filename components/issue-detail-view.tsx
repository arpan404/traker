import type { Id } from "@/convex/_generated/dataModel";
import type { IssueStatus } from "@/lib/types";
import { IssueHeader } from "./issue-detail/issue-header";
import { IssueProperties } from "./issue-detail/issue-properties";
import { IssueComments } from "./issue-detail/issue-comments";
import { IssueContentSections } from "./issue-detail/issue-content-sections";
import { TagDialog } from "./issue-detail/tag-dialog";
import { useIssueDetailModel } from "@/hooks/use-issue-detail-model";

interface IssueDetailViewProps {
  issueId?: Id<"issues">;
  teamId?: Id<"teams">;
  initialStatus?: IssueStatus;
  onCreated?: (issueId: Id<"issues">) => void;
  onClose?: () => void;
}

export function IssueDetailView({
  issueId,
  teamId,
  initialStatus,
  onCreated,
  onClose,
}: IssueDetailViewProps) {
  const model = useIssueDetailModel({
    issueId,
    teamId,
    initialStatus,
    onCreated,
  });

  if (model.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  const displayIssue = model.displayIssue;

  return (
    <div className="w-full max-w-[720px] mx-auto space-y-6 pb-16 pt-6">
      <IssueHeader
        status={displayIssue.status}
        title={displayIssue.title}
        statusColor={model.getStatusColorVars(displayIssue.status)}
        titleRef={model.titleRef}
        onTitleChange={model.updateTitle}
        onClose={onClose}
      />

      <IssueProperties
        issue={displayIssue}
        members={model.members}
        labels={model.labels}
        issueLabels={model.issueLabels}
        labelsForIssue={model.labelsForIssue}
        statusColor={model.getStatusColorVars(displayIssue.status)}
        onUpdateStatus={model.updateStatus}
        onUpdateAssignee={model.updateAssignee}
        onUpdatePriority={model.updatePriority}
        onToggleLabel={model.toggleLabel}
        onOpenTagModal={() => model.setShowTagModal(true)}
      />

      <IssueComments
        comments={model.comments}
        membersByUserId={model.membersByUserId}
        user={model.user}
        commentDraft={model.commentDraft}
        onCommentDraftChange={model.setCommentDraft}
        onSubmit={model.handleCommentSubmit}
        commentInputRef={model.commentInputRef}
      />

      <IssueContentSections
        issue={displayIssue}
        onUpdateDoc={model.updateDocField}
        onImageUpload={model.handleImageUpload}
      />

      <TagDialog
        open={model.showTagModal}
        name={model.newTagName}
        color={model.newTagColor}
        colorPresets={model.TAG_COLOR_PRESETS}
        onOpenChange={model.setShowTagModal}
        onNameChange={model.setNewTagName}
        onColorChange={model.setNewTagColor}
        onSubmit={model.handleCreateTag}
      />
    </div>
  );
}
