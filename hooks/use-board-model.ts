import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import type { DragEvent } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ISSUE_STATUSES } from "@/lib/constants";
import type { BoardView, IssuePriority, IssueStatus } from "@/lib/types";
import type { BoardFilters, Label, Member } from "@/lib/types";

const DEFAULT_FILTERS: BoardFilters = {
  projectId: "",
  assigneeId: "",
  priority: "",
  labelId: "",
  search: "",
};

export function useBoardModel() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useUser();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;

  const [view, setView] = useState<BoardView>("kanban");
  const [sortBy, setSortBy] = useState<"order" | "updated" | "created" | "priority">(
    "order",
  );
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedIssueId, setSelectedIssueId] = useState<Id<"issues"> | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<IssueStatus>("Untriaged");
  const [commentIssueId, setCommentIssueId] = useState<Id<"issues"> | null>(
    null,
  );
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const team = useQuery(
    api.teams.getBySlug,
    slug && isAuthenticated ? { slug } : skip,
  );
  const members = useQuery(
    api.members.list,
    team ? { teamId: team._id } : skip,
  );
  const projects = useQuery(
    api.projects.list,
    team ? { teamId: team._id } : skip,
  );
  const labels = useQuery(api.labels.list, team ? { teamId: team._id } : skip);
  const issueLabels = useQuery(
    api.issueLabels.listByTeam,
    team ? { teamId: team._id } : skip,
  );
  const issues = useQuery(
    api.issues.list,
    team
      ? {
          teamId: team._id,
          projectId: (filters.projectId || undefined) as
            | Id<"projects">
            | undefined,
          assigneeId: filters.assigneeId || undefined,
          priority: (filters.priority || undefined) as
            | IssuePriority
            | undefined,
          labelId: (filters.labelId || undefined) as Id<"labels"> | undefined,
          search: filters.search || undefined,
        }
      : skip,
  );

  const reorderIssue = useMutation(api.issues.reorder);
  const deleteIssue = useMutation(api.issues.remove);
  const createComment = useMutation(api.comments.create);
  const membersByUserId = useMemo(() => {
    return new Map((members ?? []).map((member) => [member.userId, member]));
  }, [members]);

  const labelsById = useMemo(() => {
    return new Map((labels ?? []).map((label) => [label._id, label]));
  }, [labels]);

  const issueLabelsByIssueId = useMemo(() => {
    const map = new Map<Id<"issues">, Label[]>();
    if (!issueLabels?.length || !labelsById.size) return map;
    for (const link of issueLabels) {
      const label = labelsById.get(link.labelId);
      if (!label) continue;
      const list = map.get(link.issueId) ?? [];
      list.push(label);
      map.set(link.issueId, list);
    }
    return map;
  }, [issueLabels, labelsById]);

  const filteredIssues = useMemo(() => {
    const list = issues ?? [];
    if (view === "mine") {
      return list.filter((issue) => issue.assigneeId === user?.id);
    }
    if (view === "untriaged") {
      return list.filter((issue) => issue.status === "Untriaged");
    }
    if (view === "completed") {
      return list.filter((issue) => issue.status === "Resolved");
    }
    return list;
  }, [issues, user?.id, view]);

  const sortedIssues = useMemo(() => {
    if (sortBy === "order") return filteredIssues;
    const list = [...filteredIssues];
    if (sortBy === "created") {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (sortBy === "updated") {
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    const priorityRank: Record<IssuePriority, number> = {
      Urgent: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };
    return list.sort(
      (a, b) => priorityRank[b.priority] - priorityRank[a.priority],
    );
  }, [filteredIssues, sortBy]);

  const issuesByStatus = useMemo(() => {
    return ISSUE_STATUSES.reduce((acc, status) => {
      acc[status] = sortedIssues.filter((issue) => issue.status === status);
      return acc;
    }, {} as Record<IssueStatus, typeof filteredIssues>);
  }, [sortedIssues]);

  const openCreate = useCallback((status?: IssueStatus) => {
    setSelectedIssueId(null);
    setCreateStatus(status ?? "Untriaged");
    setIsCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  const openIssue = useCallback((issueId: Id<"issues">) => {
    setSelectedIssueId(issueId);
    setIsCreateOpen(false);
  }, []);

  const closeIssue = useCallback(() => {
    setSelectedIssueId(null);
    setIsCreateOpen(false);
  }, []);

  const handleDrop = useCallback(
    async (status: IssueStatus, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const issueId =
        (event.dataTransfer.getData("issueId") ||
          event.dataTransfer.getData("text/plain")) as Id<"issues">;
      if (!issueId) return;
      await reorderIssue({ issueId, status });
    },
    [reorderIssue],
  );

  const handleDropOnCard = useCallback(
    async (
      targetId: Id<"issues">,
      status: IssueStatus,
      event: DragEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      const issueId =
        (event.dataTransfer.getData("issueId") ||
          event.dataTransfer.getData("text/plain")) as Id<"issues">;
      if (!issueId || issueId === targetId) return;
      await reorderIssue({ issueId, status, beforeId: targetId });
    },
    [reorderIssue],
  );


  const handleIssueCreated = useCallback((issueId: Id<"issues">) => {
    setIsCreateOpen(false);
    setSelectedIssueId(issueId);
  }, []);

  const openComment = useCallback((issueId: Id<"issues">) => {
    setCommentIssueId(issueId);
    setCommentText("");
    setCommentOpen(true);
  }, []);

  const closeComment = useCallback(() => {
    setCommentOpen(false);
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!commentIssueId) return;
    const text = commentText.trim();
    if (!text) return;
    await createComment({
      issueId: commentIssueId,
      bodyDoc: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
      },
    });
    setCommentText("");
    setCommentOpen(false);
  }, [commentIssueId, commentText, createComment]);

  const handleDeleteIssue = useCallback(async (issueId: Id<"issues">) => {
    await deleteIssue({ issueId });
    if (selectedIssueId === issueId) {
      setSelectedIssueId(null);
      setIsCreateOpen(false);
    }
    if (commentIssueId === issueId) {
      setCommentOpen(false);
      setCommentIssueId(null);
    }
  }, [commentIssueId, deleteIssue, selectedIssueId]);

  const isLoading =
    isConvexLoading ||
    !isAuthenticated ||
    !team ||
    !issues ||
    !members ||
    !projects ||
    !labels ||
    !issueLabels;

  return {
    view,
    setView,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    selectedIssueId,
    isCreateOpen,
    createStatus,
    openCreate,
    closeCreate,
    openIssue,
    closeIssue,
    handleIssueCreated,
    handleDrop,
    handleDropOnCard,
    commentIssueId,
    commentOpen,
    setCommentOpen,
    commentText,
    setCommentText,
    openComment,
    closeComment,
    handleAddComment,
    handleDeleteIssue,
    isLoading,
    team,
    members: members ?? [],
    projects: projects ?? [],
    labels: labels ?? [],
    issueLabels: issueLabels ?? [],
    issues: issues ?? [],
    filteredIssues: sortedIssues,
    issuesByStatus,
    membersByUserId,
    issueLabelsByIssueId,
  };
}
