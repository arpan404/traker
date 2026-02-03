import { useEffect, useMemo, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ISSUE_TAG_COLOR_PRESETS } from "@/lib/constants";
import type { IssuePriority, IssueStatus } from "@/lib/types";

type IssueDetailParams = {
  issueId?: Id<"issues"> | null;
  teamId?: Id<"teams">;
  initialStatus?: IssueStatus;
  onCreated?: (issueId: Id<"issues">) => void;
};

type DraftDocs = {
  summaryDoc?: JSONContent;
  detailsDoc?: JSONContent;
  impactDoc?: JSONContent;
  stepsTakenDoc?: JSONContent;
  nextStepsDoc?: JSONContent;
};

export function useIssueDetailModel({
  issueId,
  teamId,
  initialStatus,
  onCreated,
}: IssueDetailParams) {
  const convex = useConvex();
  const { user } = useUser();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;

  const [localIssueId, setLocalIssueId] = useState<Id<"issues"> | null>(
    issueId ?? null,
  );
  const [draftTitle, setDraftTitle] = useState("");
  const [draftStatus, setDraftStatus] = useState<IssueStatus>(
    initialStatus ?? "Untriaged",
  );
  const [draftPriority, setDraftPriority] = useState<IssuePriority>("Medium");
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | undefined>();
  const [draftDocs, setDraftDocs] = useState<DraftDocs>({});

  const creatingRef = useRef<Promise<Id<"issues">> | null>(null);

  const resolvedIssueId = issueId ?? localIssueId;


  const issue = useQuery(
    api.issues.get,
    resolvedIssueId && isAuthenticated ? { issueId: resolvedIssueId } : skip,
  );
  const resolvedTeamId = issue?.teamId ?? teamId;
  const comments = useQuery(
    api.comments.list,
    resolvedIssueId && isAuthenticated ? { issueId: resolvedIssueId } : skip,
  );
  const members = useQuery(
    api.members.list,
    resolvedTeamId && isAuthenticated ? { teamId: resolvedTeamId } : skip,
  );
  const labels = useQuery(
    api.labels.list,
    resolvedTeamId && isAuthenticated ? { teamId: resolvedTeamId } : skip,
  );
  const issueLabels = useQuery(
    api.issueLabels.listByIssue,
    resolvedIssueId && isAuthenticated ? { issueId: resolvedIssueId } : skip,
  );

  const createIssue = useMutation(api.issues.create);
  const updateIssue = useMutation(api.issues.update);
  const createComment = useMutation(api.comments.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.create);
  const createLabel = useMutation(api.labels.create);
  const toggleIssueLabel = useMutation(api.issueLabels.toggle);

  const [commentDraft, setCommentDraft] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const titleValue = issue?.title ?? draftTitle;

  useEffect(() => {
    if (!titleRef.current) return;
    titleRef.current.style.height = "auto";
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  }, [titleValue]);

  const ensureIssue = async () => {
    if (resolvedIssueId) return resolvedIssueId;
    if (!resolvedTeamId) return null;
    if (!creatingRef.current) {
      const payload = {
        teamId: resolvedTeamId,
        title: draftTitle.trim() || "Untitled issue",
        status: draftStatus,
        priority: draftPriority,
        assigneeId: draftAssigneeId || undefined,
      };
      creatingRef.current = createIssue(payload)
        .then((newIssueId) => {
          setLocalIssueId(newIssueId);
          onCreated?.(newIssueId);
          return newIssueId;
        })
        .finally(() => {
          creatingRef.current = null;
        });
    }
    return creatingRef.current;
  };


  const membersByUserId = useMemo(() => {
    return new Map((members ?? []).map((member) => [member.userId, member]));
  }, [members]);

  const labelsById = useMemo(() => {
    return new Map((labels ?? []).map((label) => [label._id, label]));
  }, [labels]);

  const labelsForIssue = useMemo(() => {
    if (!issueLabels?.length) return [];
    return issueLabels
      .map((link) => labelsById.get(link.labelId))
      .filter((label): label is NonNullable<typeof label> => Boolean(label));
  }, [issueLabels, labelsById]);

  const isLoading =
    isConvexLoading ||
    !isAuthenticated ||
    (resolvedTeamId && (!members || !labels)) ||
    (resolvedIssueId && (!issue || !comments || !issueLabels));

  const updateDocField =
    (field: string) => async (doc: JSONContent) => {
      if (!resolvedIssueId && isDocEmpty(doc)) {
        return;
      }
      setDraftDocs((prev) => ({ ...prev, [field]: doc }));
      const issueIdForUpdate = await ensureIssue();
      if (!issueIdForUpdate) return;
      await updateIssue({ issueId: issueIdForUpdate, patch: { [field]: doc } });
    };

  const isDocEmpty = (doc?: JSONContent | null) => {
    const content = doc?.content as JSONContent[] | undefined;
    if (!content || !Array.isArray(content) || content.length === 0) {
      return true;
    }
    if (content.length === 1 && content[0]?.type === "paragraph") {
      const text =
        content[0]?.content
          ?.map((node) => (typeof node.text === "string" ? node.text : ""))
          .join("") ?? "";
      return text.trim().length === 0;
    }
    return false;
  };

  const defaultDocFor = (text: string): JSONContent => ({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

  const handleCommentSubmit = async () => {
    const text = commentDraft.trim();
    if (!text) return;
    const issueIdForUpdate = await ensureIssue();
    if (!issueIdForUpdate || !resolvedTeamId) return;
    await createComment({
      issueId: issueIdForUpdate,
      bodyDoc: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
      },
    });
    setCommentDraft("");
  };

  const handleImageUpload = async (file: File) => {
    if (!resolvedTeamId) return null;
    const issueIdForUpdate = await ensureIssue();
    if (!issueIdForUpdate) return null;
    const uploadUrl = await generateUploadUrl({ teamId: resolvedTeamId });
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) return null;
    const { storageId } = (await response.json()) as { storageId?: string };
    if (!storageId) return null;
    await createFile({
      teamId: resolvedTeamId,
      issueId: issueIdForUpdate,
      storageId: storageId as Id<"_storage">,
      mimeType: file.type,
      size: file.size,
    });
    const url = await convex.query(api.files.getUrl, {
      teamId: resolvedTeamId,
      storageId: storageId as Id<"_storage">,
    });
    return url ?? null;
  };

  const getStatusColorVars = (status: string) => {
    switch (status) {
      case "Resolved":
        return { bg: "var(--status-green)", text: "var(--status-green-text)" };
      case "Won't Fix":
      case "Won’t Fix":
        return { bg: "var(--status-red)", text: "var(--status-red-text)" };
      case "In Progress":
        return { bg: "var(--status-blue)", text: "var(--status-blue-text)" };
      case "Testing":
        return {
          bg: "var(--status-purple)",
          text: "var(--status-purple-text)",
        };
      case "In Review":
        return {
          bg: "var(--status-yellow)",
          text: "var(--status-yellow-text)",
        };
      default:
        return { bg: "var(--status-grey)", text: "var(--status-grey-text)" };
    }
  };

  const updateTitle = (value: string, element: HTMLTextAreaElement) => {
    setDraftTitle(value);
    if (!resolvedIssueId && !value.trim()) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
      return;
    }
    void ensureIssue().then((issueIdForUpdate) => {
      if (!issueIdForUpdate) return;
      updateIssue({
        issueId: issueIdForUpdate,
        patch: { title: value },
      });
    });
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const updateStatus = (status: IssueStatus) => {
    setDraftStatus(status);
    return ensureIssue().then((issueIdForUpdate) => {
      if (!issueIdForUpdate) return;
      return updateIssue({
        issueId: issueIdForUpdate,
        patch: { status },
      });
    });
  };

  const updateAssignee = (assigneeId?: string) => {
    setDraftAssigneeId(assigneeId);
    return ensureIssue().then((issueIdForUpdate) => {
      if (!issueIdForUpdate) return;
      return updateIssue({
        issueId: issueIdForUpdate,
        patch: { assigneeId },
      });
    });
  };

  const updatePriority = (priority: IssuePriority) => {
    setDraftPriority(priority);
    return ensureIssue().then((issueIdForUpdate) => {
      if (!issueIdForUpdate) return;
      return updateIssue({
        issueId: issueIdForUpdate,
        patch: { priority },
      });
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !resolvedTeamId) return;
    await createLabel({
      teamId: resolvedTeamId,
      name: newTagName.trim(),
      color: newTagColor || undefined,
    });
    setNewTagName("");
    setNewTagColor("#6366f1");
    setShowTagModal(false);
  };

  const toggleLabel = (labelId: Id<"labels">) => {
    return ensureIssue().then((issueIdForUpdate) => {
      if (!issueIdForUpdate || !resolvedTeamId) return;
      return toggleIssueLabel({
        teamId: resolvedTeamId,
        issueId: issueIdForUpdate,
        labelId,
      });
    });
  };

  const draftTimestamp = 0;

  const displayIssue =
    issue ??
    ({
      _id: (resolvedIssueId ?? "draft") as Id<"issues">,
      teamId: (resolvedTeamId ?? "draft") as Id<"teams">,
      projectId: undefined,
      title: draftTitle,
      status: draftStatus,
      priority: draftPriority,
      type: undefined,
      assigneeId: draftAssigneeId,
      reporterId: user?.id ?? "draft",
      _creationTime: draftTimestamp,
      order: draftTimestamp,
      summaryDoc: draftDocs.summaryDoc,
      detailsDoc: draftDocs.detailsDoc,
      impactDoc: draftDocs.impactDoc,
      stepsTakenDoc: draftDocs.stepsTakenDoc,
      nextStepsDoc: draftDocs.nextStepsDoc,
      createdAt: draftTimestamp,
      updatedAt: draftTimestamp,
    } as const);

  return {
    issue,
    displayIssue,
    comments: comments ?? [],
    members: members ?? [],
    labels: labels ?? [],
    issueLabels: issueLabels ?? [],
    membersByUserId,
    labelsForIssue,
    isLoading,
    user,
    titleRef,
    commentInputRef,
    commentDraft,
    setCommentDraft,
    showTagModal,
    setShowTagModal,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    getStatusColorVars,
    updateTitle,
    updateStatus,
    updateAssignee,
    updatePriority,
    updateDocField,
    isDocEmpty,
    defaultDocFor,
    handleCommentSubmit,
    handleImageUpload,
    handleCreateTag,
    toggleLabel,
    TAG_COLOR_PRESETS: ISSUE_TAG_COLOR_PRESETS,
  };
}
